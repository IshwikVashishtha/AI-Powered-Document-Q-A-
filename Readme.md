# AI Document Q&A Agent

This project is a full-stack web application that allows you to chat with your documents. You can upload a variety of document types (PDF, DOCX, TXT, CSV), and the application will use a Large Language Model (LLM) to answer your questions based on the document's content.

The application leverages semantic search with a vector database to find the most relevant parts of the document to answer your questions accurately. It provides the flexibility to use either the powerful cloud-based Gemini API or a locally running LLM via Ollama.

## Features

-   **Multi-Format Document Support:** Upload and process `.pdf`, `.docx`, `.txt`, and `.csv` files.
-   **Semantic Search:** Uses vector embeddings (via `sentence-transformers` and FAISS) to find the most contextually relevant information in your document.
-   **Flexible LLM Integration:**
    -   Connect to Google's **Gemini API** for powerful, cloud-based text generation.
    -   Connect to a local **Ollama** instance to run various open-source models (like Llama, Mistral, etc.) for offline and private processing.
-   **Separated Frontend and Backend:**
    -   A modern, responsive frontend built with **React** and **Vite**.
    -   A robust backend API built with **Flask**.
-   **User-Friendly Interface:** Clean UI with notifications for upload status and errors, which automatically disappear.

## Tech Stack

| Component | Technology                                                                                             |
| :-------- | :----------------------------------------------------------------------------------------------------- |
| **Frontend** | [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [axios](https://axios-http.com/) |
| **Backend** | [Flask](https://flask.palletsprojects.com/), [python-dotenv](https://pypi.org/project/python-dotenv/) |
| **AI/ML** | [Google Gemini API](https://ai.google.dev/), [Ollama](https://ollama.com/), [Sentence-Transformers](https://www.sbert.net/), [FAISS](https://faiss.ai/) |
| **File Proc.**| [PyMuPDF](https://pypi.org/project/PyMuPDF/) (for PDFs), [python-docx](https://pypi.org/project/python-docx/) (for DOCX) | 

## Project Structure  

document-q-and-a/
├── ai-agent-backend/
│   ├── venv/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables (API keys)
│
└── ai-agent-frontend/
├── node_modules/
├── public/
├── src/
│   ├── App.jsx         # Main React component
│   └── index.css       # Tailwind CSS directives
├── index.html          # Main HTML file with CDN link
├── package.json
└── ...                 # Other Vite and config files


## Setup and Installation

### Prerequisites

-   [Python 3.8+](https://www.python.org/downloads/) and `pip`
-   [Node.js](https://nodejs.org/en/) (which includes `npm`)
-   An API key for the [Google Gemini API](https://aistudio.google.com/app/apikey).
-   (Optional) [Ollama](https://ollama.com/) installed and a model pulled (e.g., `ollama pull llama2`).

### 1. Backend Setup (Flask)

1.  **Clone the repository and navigate to the backend folder:**
    ```bash
    cd ai-agent-backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # On macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # On Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create an environment file:**
    Create a file named `.env` in the `ai-agent-backend` directory.

5.  **Add your Gemini API key to the `.env` file:**
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

6.  **Run the Flask server:**
    ```bash
    python app.py
    ```
    The backend will be running on `http://localhost:5001`.

### 2. Frontend Setup (React + Vite)

1.  **Navigate to the frontend folder in a new terminal:**
    ```bash
    cd ai-agent-frontend
    ```

2.  **Install the required npm packages:**
    ```bash
    npm install
    ```
    *(Note: If you followed the CDN setup for Tailwind CSS, you only need `axios`. If you want to use the npm version of Tailwind, follow the instructions in the chat history to install and configure it).*

3.  **Run the React development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running on `http://localhost:5173` (or the next available port).

## How to Use

1.  Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2.  Click the **"Upload Document"** button to select a `.pdf`, `.docx`, `.txt`, or `.csv` file.
3.  Select your desired AI model: **Gemini (Cloud)** or **Ollama (Local)**. If using Ollama, you can specify the model name.
4.  Once the document is successfully processed, the question input box will become active.
5.  Type your question about the document and click **"Get Answer"**.
6.  The answer generated by the AI will appear in the dark-themed answer box below.

## Future Improvements

-   **Support for More Formats:** Add support for other document types like `.pptx` or `.html`.
-   **Chat History:** Implement a conversational interface that remembers previous questions and answers.
-   **Persistent Vector Store:** Replace the in-memory FAISS database with a persistent solution like ChromaDB or Pinecone to avoid re-processing documents on every server restart.
-   **Streaming Responses:** Stream the LLM's response token-by-token for a more interactive, real-time feel.
-   **Dockerize the Application:** Create `Dockerfile`s for the frontend and backend to simplify deployment.
