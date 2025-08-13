import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [llmService, setLlmService] = useState('gemini');
  const [ollamaModel, setOllamaModel] = useState('llama2');
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');



  useEffect(()=>{
    if (error || uploadStatus){
      const time = setTimeout(() => {
        setError('')
        // setUploadStatus('')
      },5000);
      return () => clearTimeout(time)
    }
  })
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus('');
    setError('');
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    setError('');
    setUploadStatus('');
    try {
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus(response.data.message);
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.error || 'File upload failed. Please check the server.';
      setError(errorMessage);
      setUploadStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question) {
      setError('Please enter a question.');
      return;
    }
    setIsLoading(true);
    setAnswer('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/ask', {
        question,
        llm_service: llmService,
        ollama_model: ollamaModel,
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred while getting the answer.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-2xl p-8 m-4 space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white mb-2">AI Document Agent</h1>
          <p className="text-gray-300">Upload a document and get answers from your own AI.</p>
        </div>

        {error && <div className="bg-gray-900 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
        {uploadStatus && <div className="bg-gray-900 border border-green-400 text-green-700 px-4 py-3 rounded-lg" role="alert">{uploadStatus}</div>}


        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-200">1. Upload Your Document</h2>
          <div className="flex items-center space-x-4">
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.docx,.txt,.csv"
            />
            <button onClick={handleFileUpload} disabled={isLoading || !file} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:bg-black disabled:cursor-not-allowed">
              {isLoading && uploadStatus === '' ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-200">2. Select Your AI Model</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <select value={llmService} onChange={(e) => setLlmService(e.target.value)} className="p-2 border border-none rounded-md w-full text-white bg-gray-900">
                    <option value="gemini">Gemini (Cloud)</option>
                    <option value="ollama">Ollama (Local)</option>
                </select>
                {llmService === 'ollama' && (
                    <input type="text" value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} className="p-2 bg-gray-900 text-white border border-none rounded-md w-full" placeholder="Ollama Model Name (e.g., llama2)" />
                )}
            </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-200">3. Ask a Question</h2>
          <textarea
            className="w-full p-4 bg-gray-900 text-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="e.g., What is the main topic of the document?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!uploadStatus}
          />
          <button onClick={handleAskQuestion} disabled={isLoading || !question || !uploadStatus} className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-black disabled:cursor-not-allowed">
            {isLoading && answer === '' ? 'Thinking...' : 'Get Answer'}
          </button>
        </div>

        {isLoading && answer === '' && (
            <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )}

        {answer && (
          <div className="p-6 bg-gray-900 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Answer:</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
