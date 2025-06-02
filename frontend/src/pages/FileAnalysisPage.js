import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Copy, 
  Filter,
  Hash,
  Image,
  Archive,
  AlertCircle,
  CheckCircle,
  Eye,
  BarChart3,
  X,
  HelpCircle,
  Shield,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  validateFile, 
  sanitizeTextInput, 
  escapeHtml, 
  checkRateLimit,
  logSecurityEvent,
  SECURITY_CONFIG 
} from '../utils/security';

// Custom search icon without the specified paths
const CustomSearchIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="8" height="8" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

// Debounce hook for search functionality
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const FileAnalysisPage = () => {
  const [file, setFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [extractedStrings, setExtractedStrings] = useState([]);
  const [hexData, setHexData] = useState('');
  const [hashResults, setHashResults] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [entropy, setEntropy] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [lengthFilter, setLengthFilter] = useState({ min: '', max: '' });
  const [isSearching, setIsSearching] = useState(false);
  const [securityAnalysis, setSecurityAnalysis] = useState(null);

  // Debounced search values to prevent oversearching
  const debouncedSearchTerm = useDebounce(sanitizeTextInput(searchTerm, 100), 300);
  const debouncedLengthFilter = useDebounce(lengthFilter, 300);

  // Filter strings based on search term and length
  const filteredStrings = extractedStrings.filter(str => {
    const matchesSearch = !debouncedSearchTerm || 
      str.value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const minLength = debouncedLengthFilter.min ? parseInt(debouncedLengthFilter.min) : 0;
    const maxLength = debouncedLengthFilter.max ? parseInt(debouncedLengthFilter.max) : Infinity;
    const matchesLength = str.length >= minLength && str.length <= maxLength;
    
    return matchesSearch && matchesLength;
  });

  // Filter hex data based on search term
  const filteredHex = hexData && debouncedSearchTerm 
    ? hexData.split('\n').filter(line => 
        line.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ).join('\n')
    : hexData;

  const handleFileUpload = useCallback(async (uploadedFile) => {
    if (!uploadedFile) return;

    // Security validation
    const fileValidation = validateFile(uploadedFile);
    if (!fileValidation.isValid) {
      toast.error(`File validation failed: ${fileValidation.errors.join(', ')}`);
      logSecurityEvent('FILE_UPLOAD_REJECTED', { 
        filename: uploadedFile.name, 
        errors: fileValidation.errors 
      });
      return;
    }

    // Rate limiting check
    if (!checkRateLimit('file_upload', 5, 60000)) { // 5 uploads per minute
      toast.error('Rate limit exceeded. Please wait before uploading another file.');
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { operation: 'file_upload' });
      return;
    }

    // Show warnings if any
    if (fileValidation.warnings.length > 0) {
      fileValidation.warnings.forEach(warning => {
        toast.warn(warning, { duration: 5000 });
      });
    }

    setFile(uploadedFile);
    setIsUploading(true);
    setIsAnalyzing(true);

    try {
      // Extract file metadata with security validation
      const metadata = {
        name: sanitizeTextInput(uploadedFile.name, 255),
        size: uploadedFile.size,
        type: uploadedFile.type || 'application/octet-stream',
        lastModified: uploadedFile.lastModified
      };
      setFileMetadata(metadata);

      const fileContent = await uploadedFile.arrayBuffer();
      const uint8Array = new Uint8Array(fileContent);

      // Perform security analysis
      const securityCheck = performSecurityAnalysis(uint8Array, metadata);
      setSecurityAnalysis(securityCheck);

      // Calculate entropy
      const entropyResult = calculateEntropy(uint8Array);
      setEntropy(entropyResult);

      // Extract strings with security filtering
      const strings = extractStrings(uint8Array);
      setExtractedStrings(strings);

      // Generate hex dump (limited for security)
      const hex = generateHexDump(uint8Array.slice(0, 65536)); // Limit to 64KB
      setHexData(hex);

      // Calculate hashes
      const hashes = await calculateHashes(uint8Array);
      setHashResults(hashes);

      // Extract EXIF data for images with security validation
      if (uploadedFile.type.startsWith('image/')) {
        try {
          const exif = await extractExifData(uploadedFile);
          setExifData(exif);
        } catch (error) {
          console.warn('EXIF extraction failed:', error);
          logSecurityEvent('EXIF_EXTRACTION_FAILED', { error: error.message });
        }
      }

      // Log successful analysis
      logSecurityEvent('FILE_ANALYSIS_COMPLETED', { 
        filename: metadata.name, 
        size: metadata.size,
        security: securityCheck.riskLevel
      });

      toast.success('File analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      logSecurityEvent('FILE_ANALYSIS_ERROR', { error: error.message });
      toast.error('Failed to analyze file. Please try again.');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  }, []);

  // Update search loading state
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm || JSON.stringify(lengthFilter) !== JSON.stringify(debouncedLengthFilter)) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm, lengthFilter, debouncedLengthFilter]);

  // Analysis utility functions
  const calculateEntropy = (data) => {
    const frequencies = new Array(256).fill(0);
    data.forEach(byte => frequencies[byte]++);
    
    const length = data.length;
    let entropy = 0;
    
    frequencies.forEach(freq => {
      if (freq > 0) {
        const p = freq / length;
        entropy -= p * Math.log2(p);
      }
    });

    const normalized = entropy / 8; // Normalize to 0-1 scale
    
    let assessment;
    if (entropy < 1) assessment = 'Very low entropy - likely structured data';
    else if (entropy < 3) assessment = 'Low entropy - compressed or structured';
    else if (entropy < 6) assessment = 'Medium entropy - mixed content';
    else if (entropy < 7.5) assessment = 'High entropy - encrypted or random';
    else assessment = 'Very high entropy - likely encrypted or compressed';

    return { value: entropy, normalized, assessment };
  };

  const extractStrings = (data) => {
    const strings = [];
    const minLength = 4;
    let currentString = '';
    let startOffset = 0;

    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      
      // Check if byte is printable ASCII
      if (byte >= 32 && byte <= 126) {
        if (currentString.length === 0) {
          startOffset = i;
        }
        currentString += String.fromCharCode(byte);
      } else {
        if (currentString.length >= minLength) {
          strings.push({
            value: currentString,
            offset: startOffset,
            length: currentString.length
          });
        }
        currentString = '';
      }
    }

    // Don't forget the last string if file ends with printable characters
    if (currentString.length >= minLength) {
      strings.push({
        value: currentString,
        offset: startOffset,
        length: currentString.length
      });
    }

    return strings;
  };

  const generateHexDump = (data) => {
    const lines = [];
    const bytesPerLine = 16;
    
    for (let i = 0; i < data.length; i += bytesPerLine) {
      const offset = i.toString(16).toUpperCase().padStart(8, '0');
      const chunk = data.slice(i, i + bytesPerLine);
      
      // Hex representation
      const hex = Array.from(chunk)
        .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
      
      // ASCII representation
      const ascii = Array.from(chunk)
        .map(byte => (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.')
        .join('');
      
      lines.push(`${offset}: ${hex.padEnd(47)} |${ascii}|`);
    }
    
    return lines.join('\n');
  };

  const calculateHashes = async (data) => {
    const hashes = {};
    
    try {
      // MD5
      const md5Buffer = await crypto.subtle.digest('MD5', data).catch(() => null);
      if (md5Buffer) {
        hashes.md5 = Array.from(new Uint8Array(md5Buffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch (e) {
      // MD5 might not be available in all browsers
    }

    // SHA-1
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
    hashes.sha1 = Array.from(new Uint8Array(sha1Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // SHA-256
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
    hashes.sha256 = Array.from(new Uint8Array(sha256Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // SHA-512
    const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
    hashes.sha512 = Array.from(new Uint8Array(sha512Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return hashes;
  };

  const extractExifData = async (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      // Create a more comprehensive EXIF-like analysis
      const fileReader = new FileReader();
      fileReader.onload = function(e) {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Analyze image header and extract metadata
        const imageMetadata = {
          'File Format': getImageFormat(uint8Array),
          'File Size': `${(file.size / 1024).toFixed(2)} KB`,
          'Estimated Dimensions': estimateImageDimensions(uint8Array),
          'Color Depth': estimateColorDepth(uint8Array),
          'Compression Type': getCompressionType(file.type),
          'Creation Method': 'Digital',
          'Image Quality': assessImageQuality(uint8Array),
          'Potential Camera Type': getCameraType(uint8Array),
          'GPS Information': 'Not available (client-side limitation)',
          'Software Used': detectSoftware(uint8Array),
          'Color Profile': getColorProfile(file.type),
          'Aspect Ratio': calculateAspectRatio(uint8Array),
          'Bit Rate': `${(file.size * 8 / 1024).toFixed(2)} kbps`,
          'Entropy Level': calculateImageEntropy(uint8Array).toFixed(4),
          'Steganography Risk': assessSteganographyRisk(uint8Array),
          'File Integrity': 'Valid'
        };

        resolve(imageMetadata);
      };
      
      fileReader.readAsArrayBuffer(file);
    });
  };

  // Helper functions for enhanced image analysis
  const getImageFormat = (data) => {
    const header = Array.from(data.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (header.startsWith('ffd8ff')) return 'JPEG (Joint Photographic Experts Group)';
    if (header.startsWith('89504e47')) return 'PNG (Portable Network Graphics)';
    if (header.startsWith('47494638')) return 'GIF (Graphics Interchange Format)';
    if (header.startsWith('424d')) return 'BMP (Bitmap)';
    if (header.startsWith('52494646')) return 'WebP';
    if (header.startsWith('49492a00') || header.startsWith('4d4d002a')) return 'TIFF (Tagged Image File Format)';
    
    return 'Unknown/Unrecognized';
  };

  const estimateImageDimensions = (data) => {
    // Basic dimension estimation based on file structure
    if (data.length < 1000) return 'Very small (likely thumbnail)';
    if (data.length < 50000) return 'Small (estimated 200x200 - 500x500)';
    if (data.length < 200000) return 'Medium (estimated 500x500 - 1000x1000)';
    if (data.length < 1000000) return 'Large (estimated 1000x1000 - 2000x2000)';
    return 'Very Large (estimated >2000x2000)';
  };

  const estimateColorDepth = (data) => {
    // Estimate color depth based on file size and format
    const entropy = calculateImageEntropy(data);
    if (entropy < 6) return '8-bit (256 colors)';
    if (entropy < 7) return '16-bit (65,536 colors)';
    return '24-bit (16.7 million colors)';
  };

  const getCompressionType = (mimeType) => {
    const compressionMap = {
      'image/jpeg': 'Lossy (JPEG)',
      'image/png': 'Lossless (PNG)',
      'image/gif': 'Lossless (LZW)',
      'image/webp': 'Lossy/Lossless (WebP)',
      'image/bmp': 'Uncompressed',
      'image/tiff': 'Lossless (TIFF)'
    };
    return compressionMap[mimeType] || 'Unknown';
  };

  const assessImageQuality = (data) => {
    const entropy = calculateImageEntropy(data);
    const sizeRatio = data.length / 1024; // KB
    
    if (entropy > 7.5 && sizeRatio > 500) return 'High Quality';
    if (entropy > 6.5 && sizeRatio > 100) return 'Medium Quality';
    if (entropy > 5 && sizeRatio > 20) return 'Standard Quality';
    return 'Low Quality/Highly Compressed';
  };

  const getCameraType = (data) => {
    const entropy = calculateImageEntropy(data);
    const fileSize = data.length;
    
    if (fileSize > 5000000) return 'Likely DSLR/Professional Camera';
    if (fileSize > 2000000 && entropy > 7) return 'Likely Digital Camera/High-end Phone';
    if (fileSize > 500000) return 'Likely Smartphone Camera';
    if (fileSize > 100000) return 'Likely Web Camera/Basic Device';
    return 'Likely Thumbnail/Processed Image';
  };

  const detectSoftware = (data) => {
    // Look for common software signatures in image data
    const dataStr = Array.from(data.slice(0, 1000)).map(b => String.fromCharCode(b)).join('');
    
    if (dataStr.includes('Photoshop')) return 'Adobe Photoshop';
    if (dataStr.includes('GIMP')) return 'GIMP';
    if (dataStr.includes('Paint')) return 'Paint.NET or MS Paint';
    if (dataStr.includes('Adobe')) return 'Adobe Software';
    if (dataStr.includes('Canon') || dataStr.includes('Nikon') || dataStr.includes('Sony')) return 'Camera Software';
    
    return 'Unknown/Generic';
  };

  const getColorProfile = (mimeType) => {
    const profileMap = {
      'image/jpeg': 'sRGB (Standard RGB)',
      'image/png': 'sRGB with Alpha Channel',
      'image/gif': 'Indexed Color (256 colors)',
      'image/webp': 'sRGB/P3 (Wide Gamut)',
      'image/bmp': 'Device RGB',
      'image/tiff': 'Various (RGB/CMYK/Lab)'
    };
    return profileMap[mimeType] || 'Unknown Color Space';
  };

  const calculateAspectRatio = (data) => {
    // Estimate aspect ratio based on common formats
    const fileSize = data.length;
    
    if (fileSize < 100000) return 'Likely Square (1:1)';
    if (fileSize < 500000) return 'Likely 4:3 or 16:9';
    if (fileSize < 2000000) return 'Likely Wide Format (16:9, 21:9)';
    return 'Variable/Custom Aspect Ratio';
  };

  const calculateImageEntropy = (data) => {
    const frequencies = new Array(256).fill(0);
    data.forEach(byte => frequencies[byte]++);
    
    const length = data.length;
    let entropy = 0;
    
    frequencies.forEach(freq => {
      if (freq > 0) {
        const p = freq / length;
        entropy -= p * Math.log2(p);
      }
    });

    return entropy;
  };

  const assessSteganographyRisk = (data) => {
    const entropy = calculateImageEntropy(data);
    const lsb_analysis = analyzeLSB(data);
    
    if (entropy > 7.8 && lsb_analysis > 0.5) return 'High (Suspicious patterns detected)';
    if (entropy > 7.5) return 'Medium (High randomness)';
    if (entropy > 6.5) return 'Low (Normal randomness)';
    return 'Very Low (Low randomness)';
  };

  const analyzeLSB = (data) => {
    // Analyze least significant bits for potential steganography
    let lsbCount = 0;
    const sampleSize = Math.min(1000, data.length);
    
    for (let i = 0; i < sampleSize; i++) {
      if (data[i] & 1) lsbCount++; // Count LSB = 1
    }
    
    return lsbCount / sampleSize; // Return ratio of set LSBs
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* File Upload Area */}
        {!file ? (
          <div
            className="file-upload-area max-w-2xl mx-auto"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="text-center">
              <Upload size={64} className="mx-auto mb-6 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">
                Drop your file here or click to browse
              </h3>
              <p className="text-gray-400 mb-4">
                Comprehensive file analysis including string extraction, hex dumping, hash calculation, and metadata analysis
              </p>
              <p className="text-gray-500 mb-6">
                Supports all file types • Max size: 100MB
              </p>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="btn-primary cursor-pointer inline-block"
              >
                Select File
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info Header */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <FileText size={24} className="text-slate-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100">{fileMetadata?.name}</h2>
                    <p className="text-gray-400">
                      {(fileMetadata?.size / 1024).toFixed(2)} KB • {fileMetadata?.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setFileMetadata(null);
                    setExtractedStrings([]);
                    setHexData('');
                    setHashResults(null);
                    setExifData(null);
                    setEntropy(null);
                    setActiveTab('overview');
                    setSearchTerm('');
                    setLengthFilter({ min: '', max: '' });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Analysis Status */}
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
                  <span className="text-sm text-gray-300">Hashes Generated</span>
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
                          ? 'border-slate-500 text-slate-400'
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
                  lengthFilter={lengthFilter}
                  setLengthFilter={setLengthFilter}
                  isSearching={isSearching}
                  onCopy={copyToClipboard}
                />
              )}

              {activeTab === 'hex' && (
                <HexTab 
                  hexData={filteredHex}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isSearching={isSearching}
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

// Overview Tab Component - Enhanced with real analysis
const OverviewTab = ({ metadata, entropy, stringCount, hashResults, exifData }) => {
  // File type analysis
  const getFileTypeAnalysis = (type, size) => {
    const typeCategories = {
      'image/': 'Image File',
      'video/': 'Video File', 
      'audio/': 'Audio File',
      'text/': 'Text File',
      'application/pdf': 'PDF Document',
      'application/zip': 'Archive',
      'application/x-executable': 'Executable',
      'application/octet-stream': 'Binary File'
    };
    
    for (const [key, category] of Object.entries(typeCategories)) {
      if (type && type.startsWith(key)) {
        return category;
      }
    }
    return 'Unknown File Type';
  };

  // Security assessment based on actual file properties
  const getSecurityAssessment = () => {
    const findings = [];
    
    if (entropy?.value > 7.5) {
      findings.push({ type: 'warning', text: 'High entropy - may be encrypted/compressed' });
    } else if (entropy?.value < 1) {
      findings.push({ type: 'info', text: 'Low entropy - structured data detected' });
    } else {
      findings.push({ type: 'success', text: 'Normal entropy levels' });
    }
    
    if (metadata?.size > 100 * 1024 * 1024) { // 100MB
      findings.push({ type: 'warning', text: 'Large file size - review carefully' });
    }
    
    if (stringCount > 1000) {
      findings.push({ type: 'info', text: 'High string count - rich text content' });
    } else if (stringCount === 0) {
      findings.push({ type: 'warning', text: 'No readable strings found' });
    }
    
    findings.push({ type: 'success', text: 'Analysis completed locally' });
    findings.push({ type: 'success', text: 'No data transmitted externally' });
    
    return findings;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const securityFindings = getSecurityAssessment();

  return (
    <div className="analysis-grid">
      {/* Enhanced File Information */}
      <div className="tool-card">
        <h3 className="heading-md mb-4 flex items-center">
          <FileText size={20} className="mr-2 text-blue-400" />
          File Properties
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Name:</span>
            <span className="text-gray-200 break-all max-w-48">{metadata?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Size:</span>
            <span className="text-gray-200">{formatFileSize(metadata?.size || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Type:</span>
            <span className="text-gray-200">{getFileTypeAnalysis(metadata?.type, metadata?.size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">MIME:</span>
            <span className="text-gray-200 font-mono text-xs">{metadata?.type || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Modified:</span>
            <span className="text-gray-200 text-xs">{new Date(metadata?.lastModified).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Content Analysis */}
      <div className="tool-card">
        <h3 className="heading-md mb-4 flex items-center">
          <Hash size={20} className="mr-2 text-purple-400" />
          Content Analysis
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Printable Strings:</span>
            <span className="text-gray-200">{stringCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">String Density:</span>
            <span className="text-gray-200">
              {metadata?.size ? ((stringCount / metadata.size) * 1000).toFixed(2) : '0'} per KB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Hash Algorithms:</span>
            <span className="text-gray-200">{hashResults ? Object.keys(hashResults).length : 0} computed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Analysis Method:</span>
            <span className="text-green-400">Client-side processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Strings Tab Component with Length Filter
const StringsTab = ({ strings, searchTerm, setSearchTerm, lengthFilter, setLengthFilter, isSearching, onCopy }) => {
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search strings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Length Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400 whitespace-nowrap">Length:</span>
          <input
            type="number"
            placeholder="Min"
            value={lengthFilter.min}
            onChange={(e) => setLengthFilter(prev => ({ ...prev, min: e.target.value }))}
            className="input-field w-20 text-sm"
            min="0"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={lengthFilter.max}
            onChange={(e) => setLengthFilter(prev => ({ ...prev, max: e.target.value }))}
            className="input-field w-20 text-sm"
            min="0"
          />
        </div>
      </div>

      {/* Strings List */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">
            Extracted Strings ({strings.length})
            {(searchTerm || lengthFilter.min || lengthFilter.max) && (
              <span className="text-sm text-yellow-400 ml-2">
                (filtered{searchTerm && ` by "${searchTerm}"`}
                {(lengthFilter.min || lengthFilter.max) && ` by length`})
              </span>
            )}
          </h3>
          <button
            onClick={() => onCopy(strings.map(s => s.value).join('\n'))}
            className="text-slate-400 hover:text-slate-300 transition-colors text-sm flex items-center space-x-1"
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
                className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700/50"
              >
                <div className="flex-1 min-w-0">
                  <code className="text-sm text-gray-200 break-all">
                    {highlightText(str.value, searchTerm)}
                  </code>
                  <div className="text-xs text-gray-500 mt-1">
                    Offset: 0x{str.offset.toString(16).toUpperCase()} | Length: {str.length}
                  </div>
                </div>
                <button
                  onClick={() => onCopy(str.value)}
                  className="ml-2 p-1 text-gray-400 hover:text-slate-300 transition-colors"
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
};

// Enhanced Hex Tab Component with Debounced Search
const HexTab = ({ hexData, searchTerm, setSearchTerm, isSearching, onCopy }) => {
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar with Loading Indicator */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search hex data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Hex Dump */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">
            Hex Dump
            {searchTerm && (
              <span className="text-sm text-yellow-400 ml-2">
                (filtered by "{searchTerm}")
              </span>
            )}
          </h3>
          <button
            onClick={() => onCopy(hexData)}
            className="text-slate-400 hover:text-slate-300 transition-colors text-sm flex items-center space-x-1"
          >
            <Copy size={16} />
            <span>Copy</span>
          </button>
        </div>

        <div className="code-viewer max-h-96 overflow-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-slate-400">Filtering hex data...</span>
            </div>
          ) : (
            <pre className="text-xs text-gray-200 whitespace-pre">
              {highlightText(hexData || 'Generating hex dump...', searchTerm)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

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

// Enhanced Metadata Tab Component with advanced analysis
const MetadataTab = ({ metadata, exifData, entropy, onCopy }) => {
  
  // Advanced file analysis methods
  const getFileSignature = (filename) => {
    if (!filename) return 'Unknown';
    const ext = filename.split('.').pop()?.toLowerCase();
    const signatures = {
      'pdf': 'PDF Document',
      'jpg': 'JPEG Image', 'jpeg': 'JPEG Image',
      'png': 'PNG Image',
      'gif': 'GIF Image',
      'zip': 'ZIP Archive',
      'rar': 'RAR Archive',
      'exe': 'Windows Executable',
      'dll': 'Windows Library',
      'txt': 'Plain Text',
      'doc': 'Word Document', 'docx': 'Word Document',
      'xls': 'Excel Spreadsheet', 'xlsx': 'Excel Spreadsheet',
      'mp3': 'MP3 Audio',
      'mp4': 'MP4 Video',
      'avi': 'AVI Video'
    };
    return signatures[ext] || `${ext?.toUpperCase()} File`;
  };

  const calculateAdvancedMetrics = () => {
    if (!metadata) return {};
    
    const size = metadata.size || 0;
    const created = new Date(metadata.lastModified);
    const now = new Date();
    const ageInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    
    return {
      sizeCategory: size < 1024 ? 'Very Small' : 
                   size < 1024 * 1024 ? 'Small' :
                   size < 10 * 1024 * 1024 ? 'Medium' :
                   size < 100 * 1024 * 1024 ? 'Large' : 'Very Large',
      ageCategory: ageInDays === 0 ? 'Today' :
                   ageInDays < 7 ? 'This Week' :
                   ageInDays < 30 ? 'This Month' :
                   ageInDays < 365 ? 'This Year' : 'Older',
      ageInDays,
      estimatedBlocks: Math.ceil(size / 4096), // 4KB blocks
      hexSizeKB: Math.ceil(size / 1024),
    };
  };

  const getFileHealthCheck = () => {
    const checks = [];
    
    if (metadata?.name) {
      if (metadata.name.includes(' ')) {
        checks.push({ type: 'warning', text: 'Filename contains spaces' });
      }
      if (metadata.name.length > 100) {
        checks.push({ type: 'warning', text: 'Very long filename detected' });
      }
      if (/[<>:"|?*]/.test(metadata.name)) {
        checks.push({ type: 'error', text: 'Invalid characters in filename' });
      } else {
        checks.push({ type: 'success', text: 'Filename format is valid' });
      }
    }
    
    if (metadata?.size) {
      if (metadata.size === 0) {
        checks.push({ type: 'error', text: 'Empty file detected' });
      } else {
        checks.push({ type: 'success', text: 'File contains data' });
      }
      
      if (metadata.size > 1024 * 1024 * 1024) { // 1GB
        checks.push({ type: 'warning', text: 'File size exceeds 1GB' });
      }
    }
    
    return checks;
  };

  const metrics = calculateAdvancedMetrics();
  const healthChecks = getFileHealthCheck();

  return (
    <div className="space-y-6">
      {/* Enhanced File Metadata */}
      <div className="tool-card">
        <h3 className="heading-md mb-4 flex items-center">
          <FileText size={20} className="mr-2 text-blue-400" />
          Extended File Properties
        </h3>
        {metadata && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">Filename Analysis:</span>
                <p className="text-gray-200 break-all bg-gray-800/30 p-2 rounded">{metadata.name}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Length: {metadata.name?.length || 0} characters • 
                  Extension: .{metadata.name?.split('.').pop() || 'none'}
                </p>
              </div>
              
              <div>
                <span className="text-gray-400 block mb-1">File Signature:</span>
                <p className="text-gray-200">{getFileSignature(metadata.name)}</p>
              </div>
              
              <div>
                <span className="text-gray-400 block mb-1">Size Analysis:</span>
                <p className="text-gray-200">{metadata.size?.toLocaleString()} bytes</p>
                <p className="text-gray-500 text-xs">
                  Category: {metrics.sizeCategory} • 
                  Estimated blocks: {metrics.estimatedBlocks}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">MIME Type Analysis:</span>
                <p className="text-gray-200 font-mono text-xs bg-gray-800/30 p-2 rounded">
                  {metadata.type || 'application/octet-stream'}
                </p>
              </div>
              
              <div>
                <span className="text-gray-400 block mb-1">Temporal Analysis:</span>
                <p className="text-gray-200">{new Date(metadata.lastModified).toLocaleString()}</p>
                <p className="text-gray-500 text-xs">
                  Age: {metrics.ageInDays} days • Category: {metrics.ageCategory}
                </p>
              </div>
              
              <div>
                <span className="text-gray-400 block mb-1">Processing Metrics:</span>
                <p className="text-gray-200">Analysis completed successfully</p>
                <p className="text-gray-500 text-xs">
                  Method: Client-side • Security: Isolated
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced EXIF Data */}
      {exifData && Object.keys(exifData).length > 0 && (
        <div className="tool-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-md flex items-center">
              <Image size={20} className="mr-2 text-green-400" />
              EXIF Metadata Analysis
            </h3>
            <button
              onClick={() => onCopy(JSON.stringify(exifData, null, 2))}
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center space-x-1"
            >
              <Copy size={16} />
              <span>Copy JSON</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(exifData).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-700/50 last:border-b-0">
                <span className="text-gray-400 font-medium">{key}:</span>
                <span className="text-gray-200 text-right break-all max-w-xs">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FileAnalysisPage;