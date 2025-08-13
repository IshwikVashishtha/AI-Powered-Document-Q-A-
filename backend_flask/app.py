from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import fitz 
import docx

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") # Your api_key
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# In-memory Data Storage 
document_chunks = []
vector_store = None
# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

#  Text Extraction Functions 
def extract_text_from_pdf(file_stream):
    """Extracts text from a PDF file stream."""
    text = ""
    with fitz.open(stream=file_stream, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def extract_text_from_docx(file_stream):
    """Extracts text from a DOCX file stream."""
    doc = docx.Document(file_stream)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(file_stream):
    """Extracts text from a TXT file stream."""
    return file_stream.read().decode('utf-8')


def create_vector_store(chunks):
    """Creates a FAISS vector store from document chunks."""
    global vector_store
    if not chunks:
        vector_store = None
        return
    # Encode the chunks into embeddings
    embeddings = model.encode(chunks, convert_to_tensor=False)
    dimension = embeddings.shape[1]
    # Create a FAISS index
    vector_store = faiss.IndexFlatL2(dimension)
    # Add the embeddings to the index
    vector_store.add(np.array(embeddings, dtype=np.float32))

def preprocess_text(text):
    """Splits text into smaller chunks by paragraph."""
    # A simple chunking strategy split by double newlines
    return [p.strip() for p in text.split('\n\n') if p.strip()]

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles file upload, processing, and vectorization for various formats."""
    global document_chunks, vector_store
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        file_stream = file.stream
        filename = file.filename
        text = ""

        if filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(file_stream)
        elif filename.lower().endswith('.docx'):
            text = extract_text_from_docx(file_stream)
        elif filename.lower().endswith('.txt') or filename.lower().endswith('.csv'):
            text = extract_text_from_txt(file_stream)
        else:
            return jsonify({"error": "Unsupported file type. Please upload PDF, DOCX, TXT, or CSV."}), 400

        document_chunks = preprocess_text(text)
        create_vector_store(document_chunks)
        return jsonify({"message": f"Successfully uploaded and processed {filename}"})
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

def get_relevant_context(question):
    """Retrieves relevant document chunks based on the question using semantic search."""
    if not vector_store or not document_chunks:
        return ""
    
    # Create an embedding for the user's question
    question_embedding = model.encode([question], convert_to_tensor=False)
    # Set the number of relevant chunks to retrieve
    k = min(5, len(document_chunks)) 
    # Search the faiss index for the most similar chunks
    distances, indices = vector_store.search(np.array(question_embedding, dtype=np.float32), k)
    
    # Combine the relevant chunks into a single context string
    context = "\n".join([document_chunks[i] for i in indices[0]])
    return context

def ask_gemini(question, context):
    """Gets an answer from the Gemini API."""
    if not GEMINI_API_KEY:
        return "Gemini API key is not configured."
        
    prompt = f"Based on the following context, answer the question.\n\nContext:\n{context}\n\nQuestion: {question}"
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error with Gemini API: {str(e)}"

def ask_ollama(question, context, model_name="llama2"):
    """Gets an answer from a local Ollama model."""
    prompt = f"Based on the following context, answer the question.\n\nContext:\n{context}\n\nQuestion: {question}"
    
    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False
            }
        )
        response.raise_for_status()
        return response.json().get("response", "No response from Ollama.")
    except requests.exceptions.RequestException as e:
        return f"Could not connect to Ollama at {OLLAMA_HOST}. Is it running?"
    except Exception as e:
        return f"Error with Ollama: {str(e)}"

@app.route('/ask', methods=['POST'])
def ask_question():
    """Handles a user's question and returns an answer from the selected LLM."""
    data = request.get_json()
    question = data.get('question')
    llm_service = data.get('llm_service', 'gemini')
    ollama_model = data.get('ollama_model', 'llama2')

    if not question:
        return jsonify({"error": "No question provided"}), 400
    
    context = get_relevant_context(question)

    if not context:
        answer = "I could not find relevant information in the uploaded document to answer that question. Please try asking something else."
    elif llm_service == 'gemini':
        answer = ask_gemini(question, context)
    elif llm_service == 'ollama':
        answer = ask_ollama(question, context, ollama_model)
    else:
        return jsonify({"error": "Invalid LLM service selected"}), 400

    return jsonify({"answer": answer})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
