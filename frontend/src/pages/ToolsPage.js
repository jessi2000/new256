import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Copy, 
  Play, 
  RotateCcw,
  Code,
  Lock,
  Hash,
  FileText,
  Shuffle,
  X,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loadTools, executeTool } from '../Toolscripts/toolLoader';

const ToolsPage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState('encode');
  const [base64Result, setBase64Result] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [tools, setTools] = useState([]);

  // Load tools on component mount
  useEffect(() => {
    const loadedTools = loadTools();
    setTools(loadedTools);
  }, []);

  // Handle navigation from HomePage search
  useEffect(() => {
    if (location.state?.openTool) {
      const toolToOpen = tools.find(tool => 
        tool.name.toLowerCase() === location.state.openTool.toLowerCase()
      );
      if (toolToOpen) {
        setSelectedTool(toolToOpen);
        if (location.state.searchTerm) {
          setSearchTerm(location.state.searchTerm);
        }
      }
      // Clear the state to prevent reopening on subsequent visits
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Multi-layer Base64 decoding function
  const multiLayerBase64Decode = (input) => {
    let current = input.trim();
    let layers = [];
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      // Check if current string is valid base64
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(current) || current.length % 4 !== 0) {
        break;
      }

      try {
        const decoded = decodeURIComponent(escape(atob(current)));
        layers.push({
          layer: attempts + 1,
          input: current,
          output: decoded
        });
        
        // If decoded result is the same as input, or not base64, we're done
        if (decoded === current || !base64Regex.test(decoded)) {
          break;
        }
        
        current = decoded;
        attempts++;
      } catch (e) {
        break;
      }
    }

    if (attempts === 0) {
      return {
        finalResult: 'Not a valid Base64 string',
        layers: [],
        totalLayers: 0
      };
    }

    return {
      finalResult: layers[layers.length - 1]?.output || current,
      layers: layers,
      totalLayers: layers.length
    };
  };

  const categories = [
    { id: 'all', name: 'All Tools', count: tools.length },
    { id: 'encode/decode', name: 'Encode/Decode', count: tools.filter(tool => tool.category === 'encode/decode').length },
    { id: 'crypto', name: 'Crypto', count: tools.filter(tool => tool.category === 'crypto').length },
    { id: 'hash', name: 'Hash', count: tools.filter(tool => tool.category === 'hash').length },
    { id: 'text', name: 'Text', count: tools.filter(tool => tool.category === 'text').length }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Tool execution using dynamic loader
  const executeToolDynamic = async (tool) => {
    if (!toolInput.trim() && !tool.hasTwoInputs) {
      toast.error('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    setToolOutput('');
    setBase64Result(null);

    try {
      const params = {};
      
      // Get additional parameters for specific tools
      if (tool.hasShift) {
        params.shift = parseInt(document.getElementById('shift-input')?.value || '3');
      }
      if (tool.hasKey) {
        params.key = document.getElementById('key-input')?.value || '';
      }

      const result = await executeTool(
        tool.id, 
        toolInput, 
        tool.action === 'dual' ? selectedAction : tool.action,
        params
      );

      // Handle special result types
      if (typeof result === 'object' && result.layers) {
        setBase64Result(result);
        setToolOutput(result.finalResult);
      } else {
        setToolOutput(result);
      }
    } catch (error) {
      setToolOutput(`Error: ${error.message}`);
      toast.error('An error occurred while processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const clearInput = () => {
    setToolInput('');
    setToolOutput('');
    setBase64Result(null);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="max-w-7xl mx-auto">
        {!selectedTool && (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Shield size={40} className="text-blue-400 mr-3" />
              </div>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Professional cybersecurity tools for encoding, decoding, cryptography, and text analysis
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600/50 rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-900/80 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {!selectedTool ? (
          <>
            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-slate-900/90 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 group relative overflow-hidden"
                    style={{
                      boxShadow: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `
                        rgba(0, 0, 0, 0.4) 0px 20px 40px,
                        rgba(0, 0, 0, 0.3) 0px 10px 20px,
                        rgba(0, 0, 0, 0.2) 0px 5px 10px,
                        0 0 0 2px rgba(59, 130, 246, 0.5)
                      `;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors flex-shrink-0">
                        <IconComponent size={24} className={`${tool.iconColor || 'text-slate-400'} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors leading-relaxed">
                          {tool.description}
                        </p>
                        <div className="mt-3">
                          <span className="inline-block bg-slate-700/30 text-slate-300 text-xs px-2 py-1 rounded-full border border-slate-600/30 group-hover:bg-blue-500/20 group-hover:border-blue-400/30 group-hover:text-blue-300 transition-all">
                            {tool.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No tools found</h3>
                <p className="text-slate-400">Try adjusting your search or category filter</p>
              </div>
            )}
          </>
        ) : (
          // Tool Interface
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setSelectedTool(null)}
                className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
                <span>Back to Tools</span>
              </button>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <selectedTool.icon size={24} className={`${selectedTool.iconColor || 'text-slate-400'}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-200">{selectedTool.name}</h2>
                  <p className="text-slate-400">{selectedTool.description}</p>
                </div>
              </div>

              {/* Action Selection for dual-action tools */}
              {selectedTool.action === 'dual' && (
                <div className="mb-6">
                  <div className="flex space-x-2 bg-slate-800/50 p-1 rounded-lg w-fit">
                    <button
                      onClick={() => setSelectedAction('encode')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedAction === 'encode'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      Encode
                    </button>
                    <button
                      onClick={() => setSelectedAction('decode')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedAction === 'decode'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      Decode
                    </button>
                  </div>
                </div>
              )}

              {/* Additional inputs for specific tools */}
              {selectedTool.hasShift && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Shift Value
                  </label>
                  <input
                    type="number"
                    id="shift-input"
                    defaultValue="3"
                    min="-25"
                    max="25"
                    className="w-32 bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              )}

              {selectedTool.hasKey && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Key
                  </label>
                  <input
                    type="text"
                    id="key-input"
                    placeholder="Enter encryption key..."
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              )}

              {selectedTool.hasPattern && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Search Pattern
                  </label>
                  <input
                    type="text"
                    id="pattern-input"
                    placeholder="Enter search pattern..."
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              )}

              {selectedTool.id === 'case-converter' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Case Type
                  </label>
                  <select
                    id="case-type"
                    className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  >
                    <option value="upper">UPPERCASE</option>
                    <option value="lower">lowercase</option>
                    <option value="title">Title Case</option>
                    <option value="sentence">Sentence case</option>
                  </select>
                </div>
              )}

              {/* Input Section */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Input
                    </label>
                    <button
                      onClick={clearInput}
                      className="text-slate-400 hover:text-slate-300 transition-colors text-sm"
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    placeholder={`Enter text to ${selectedTool.action === 'dual' ? selectedAction : 'process'}...`}
                    className="w-full h-32 bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => executeToolDynamic(selectedTool)}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>
                          {selectedTool.action === 'dual' 
                            ? selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)
                            : 'Execute'
                          }
                        </span>
                      </>
                    )}
                  </button>

                  {toolOutput && (
                    <button
                      onClick={() => copyToClipboard(toolOutput)}
                      className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Copy size={16} />
                      <span>Copy Result</span>
                    </button>
                  )}
                </div>

                {/* Output Section */}
                {toolOutput && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Output
                      </label>
                      <div className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-green-400 text-sm">Complete</span>
                      </div>
                    </div>
                    <textarea
                      value={toolOutput}
                      readOnly
                      className="w-full h-32 bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-100 focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* Multi-layer Base64 Results */}
                {base64Result && base64Result.layers.length > 0 && (
                  <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-slate-200 mb-4">
                      Multi-layer Decoding Results ({base64Result.totalLayers} layers)
                    </h4>
                    <div className="space-y-3">
                      {base64Result.layers.map((layer, index) => (
                        <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-300">
                              Layer {layer.layer}
                            </span>
                            <button
                              onClick={() => copyToClipboard(layer.output)}
                              className="text-slate-400 hover:text-slate-300 transition-colors"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-slate-400">Input:</span>
                              <code className="block text-xs text-slate-300 bg-slate-800/50 p-2 rounded mt-1 break-all">
                                {layer.input.substring(0, 100)}{layer.input.length > 100 ? '...' : ''}
                              </code>
                            </div>
                            <div>
                              <span className="text-xs text-slate-400">Output:</span>
                              <code className="block text-xs text-slate-300 bg-slate-800/50 p-2 rounded mt-1 break-all">
                                {layer.output}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;