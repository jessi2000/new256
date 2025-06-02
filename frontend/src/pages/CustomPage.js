import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Code,
  Terminal,
  Copy,
  AlertCircle,
  CheckCircle,
  Clock,
  FileCode,
  FolderOpen,
  RefreshCw,
  Upload,
  File,
  X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomPage = () => {
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [executionResult, setExecutionResult] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await axios.get(`${API}/custom-scripts`);
      setScripts(response.data);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      toast.error('Failed to load custom scripts');
    } finally {
      setLoading(false);
    }
  };

  const executeScript = async (scriptName) => {
    setIsExecuting(true);
    setExecutionResult('');
    
    try {
      const response = await axios.post(`${API}/execute-script`, {
        script_name: scriptName
      });
      
      setExecutionResult(response.data.output);
      setShowResultModal(true);
      toast.success('Script executed successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Script execution failed';
      setExecutionResult(`Error: ${errorMsg}`);
      setShowResultModal(true);
      toast.error('Script execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const refreshScripts = () => {
    setLoading(true);
    fetchScripts();
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API}/upload-file-for-script`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadedFile({
        name: file.name,
        size: file.size,
        uploadedAt: new Date()
      });
      
      toast.success(`File "${file.name}" uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    toast.success('File removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Terminal size={40} className="text-blue-400 mr-3" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
            Custom Scripts
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload files and run custom analysis scripts for advanced forensic examination
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">File Upload</h3>
          
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400">Uploading file...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload size={48} className="mx-auto text-gray-500" />
                  <div>
                    <p className="text-lg font-medium text-gray-300 mb-2">
                      Drop a file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Files will be used as input for the selected script
                    </p>
                  </div>
                  <label className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer">
                    <Upload size={16} />
                    <span>Choose File</span>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <File size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-200">{uploadedFile.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {formatFileSize(uploadedFile.size)} • Uploaded {uploadedFile.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeUploadedFile}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Remove file"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scripts List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Script Library</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-700 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : scripts.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-xl">
                <Code size={48} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No custom scripts found</h3>
                <p className="text-gray-500 mb-4">Add scripts manually to the custom-scripts directory</p>
                <div className="bg-gray-700/30 rounded-lg p-4 text-left max-w-md mx-auto">
                  <p className="text-sm text-gray-400 mb-2">Example config.json:</p>
                  <pre className="text-xs text-gray-300">
{`{
  "name": "Test Script",
  "command": "python script.py",
  "description": "A test script"
}`}
                  </pre>
                </div>
              </div>
            ) : (
              scripts.map((script) => (
                <div
                  key={script.name}
                  className={`bg-gradient-to-r from-gray-800 to-gray-900 border rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedScript?.name === script.name
                      ? 'border-slate-500 shadow-lg shadow-slate-500/25'
                      : 'border-gray-700 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/10'
                  }`}
                  onClick={() => setSelectedScript(script)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-slate-600/20 rounded-lg">
                          <Code size={20} className="text-slate-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-100">{script.name}</h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{script.description || 'No description available'}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Terminal size={14} />
                          <span>{script.command}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{new Date(script.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeScript(script.name);
                        }}
                        disabled={isExecuting}
                        className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Execute Script"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Execution Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Execution Results</h3>
            
            {selectedScript ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Terminal size={20} className="text-slate-400" />
                    <h4 className="text-lg font-semibold text-gray-200">{selectedScript.name}</h4>
                  </div>
                  <button
                    onClick={() => executeScript(selectedScript.name)}
                    disabled={isExecuting}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExecuting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Play size={16} />
                    )}
                    <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Command:</label>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 font-mono text-sm text-gray-100">
                      {selectedScript.command}
                    </div>
                  </div>

                  {executionResult && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">Output:</label>
                        <button
                          onClick={() => copyToClipboard(executionResult)}
                          className="flex items-center space-x-1 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                        >
                          <Copy size={14} />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-100 text-sm font-mono">
                          {executionResult}
                        </pre>
                      </div>
                    </div>
                  )}
                  {executionResult && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-300">Output:</label>
                        <button
                          onClick={() => copyToClipboard(executionResult)}
                          className="flex items-center space-x-1 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                        >
                          <Copy size={14} />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-100 text-sm font-mono">
                          {executionResult}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                <Terminal size={48} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a script</h3>
                <p className="text-gray-500">Choose a script from the left panel to view details and execute it</p>
              </div>
            )}
          </div>
        </div>

        {/* Result Modal */}
        {showResultModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-200 flex items-center space-x-2">
                  <Terminal size={24} className="text-green-400" />
                  <span>Script Execution Result</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(executionResult)}
                    className="p-2 text-gray-400 hover:text-gray-200 transition-colors bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600"
                    title="Copy Result"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-slate-800 rounded-lg border border-slate-700 hover:border-red-600"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-full overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-gray-100 text-sm font-mono leading-relaxed">
                    {executionResult}
                  </pre>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPage;