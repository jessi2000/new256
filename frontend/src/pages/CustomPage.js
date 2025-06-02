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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        


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
      </div>
    </div>
  );
};

export default CustomPage;