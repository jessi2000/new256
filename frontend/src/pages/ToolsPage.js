import React, { useState, useEffect } from 'react';
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
import CryptoJS from 'crypto-js';

const ToolsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState('encode');
  const [base64Result, setBase64Result] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

  // CTF Tools Data - Combined encode/decode tools
  const tools = [
    // Encoding/Decoding Tools (6 combined tools)
    {
      id: 'base64',
      name: 'Base64 Encoder/Decoder',
      description: 'Encode/decode Base64 with multi-layer support',
      category: 'encoding',
      icon: Code,
      action: 'dual',
      supportsMultiLayer: true
    },
    {
      id: 'url',
      name: 'URL Encoder/Decoder',
      description: 'Encode/decode URL text',
      category: 'encoding',
      icon: Code,
      action: 'dual'
    },
    {
      id: 'html',
      name: 'HTML Entity Encoder/Decoder',
      description: 'Encode/decode HTML entities',
      category: 'encoding',
      icon: Code,
      action: 'dual'
    },
    {
      id: 'hex',
      name: 'Hex Encoder/Decoder',
      description: 'Convert text to/from hexadecimal',
      category: 'encoding',
      icon: Code,
      action: 'dual'
    },
    {
      id: 'binary',
      name: 'Binary Encoder/Decoder',
      description: 'Convert text to/from binary',
      category: 'encoding',
      icon: Code,
      action: 'dual'
    },
    {
      id: 'ascii',
      name: 'ASCII Encoder/Decoder',
      description: 'Convert text to/from ASCII codes',
      category: 'encoding',
      icon: Code,
      action: 'dual'
    },

    // Cryptographic Tools (12 tools)
    {
      id: 'caesar-cipher',
      name: 'Caesar Cipher',
      description: 'Classical substitution cipher with shift',
      category: 'crypto',
      icon: Lock,
      action: 'execute',
      hasShift: true
    },
    {
      id: 'rot13',
      name: 'ROT13 Cipher',
      description: 'ROT13 substitution cipher',
      category: 'crypto',
      icon: RotateCcw,
      action: 'execute'
    },
    {
      id: 'rot47',
      name: 'ROT47 Cipher',
      description: 'ROT47 substitution cipher',
      category: 'crypto',
      icon: RotateCcw,
      action: 'execute'
    },
    {
      id: 'vigenere-encrypt',
      name: 'Vigenère Encrypt',
      description: 'Encrypt using Vigenère cipher',
      category: 'crypto',
      icon: Lock,
      action: 'execute',
      hasKey: true
    },
    {
      id: 'vigenere-decrypt',
      name: 'Vigenère Decrypt',
      description: 'Decrypt Vigenère cipher',
      category: 'crypto',
      icon: Lock,
      action: 'execute',
      hasKey: true
    },
    {
      id: 'atbash-cipher',
      name: 'Atbash Cipher',
      description: 'Hebrew substitution cipher',
      category: 'crypto',
      icon: Shuffle,
      action: 'execute'
    },
    {
      id: 'morse-encode',
      name: 'Morse Code Encoder',
      description: 'Convert text to Morse code',
      category: 'crypto',
      icon: Code,
      action: 'encode'
    },
    {
      id: 'morse-decode',
      name: 'Morse Code Decoder',
      description: 'Convert Morse code to text',
      category: 'crypto',
      icon: Code,
      action: 'decode'
    },
    {
      id: 'reverse-text',
      name: 'Reverse Text',
      description: 'Reverse the order of characters',
      category: 'crypto',
      icon: RotateCcw,
      action: 'execute'
    },
    {
      id: 'md4-hash',
      name: 'MD4 Hash',
      description: 'Generate MD4 hash',
      category: 'crypto',
      icon: Hash,
      action: 'execute'
    },
    {
      id: 'xor-cipher',
      name: 'XOR Cipher',
      description: 'XOR encryption/decryption',
      category: 'crypto',
      icon: Lock,
      action: 'execute',
      hasKey: true
    },
    {
      id: 'bacon-cipher',
      name: 'Bacon Cipher',
      description: 'Francis Bacon steganographic cipher',
      category: 'crypto',
      icon: Lock,
      action: 'execute'
    },

    // Hash Tools (8 tools)
    {
      id: 'md5-hash',
      name: 'MD5 Hash',
      description: 'Generate MD5 hash',
      category: 'hash',
      icon: Hash,
      action: 'execute'
    },
    {
      id: 'sha1-hash',
      name: 'SHA1 Hash',
      description: 'Generate SHA1 hash',
      category: 'hash',
      icon: Hash,
      action: 'execute'
    },
    {
      id: 'sha256-hash',
      name: 'SHA256 Hash',
      description: 'Generate SHA256 hash',
      category: 'hash',
      icon: Hash,
      action: 'execute'
    },
    {
      id: 'sha512-hash',
      name: 'SHA512 Hash',
      description: 'Generate SHA512 hash',
      category: 'hash',
      icon: Hash,
      action: 'execute'
    },
    {
      id: 'crc32-hash',
      name: 'CRC32 Checksum',
      description: 'Generate CRC32 checksum',
      category: 'hash',
      icon: Hash,
      action: 'execute'
    },
    {
      id: 'ntlm-hash',
      name: 'NTLM Hash',
      description: 'Generate NTLM hash',
      category: 'hash',
      icon: Hash,
      action: 'execute'
    },
    {
      id: 'bcrypt-hash',
      name: 'BCrypt Hash',
      description: 'Generate BCrypt hash',
      category: 'hash',
      icon: Hash,
      action: 'execute'
    },
    {
      id: 'hash-identifier',
      name: 'Hash Identifier',
      description: 'Identify hash type',
      category: 'hash',
      icon: Search,
      action: 'execute'
    },

    // Text Processing Tools (8 tools)
    {
      id: 'case-converter',
      name: 'Case Converter',
      description: 'Convert text case (upper/lower/title)',
      category: 'text',
      icon: FileText,
      action: 'execute'
    },
    {
      id: 'text-length',
      name: 'Text Length Counter',
      description: 'Count characters, words, lines',
      category: 'text',
      icon: FileText,
      action: 'execute'
    },
    {
      id: 'remove-whitespace',
      name: 'Whitespace Remover',
      description: 'Remove extra whitespace',
      category: 'text',
      icon: FileText,
      action: 'execute'
    },
    {
      id: 'sort-lines',
      name: 'Line Sorter',
      description: 'Sort lines alphabetically',
      category: 'text',
      icon: FileText,
      action: 'execute'
    },
    {
      id: 'unique-lines',
      name: 'Unique Lines',
      description: 'Remove duplicate lines',
      category: 'text',
      icon: FileText,
      action: 'execute'
    },
    {
      id: 'grep-tool',
      name: 'Grep Tool',
      description: 'Search for patterns in text',
      category: 'text',
      icon: Search,
      action: 'execute',
      hasPattern: true
    },
    {
      id: 'text-diff',
      name: 'Text Diff',
      description: 'Compare two texts',
      category: 'text',
      icon: FileText,
      action: 'execute',
      hasTwoInputs: true
    },
    {
      id: 'word-frequency',
      name: 'Word Frequency',
      description: 'Count word occurrences',
      category: 'text',
      icon: FileText,
      action: 'execute'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tools', count: tools.length },
    { id: 'encoding', name: 'Encoding/Decoding', count: tools.filter(t => t.category === 'encoding').length },
    { id: 'crypto', name: 'Cryptographic', count: tools.filter(t => t.category === 'crypto').length },
    { id: 'hash', name: 'Hash/Checksum', count: tools.filter(t => t.category === 'hash').length },
    { id: 'text', name: 'Text Processing', count: tools.filter(t => t.category === 'text').length }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Tool execution functions
  const executeTool = (toolId, input, action = 'encode', key = '', shift = 0, input2 = '', pattern = '') => {
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        let result = '';
        
        // Multi-layer Base64 decoding
        if (toolId === 'base64' && action === 'decode') {
          const base64Decoded = multiLayerBase64Decode(input);
          setBase64Result(base64Decoded);
          result = base64Decoded.finalResult;
        } else {
          switch (`${toolId}-${action}`) {
            // Encoding/Decoding
            case 'base64-encode':
              result = btoa(unescape(encodeURIComponent(input)));
              break;
            case 'base64-decode':
              try {
                result = decodeURIComponent(escape(atob(input)));
              } catch (e) {
                result = 'Invalid Base64 string';
              }
              break;
            case 'url-encode':
              result = encodeURIComponent(input);
              break;
            case 'url-decode':
              result = decodeURIComponent(input);
              break;
            case 'html-encode':
              result = input.replace(/[&<>"']/g, (m) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
              }[m]));
              break;
            case 'html-decode':
              result = input.replace(/&(?:amp|lt|gt|quot|#39);/g, (m) => ({
                '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'"
              }[m]));
              break;
            case 'hex-encode':
              result = Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
              break;
            case 'hex-decode':
              result = input.match(/.{1,2}/g)?.map(hex => String.fromCharCode(parseInt(hex, 16))).join('') || '';
              break;
            case 'binary-encode':
              result = Array.from(input).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
              break;
            case 'binary-decode':
              result = input.split(/\s+/).map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
              break;
            case 'ascii-encode':
              result = Array.from(input).map(c => c.charCodeAt(0)).join(' ');
              break;
            case 'ascii-decode':
              result = input.split(/\s+/).map(code => String.fromCharCode(parseInt(code))).join('');
              break;

            // Cryptographic
            case 'caesar-cipher':
              result = input.replace(/[a-zA-Z]/g, (char) => {
                const base = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
              });
              break;
            case 'rot13':
              result = input.replace(/[a-zA-Z]/g, (char) => {
                const base = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
              });
              break;
            case 'rot47':
              result = input.replace(/[\x21-\x7E]/g, (char) => 
                String.fromCharCode(33 + ((char.charCodeAt(0) - 33 + 47) % 94))
              );
              break;
            case 'vigenere-encrypt':
              result = vigenereProcess(input, key, true);
              break;
            case 'vigenere-decrypt':
              result = vigenereProcess(input, key, false);
              break;
            case 'atbash-cipher':
              result = input.replace(/[a-zA-Z]/g, (char) => {
                if (char <= 'Z') return String.fromCharCode(155 - char.charCodeAt(0));
                return String.fromCharCode(219 - char.charCodeAt(0));
              });
              break;
            case 'morse-encode':
              result = textToMorse(input);
              break;
            case 'morse-decode':
              result = morseToText(input);
              break;
            case 'reverse-text':
              result = input.split('').reverse().join('');
              break;
            case 'xor-cipher':
              result = xorCipher(input, key);
              break;
            case 'bacon-cipher':
              result = baconCipher(input);
              break;

            // Hash functions
            case 'md5-hash':
              result = CryptoJS.MD5(input).toString();
              break;
            case 'md4-hash':
              result = CryptoJS.MD4 ? CryptoJS.MD4(input).toString() : 'MD4 not available';
              break;
            case 'sha1-hash':
              result = CryptoJS.SHA1(input).toString();
              break;
            case 'sha256-hash':
              result = CryptoJS.SHA256(input).toString();
              break;
            case 'sha512-hash':
              result = CryptoJS.SHA512(input).toString();
              break;
            case 'crc32-hash':
              result = crc32(input).toString(16);
              break;
            case 'ntlm-hash':
              result = 'NTLM: ' + CryptoJS.MD4(CryptoJS.enc.Utf16LE.parse(input)).toString().toUpperCase();
              break;
            case 'bcrypt-hash':
              result = 'BCrypt hash generation requires backend processing';
              break;
            case 'hash-identifier':
              result = identifyHash(input);
              break;

            // Text processing
            case 'case-converter':
              result = `Upper: ${input.toUpperCase()}\nLower: ${input.toLowerCase()}\nTitle: ${input.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}`;
              break;
            case 'text-length':
              const lines = input.split('\n');
              const words = input.trim().split(/\s+/).filter(w => w.length > 0);
              result = `Characters: ${input.length}\nWords: ${words.length}\nLines: ${lines.length}`;
              break;
            case 'remove-whitespace':
              result = input.replace(/\s+/g, ' ').trim();
              break;
            case 'sort-lines':
              result = input.split('\n').sort().join('\n');
              break;
            case 'unique-lines':
              result = [...new Set(input.split('\n'))].join('\n');
              break;
            case 'grep-tool':
              const regex = new RegExp(pattern, 'gi');
              result = input.split('\n').filter(line => regex.test(line)).join('\n');
              break;
            case 'text-diff':
              result = findTextDifferences(input, input2);
              break;
            case 'word-frequency':
              result = getWordFrequency(input);
              break;

            default:
              result = 'Tool not implemented yet';
          }
        }

        setToolOutput(result);
        if (toolId !== 'base64' || action !== 'decode') {
          setBase64Result(null);
        }
        toast.success('Tool executed successfully!');
      } catch (error) {
        setToolOutput(`Error: ${error.message}`);
        toast.error('Error executing tool');
      } finally {
        setIsProcessing(false);
      }
    }, 500); // Simulate processing time
  };

  // Helper functions for complex operations
  const vigenereProcess = (text, key, encrypt) => {
    if (!key) return 'Key required for Vigenère cipher';
    key = key.toUpperCase();
    let result = '';
    let keyIndex = 0;
    
    for (let char of text) {
      if (/[A-Z]/i.test(char)) {
        const base = char <= 'Z' ? 65 : 97;
        const shift = key.charCodeAt(keyIndex % key.length) - 65;
        const charShift = encrypt ? shift : -shift;
        result += String.fromCharCode(((char.charCodeAt(0) - base + charShift + 26) % 26) + base);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  };

  const textToMorse = (text) => {
    const morseCode = {
      'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
      'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
      'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
      'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
      'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
      '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
      '8': '---..', '9': '----.', ' ': '/'
    };
    return text.toUpperCase().split('').map(char => morseCode[char] || char).join(' ');
  };

  const morseToText = (morse) => {
    const morseToChar = {
      '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
      '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
      '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
      '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
      '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
      '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
      '---..': '8', '----.': '9', '/': ' '
    };
    return morse.split(' ').map(code => morseToChar[code] || code).join('');
  };

  const xorCipher = (text, key) => {
    if (!key) return 'Key required for XOR cipher';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  };

  const baconCipher = (text) => {
    const baconMap = {
      'A': 'AAAAA', 'B': 'AAAAB', 'C': 'AAABA', 'D': 'AAABB', 'E': 'AABAA',
      'F': 'AABAB', 'G': 'AABBA', 'H': 'AABBB', 'I': 'ABAAA', 'J': 'ABAAB',
      'K': 'ABABA', 'L': 'ABABB', 'M': 'ABBAA', 'N': 'ABBAB', 'O': 'ABBBA',
      'P': 'ABBBB', 'Q': 'BAAAA', 'R': 'BAAAB', 'S': 'BAABA', 'T': 'BAABB',
      'U': 'BABAA', 'V': 'BABAB', 'W': 'BABBA', 'X': 'BABBB', 'Y': 'BBAAA', 'Z': 'BBAAB'
    };
    return text.toUpperCase().split('').map(char => baconMap[char] || char).join(' ');
  };

  const crc32 = (str) => {
    let crc = 0 ^ (-1);
    for (let i = 0; i < str.length; i++) {
      crc = (crc >>> 8) ^ ((crc ^ str.charCodeAt(i)) & 0xFF);
    }
    return (crc ^ (-1)) >>> 0;
  };

  const identifyHash = (hash) => {
    const length = hash.length;
    let result = 'Possible hash types:\n';
    
    if (length === 32) result += '- MD5 (32 hex chars)\n- MD4 (32 hex chars)\n- NTLM (32 hex chars)\n';
    if (length === 40) result += '- SHA1 (40 hex chars)\n';
    if (length === 56) result += '- SHA224 (56 hex chars)\n';
    if (length === 64) result += '- SHA256 (64 hex chars)\n';
    if (length === 96) result += '- SHA384 (96 hex chars)\n';
    if (length === 128) result += '- SHA512 (128 hex chars)\n';
    if (length === 8) result += '- CRC32 (8 hex chars)\n';
    if (hash.startsWith('$2')) result += '- BCrypt\n';
    if (hash.startsWith('{SHA}')) result += '- SHA1 (Base64)\n';
    if (hash.startsWith('{MD5}')) result += '- MD5 (Base64)\n';
    
    return result || 'Unknown hash format';
  };

  const findTextDifferences = (text1, text2) => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    let result = 'Text Differences:\n\n';
    
    const maxLines = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      if (line1 !== line2) {
        result += `Line ${i + 1}:\n- Text 1: ${line1}\n+ Text 2: ${line2}\n\n`;
      }
    }
    
    return result;
  };

  const getWordFrequency = (text) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const frequency = {};
    words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => `${word}: ${count}`)
      .join('\n');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const openToolModal = (tool) => {
    setSelectedTool(tool);
    setToolInput('');
    setToolOutput('');
    setBase64Result(null);
    setSelectedAction('encode'); // Reset action selection
  };

  const closeToolModal = () => {
    setSelectedTool(null);
    setToolInput('');
    setToolOutput('');
    setSelectedAction('encode');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-slate-500/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Animated Header with Icon */}
        <div className="text-center mb-8">
          {/* Animated Logo Icon */}
          <div className="mb-6 animate-fadeInScale">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-xl border border-slate-600/50 animate-pulseGlow">
              <Shield size={32} className="text-slate-200 animate-floatSlow" />
            </div>
          </div>
          
          <p className="text-gray-400 text-lg max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Toolkit for security analysis and CTF challenges
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool, index) => {
            return (
              <div
                key={tool.id}
                className="tool-card group relative overflow-hidden h-48 flex flex-col"
                onClick={() => openToolModal(tool)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Gradient Border Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 via-slate-500/20 to-slate-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors duration-300 flex-1 min-h-[3.5rem] line-clamp-2">
                      {tool.name}
                    </h3>
                    <div className="ml-2 p-1 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors duration-300">
                      <Play size={16} className="text-slate-400 group-hover:text-slate-200 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors duration-300 line-clamp-3 flex-grow">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs px-3 py-1 bg-slate-700/60 text-slate-300 border border-slate-600/40 rounded-full group-hover:bg-slate-600/60 group-hover:border-slate-500/50 transition-all duration-300">
                      {tool.category}
                    </span>
                    
                    {/* Status Indicator */}
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300">Ready</span>
                    </div>
                  </div>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-600/5 to-slate-700/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <Search size={64} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No tools found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Tool Modal */}
        {selectedTool && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeToolModal();
              }
            }}
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                 onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-100">
                    {selectedTool.name}
                  </h2>
                </div>
                <button
                  onClick={closeToolModal}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <p className="text-gray-400 mb-6">{selectedTool.description}</p>

                <ToolInterface
                  tool={selectedTool}
                  input={toolInput}
                  setInput={setToolInput}
                  output={toolOutput}
                  isProcessing={isProcessing}
                  onExecute={executeTool}
                  onCopy={copyToClipboard}
                  selectedAction={selectedAction}
                  setSelectedAction={setSelectedAction}
                  base64Result={base64Result}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Tool Interface Component
const ToolInterface = ({ tool, input, setInput, output, isProcessing, onExecute, onCopy, selectedAction, setSelectedAction, base64Result }) => {
  const [key, setKey] = useState('');
  const [shift, setShift] = useState(3);
  const [input2, setInput2] = useState('');
  const [pattern, setPattern] = useState('');

  const handleExecute = (action) => {
    if (!input.trim() && !tool.hasTwoInputs) {
      toast.error('Please enter some input text');
      return;
    }
    onExecute(tool.id, input, action, key, shift, input2, pattern);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          rows={6}
        />
      </div>

      {/* Additional Inputs */}
      {tool.hasKey && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter key for cipher..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      )}

      {tool.hasShift && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Shift Value
          </label>
          <input
            type="number"
            value={shift}
            onChange={(e) => setShift(parseInt(e.target.value) || 0)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            min="0"
            max="25"
          />
        </div>
      )}

      {tool.hasTwoInputs && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Second Text (for comparison)
          </label>
          <textarea
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            placeholder="Enter second text here..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows={4}
          />
        </div>
      )}

      {tool.hasPattern && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Pattern (Regular Expression)
          </label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter search pattern..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      )}

      {/* Execute Buttons */}
      <div className="flex justify-center">
        {tool.action === 'dual' ? (
          <div className="flex space-x-3">
            <button
              onClick={() => handleExecute('encode')}
              disabled={isProcessing}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing && selectedAction === 'encode' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Code size={20} />
              )}
              <span>Encode</span>
            </button>
            <button
              onClick={() => handleExecute('decode')}
              disabled={isProcessing}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing && selectedAction === 'decode' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Play size={20} />
              )}
              <span>Decode</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleExecute(tool.action)}
            disabled={isProcessing}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play size={20} />
            )}
            <span>
              {tool.action === 'encode' ? 'Encode' : 
               tool.action === 'decode' ? 'Decode' : 'Execute'}
            </span>
          </button>
        )}
      </div>

      {/* Output Section */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              {base64Result && tool.id === 'base64' ? 'Final Result' : 'Output'}
            </label>
            <button
              onClick={() => onCopy(output)}
              className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Copy size={16} />
              <span>Copy</span>
            </button>
          </div>
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-gray-100 text-sm">{output}</pre>
          </div>
        </div>
      )}

      {/* Enhanced Base64 Layers Display */}
      {base64Result && tool.id === 'base64' && base64Result.layers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Decoding Layers ({base64Result.totalLayers} layer{base64Result.totalLayers !== 1 ? 's' : ''})
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                Multi-layer Base64
              </span>
              <button
                onClick={() => {
                  const layersText = base64Result.layers.map(layer => 
                    `Layer ${layer.layer}:\nInput: ${layer.input}\nOutput: ${layer.output}\n`
                  ).join('\n');
                  onCopy(`Final Result: ${base64Result.finalResult}\n\n${layersText}`);
                }}
                className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Copy size={16} />
                <span>Copy All</span>
              </button>
            </div>
          </div>
          <div className="bg-gray-900/80 border border-gray-600 rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {base64Result.layers.map((layer, index) => (
                <div key={index} className="border-b border-gray-700 last:border-b-0">
                  <div className="p-3 bg-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-400">
                        Layer {layer.layer}
                      </h4>
                      <button
                        onClick={() => onCopy(layer.output)}
                        className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Input:</span>
                        <pre className="text-xs text-gray-300 mt-1 p-2 bg-gray-900/60 rounded border-l-2 border-red-500/30 font-mono break-all whitespace-pre-wrap">
                          {layer.input.length > 100 ? `${layer.input.substring(0, 100)}...` : layer.input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Output:</span>
                        <pre className="text-xs text-gray-100 mt-1 p-2 bg-gray-900/60 rounded border-l-2 border-green-500/30 font-mono break-all whitespace-pre-wrap">
                          {layer.output}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;