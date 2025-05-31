import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Upload, 
  Trash2, 
  Plus,
  Code,
  Terminal,
  Copy,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  FileCode
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
  const [showUploadModal, setShowUploadModal] = useState(false);

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
      toast.success('Script executed successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Script execution failed';
      setExecutionResult(`Error: ${errorMsg}`);
      toast.error('Script execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const deleteScript = async (scriptName) => {
    if (!window.confirm(`Are you sure you want to delete the script "${scriptName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/custom-scripts/${scriptName}`);
      setScripts(scripts.filter(s => s.name !== scriptName));
      if (selectedScript?.name === scriptName) {
        setSelectedScript(null);
        setExecutionResult('');
      }
      toast.success('Script deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete script');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-xl mb-4">Custom Scripts</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload and execute your custom Python scripts with command configurations
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <FileCode size={24} className="text-slate-400" />
            <h2 className="text-xl font-semibold text-gray-200">
              Available Scripts ({scripts.length})
            </h2>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 hover:shadow-lg hover:shadow-slate-500/25 transform hover:scale-105"
          >
            <Plus size={20} />
            <span>Upload Script</span>
          </button>
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
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No custom scripts</h3>
                <p className="text-gray-500 mb-4">Upload your first Python script to get started!</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary"
                >
                  Upload Script
                </button>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScript(script.name);
                        }}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        title="Delete Script"
                      >
                        <Trash2 size={16} />
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

        {/* Upload Modal */}
        {showUploadModal && (
          <ScriptUploadModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              fetchScripts();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Script Upload Modal Component
const ScriptUploadModal = ({ onClose, onSuccess }) => {
  const [scriptName, setScriptName] = useState('');
  const [command, setCommand] = useState('');
  const [description, setDescription] = useState('');
  const [scriptFile, setScriptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!scriptName.trim() || !command.trim() || !scriptFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('script_name', scriptName.trim());
      formData.append('command', command.trim());
      formData.append('description', description.trim());
      formData.append('script_file', scriptFile);

      await axios.post(`${API}/upload-script`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Script uploaded successfully!');
      onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to upload script';
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.py')) {
        toast.error('Please select a Python (.py) file');
        return;
      }
      setScriptFile(file);
      
      // Auto-suggest script name from filename
      if (!scriptName) {
        const name = file.name.replace('.py', '');
        setScriptName(name);
      }
      
      // Auto-suggest command
      if (!command) {
        setCommand(`python ${file.name}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center space-x-3">
            <Upload size={24} className="text-slate-400" />
            <span>Upload Custom Script</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Script Name *
              </label>
              <input
                type="text"
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
                placeholder="my-script"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Command *
              </label>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="python run.py"
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this script does..."
              className="textarea-field"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Python Script File *
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".py"
                onChange={handleFileChange}
                className="hidden"
                id="script-file"
                required
              />
              <label
                htmlFor="script-file"
                className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors"
              >
                <div className="text-center">
                  <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400">
                    {scriptFile ? scriptFile.name : 'Click to select Python file'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Only .py files are supported</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
              <AlertCircle size={16} className="text-yellow-400" />
              <span>Upload Instructions</span>
            </h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Upload a Python (.py) script file</li>
              <li>• Specify the exact command to run your script</li>
              <li>• Make sure your script handles command-line execution</li>
              <li>• Scripts will be executed in a secure sandboxed environment</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload size={16} />
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload Script'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomPage;