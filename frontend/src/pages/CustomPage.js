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
  X,
  Search
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://4e700c55-6382-44df-bdef-0bf91559b9c6.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

console.log('CustomPage - BACKEND_URL:', BACKEND_URL);
console.log('CustomPage - API URL:', API);

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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    console.log('Fetching scripts from:', `${API}/custom-scripts`);
    setLoading(true);
    
    // Add retry logic for better reliability
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} to fetch scripts...`);
        
        // Add timeout and explicit headers
        const response = await axios.get(`${API}/custom-scripts`, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Scripts loaded successfully:', response.data.length, 'scripts');
        setScripts(response.data);
        
        if (response.data.length === 0) {
          toast.info('No custom scripts found');
        } else {
          toast.success(`Loaded ${response.data.length} scripts successfully`);
        }
        
        setLoading(false); // Set loading to false on success
        return; // Success, exit retry loop
        
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', error.response.data);
          console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Request setup error:', error.message);
        }
        
        // If it's the last attempt, don't wait
        if (attempt < maxRetries) {
          console.log(`Waiting 2 seconds before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // All retries failed
    console.error('All attempts failed. Last error:', lastError);
    const errorMessage = lastError?.response?.data?.detail || 
                        lastError?.message || 
                        'Unknown error occurred';
    toast.error(`Failed to load custom scripts: ${errorMessage}`);
    
    setLoading(false);
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

  // Filter scripts based on search term
  const filteredScripts = scripts.filter(script =>
    script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (script.description && script.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Terminal size={40} className="text-blue-400 mr-3" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
            Custom File Scans
          </h1>
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
                    <p className="text-sm text-gray-500 mb-3">
                      Upload files and run custom analysis scripts for advanced forensic examination
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

        <div>
          {/* Scripts List */}
          <div>
            {/* Section Header with Refresh Button */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-200">Available Scripts</h3>
              <button
                onClick={fetchScripts}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span>{loading ? "Loading..." : "Refresh"}</span>
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search custom scripts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-600/50 rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            ) : filteredScripts.length === 0 ? (
              searchTerm ? (
                <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-xl">
                  <Search size={48} className="mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No scripts match your search</h3>
                  <p className="text-gray-500">Try adjusting your search term: "{searchTerm}"</p>
                </div>
              ) : (
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
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredScripts.map((script) => (
                  <div
                    key={script.name}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/10 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => executeScript(script.name)}
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
                        <div className="p-2 bg-green-600/20 text-green-400 rounded-lg">
                          <Play size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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