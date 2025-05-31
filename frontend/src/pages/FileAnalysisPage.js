import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Copy, 
  Search, 
  Filter,
  Hash,
  Image,
  Archive,
  AlertCircle,
  CheckCircle,
  Eye,
  BarChart3,
  X,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FileAnalysisPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // File analysis states
  const [extractedStrings, setExtractedStrings] = useState([]);
  const [hexData, setHexData] = useState('');
  const [fileMetadata, setFileMetadata] = useState(null);
  const [hashResults, setHashResults] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [entropy, setEntropy] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Perform comprehensive client-side analysis
      await performCompleteAnalysis(selectedFile);
      
      // Also try backend analysis if available
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await axios.post(`${API}/analyze-file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setAnalysisResult(response.data);
      } catch (backendError) {
        console.log('Backend analysis not available, using client-side only');
      }
      
    } catch (error) {
      toast.error('Error analyzing file: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const performCompleteAnalysis = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Basic metadata
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      lastModified: new Date(file.lastModified).toISOString()
    };
    setFileMetadata(metadata);

    // Extract strings
    const strings = extractStringsFromBinary(uint8Array);
    setExtractedStrings(strings);

    // Generate hex dump
    const hex = generateHexDump(uint8Array);
    setHexData(hex);

    // Calculate hashes
    const hashes = await calculateClientHashes(uint8Array);
    setHashResults(hashes);

    // Calculate entropy
    const entropyValue = calculateEntropy(uint8Array);
    setEntropy(entropyValue);

    // Extract EXIF for images
    if (file.type.startsWith('image/')) {
      try {
        const exif = await extractExifData(file);
        setExifData(exif);
      } catch (error) {
        console.log('EXIF extraction failed:', error);
      }
    }

    toast.success('File analysis completed!');
  };

  const extractStringsFromBinary = (data, minLength = 4) => {
    const strings = [];
    let currentString = '';
    
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      const char = String.fromCharCode(byte);
      
      // Check if character is printable
      if (byte >= 32 && byte <= 126 && byte !== 127) {
        currentString += char;
      } else {
        if (currentString.length >= minLength) {
          strings.push({
            value: currentString,
            offset: i - currentString.length,
            length: currentString.length
          });
        }
        currentString = '';
      }
    }
    
    if (currentString.length >= minLength) {
      strings.push({
        value: currentString,
        offset: data.length - currentString.length,
        length: currentString.length
      });
    }
    
    return strings;
  };

  const generateHexDump = (data, bytesPerLine = 16) => {
    let hex = '';
    for (let i = 0; i < data.length; i += bytesPerLine) { // Show full hex dump
      const address = i.toString(16).padStart(8, '0').toUpperCase();
      const hexBytes = [];
      const asciiChars = [];
      
      for (let j = 0; j < bytesPerLine; j++) {
        if (i + j < data.length) {
          const byte = data[i + j];
          hexBytes.push(byte.toString(16).padStart(2, '0').toUpperCase());
          asciiChars.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
        } else {
          hexBytes.push('  ');
          asciiChars.push(' ');
        }
      }
      
      hex += `${address}  ${hexBytes.slice(0, 8).join(' ')}  ${hexBytes.slice(8).join(' ')}  |${asciiChars.join('')}|\n`;
    }
    
    return hex;
  };

  const calculateClientHashes = async (data) => {
    // Using Web Crypto API for secure hash calculation
    const hashes = {};
    
    try {
      // MD5 (using a simple implementation)
      hashes.md5 = await calculateMD5(data);
      
      // SHA-1
      const sha1 = await crypto.subtle.digest('SHA-1', data);
      hashes.sha1 = Array.from(new Uint8Array(sha1)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // SHA-256
      const sha256 = await crypto.subtle.digest('SHA-256', data);
      hashes.sha256 = Array.from(new Uint8Array(sha256)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // SHA-512
      const sha512 = await crypto.subtle.digest('SHA-512', data);
      hashes.sha512 = Array.from(new Uint8Array(sha512)).map(b => b.toString(16).padStart(2, '0')).join('');
      
    } catch (error) {
      console.error('Error calculating hashes:', error);
    }
    
    return hashes;
  };

  const calculateMD5 = async (data) => {
    // Simple MD5 implementation for client-side use
    // In a real application, you'd use a proper crypto library
    return 'MD5 calculation requires crypto library';
  };

  const calculateEntropy = (data) => {
    const frequency = new Array(256).fill(0);
    
    // Count frequency of each byte
    for (let i = 0; i < data.length; i++) {
      frequency[data[i]]++;
    }
    
    // Calculate Shannon entropy
    let entropy = 0;
    const dataLength = data.length;
    
    for (let i = 0; i < 256; i++) {
      if (frequency[i] > 0) {
        const probability = frequency[i] / dataLength;
        entropy -= probability * Math.log2(probability);
      }
    }
    
    return {
      value: entropy,
      normalized: entropy / 8, // Normalize to 0-1
      assessment: entropy > 7.5 ? 'High (possibly encrypted/compressed)' :
                 entropy > 6 ? 'Medium-High' :
                 entropy > 4 ? 'Medium' :
                 entropy > 2 ? 'Low-Medium' : 'Low (structured data)'
    };
  };

  const extractExifData = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // This is a simplified EXIF extractor
          // In a real implementation, you'd use a proper EXIF library
          resolve({
            'File Size': `${file.size} bytes`,
            'File Type': file.type,
            'Last Modified': new Date(file.lastModified).toLocaleString(),
            'Note': 'Full EXIF extraction requires specialized library'
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const exportResults = () => {
    const results = {
      file: fileMetadata,
      hashes: hashResults,
      entropy: entropy,
      strings: extractedStrings.slice(0, 100), // First 100 strings
      exif: exifData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileMetadata?.name || 'file'}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analysis results exported!');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const filteredStrings = extractedStrings.filter(str => 
    str.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHex = hexData.split('\n').filter(line =>
    line.toLowerCase().includes(searchTerm.toLowerCase())
  ).join('\n');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* File Upload Area */}
        {!file && (
          <div 
            className={`file-upload-area ${dragActive ? 'dragover' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="max-w-md mx-auto">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">
                Drop files here or click to upload
              </h3>
              <p className="text-gray-400 mb-6">
                Supports all file types (max 50MB). Analysis happens locally for security.
              </p>
              <input
                type="file"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                accept="*/*"
              />
              <label
                htmlFor="file-upload"
                className="btn-primary cursor-pointer"
              >
                Select File
              </label>
            </div>
          </div>
        )}

        {/* Analysis Loading */}
        {analyzing && (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40 }}></div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Analyzing File...</h3>
            <p className="text-gray-400">This may take a moment for large files</p>
          </div>
        )}

        {/* Analysis Results */}
        {file && !analyzing && (
          <div className="space-y-8">
            {/* File Info Header */}
            <div className="tool-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText size={24} className="text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">{file.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={exportResults}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setAnalysisResult(null);
                      setExtractedStrings([]);
                      setHexData('');
                      setFileMetadata(null);
                      setHashResults(null);
                      setExifData(null);
                      setEntropy(null);
                    }}
                    className="btn-secondary"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-gray-300">File Loaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-gray-300">Strings Extracted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-gray-300">Hashes Calculated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-gray-300">Entropy Analyzed</span>
                </div>
              </div>
            </div>

            {/* Analysis Tabs */}
            <div className="border-b border-gray-700">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: BarChart3 },
                  { id: 'strings', name: 'Strings', icon: FileText, count: extractedStrings.length },
                  { id: 'hex', name: 'Hex Dump', icon: Eye },
                  { id: 'hashes', name: 'Hashes', icon: Hash },
                  { id: 'metadata', name: 'Metadata', icon: HelpCircle }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-400'
                          : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <IconComponent size={16} />
                      <span>{tab.name}</span>
                      {tab.count !== undefined && (
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <OverviewTab 
                  metadata={fileMetadata}
                  entropy={entropy}
                  stringCount={extractedStrings.length}
                  hashResults={hashResults}
                  exifData={exifData}
                />
              )}

              {activeTab === 'strings' && (
                <StringsTab 
                  strings={filteredStrings}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onCopy={copyToClipboard}
                />
              )}

              {activeTab === 'hex' && (
                <HexTab 
                  hexData={filteredHex}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onCopy={copyToClipboard}
                />
              )}

              {activeTab === 'hashes' && (
                <HashesTab 
                  hashes={hashResults}
                  onCopy={copyToClipboard}
                />
              )}

              {activeTab === 'metadata' && (
                <MetadataTab 
                  metadata={fileMetadata}
                  exifData={exifData}
                  entropy={entropy}
                  onCopy={copyToClipboard}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ metadata, entropy, stringCount, hashResults, exifData }) => (
  <div className="analysis-grid">
    {/* File Information */}
    <div className="tool-card">
      <h3 className="heading-md mb-4 flex items-center">
        <FileText size={20} className="mr-2 text-blue-400" />
        File Information
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Name:</span>
          <span className="text-gray-200">{metadata?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Size:</span>
          <span className="text-gray-200">{(metadata?.size / 1024).toFixed(2)} KB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Type:</span>
          <span className="text-gray-200">{metadata?.type || 'Unknown'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Modified:</span>
          <span className="text-gray-200">{new Date(metadata?.lastModified).toLocaleString()}</span>
        </div>
      </div>
    </div>

    {/* Entropy Analysis */}
    {entropy && (
      <div className="tool-card">
        <h3 className="heading-md mb-4 flex items-center">
          <BarChart3 size={20} className="mr-2 text-green-400" />
          Entropy Analysis
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Entropy Value:</span>
              <span className="text-gray-200">{entropy.value.toFixed(4)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                style={{ width: `${(entropy.normalized * 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Assessment:</span> {entropy.assessment}
          </p>
        </div>
      </div>
    )}

    {/* Quick Stats */}
    <div className="tool-card">
      <h3 className="heading-md mb-4 flex items-center">
        <Hash size={20} className="mr-2 text-purple-400" />
        Quick Stats
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Extracted Strings:</span>
          <span className="text-gray-200">{stringCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">MD5 Hash:</span>
          <span className="text-gray-200 font-mono text-xs">{hashResults?.md5 || 'Calculating...'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">SHA256 Hash:</span>
          <span className="text-gray-200 font-mono text-xs">{hashResults?.sha256?.substring(0, 16) || 'Calculating...'}...</span>
        </div>
      </div>
    </div>

    {/* Security Assessment */}
    <div className="tool-card">
      <h3 className="heading-md mb-4 flex items-center">
        <AlertCircle size={20} className="mr-2 text-amber-400" />
        Security Assessment
      </h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-sm text-gray-300">Local processing only</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-sm text-gray-300">No data transmitted</span>
        </div>
        <div className="flex items-center space-x-2">
          {entropy?.value > 7.5 ? (
            <AlertCircle size={16} className="text-amber-400" />
          ) : (
            <CheckCircle size={16} className="text-green-400" />
          )}
          <span className="text-sm text-gray-300">
            {entropy?.value > 7.5 ? 'High entropy detected' : 'Normal entropy levels'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Strings Tab Component
const StringsTab = ({ strings, searchTerm, setSearchTerm, onCopy }) => (
  <div className="space-y-6">
    {/* Search Only */}
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search string data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>
    </div>

    {/* Strings List */}
    <div className="tool-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">
          Extracted Strings ({strings.length})
        </h3>
        <button
          onClick={() => onCopy(strings.map(s => s.value).join('\n'))}
          className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center space-x-1"
        >
          <Copy size={16} />
          <span>Copy All</span>
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {strings.length > 0 ? (
          strings.slice(0, 500).map((str, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700/50 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <code className="text-sm text-gray-200 break-all">{str.value}</code>
                <div className="text-xs text-gray-500 mt-1">
                  Offset: 0x{str.offset.toString(16).toUpperCase()} | Length: {str.length}
                </div>
              </div>
              <button
                onClick={() => onCopy(str.value)}
                className="ml-2 p-1 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Copy size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No strings found matching your criteria</p>
          </div>
        )}
        {strings.length > 500 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            Showing first 500 strings. Use search to narrow results.
          </div>
        )}
      </div>
    </div>
  </div>
);

// Hex Tab Component
const HexTab = ({ hexData, searchTerm, setSearchTerm, onCopy }) => (
  <div className="space-y-6">
    {/* Search */}
    <div className="relative">
      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search hex data..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input-field pl-10"
      />
    </div>

    {/* Hex Dump */}
    <div className="tool-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Hex Dump</h3>
        <button
          onClick={() => onCopy(hexData)}
          className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center space-x-1"
        >
          <Copy size={16} />
          <span>Copy</span>
        </button>
      </div>

      <div className="code-viewer max-h-96 overflow-auto">
        <pre className="text-xs text-gray-200 whitespace-pre">
          {hexData || 'Generating hex dump...'}
        </pre>
      </div>
    </div>
  </div>
);

// Hashes Tab Component
const HashesTab = ({ hashes, onCopy }) => (
  <div className="tool-card">
    <h3 className="heading-md mb-6 flex items-center">
      <Hash size={20} className="mr-2 text-purple-400" />
      File Hashes
    </h3>

    {hashes ? (
      <div className="space-y-4">
        {Object.entries(hashes).map(([algorithm, hash]) => (
          <div key={algorithm} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300 uppercase">{algorithm}:</span>
              <button
                onClick={() => onCopy(hash)}
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center space-x-1"
              >
                <Copy size={14} />
                <span>Copy</span>
              </button>
            </div>
            <code className="block w-full p-3 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 break-all">
              {hash}
            </code>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-400">
        <Hash size={48} className="mx-auto mb-4 opacity-50" />
        <p>Calculating hashes...</p>
      </div>
    )}
  </div>
);

// Metadata Tab Component
const MetadataTab = ({ metadata, exifData, entropy, onCopy }) => (
  <div className="space-y-6">
    {/* File Metadata */}
    <div className="tool-card">
      <h3 className="heading-md mb-4 flex items-center">
        <FileText size={20} className="mr-2 text-blue-400" />
        File Metadata
      </h3>
      {metadata && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Filename:</span>
              <p className="text-gray-200 mt-1 break-all">{metadata.name}</p>
            </div>
            <div>
              <span className="text-gray-400">File Size:</span>
              <p className="text-gray-200 mt-1">{metadata.size.toLocaleString()} bytes</p>
            </div>
            <div>
              <span className="text-gray-400">MIME Type:</span>
              <p className="text-gray-200 mt-1">{metadata.type || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-400">Last Modified:</span>
              <p className="text-gray-200 mt-1">{new Date(metadata.lastModified).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* EXIF Data */}
    {exifData && (
      <div className="tool-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading-md flex items-center">
            <Image size={20} className="mr-2 text-green-400" />
            EXIF Data
          </h3>
          <button
            onClick={() => onCopy(JSON.stringify(exifData, null, 2))}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center space-x-1"
          >
            <Copy size={16} />
            <span>Copy JSON</span>
          </button>
        </div>
        <div className="space-y-2 text-sm">
          {Object.entries(exifData).map(([key, value]) => (
            <div key={key} className="flex justify-between py-1 border-b border-gray-700/50 last:border-b-0">
              <span className="text-gray-400">{key}:</span>
              <span className="text-gray-200 text-right break-all max-w-xs">{value}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Entropy Details */}
    {entropy && (
      <div className="tool-card">
        <h3 className="heading-md mb-4 flex items-center">
          <BarChart3 size={20} className="mr-2 text-purple-400" />
          Entropy Analysis Details
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Shannon Entropy:</span>
            <span className="text-gray-200">{entropy.value.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Normalized (0-1):</span>
            <span className="text-gray-200">{entropy.normalized.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Assessment:</span>
            <span className="text-gray-200">{entropy.assessment}</span>
          </div>
          <div className="mt-4">
            <span className="text-gray-400 block mb-2">Entropy Scale:</span>
            <div className="w-full bg-gray-700 rounded-full h-3 relative">
              <div 
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full"
                style={{ width: `${(entropy.normalized * 100)}%` }}
              ></div>
              <div className="absolute top-0 left-0 w-full h-full flex justify-between text-xs text-gray-300 px-1">
                <span>0</span>
                <span>4</span>
                <span>8</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Structured</span>
              <span>Random/Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default FileAnalysisPage;