import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Wrench,
  FileText,
  Github,
  PenTool,
  ExternalLink,
  Search,
  Code,
  Hash,
  Key,
  Lock,
  Star,
  TrendingUp,
  Clock,
  Award,
  Target,
  Sparkles,
  Play,
  MousePointer,
  ChevronRight,
  Activity,
  Cpu,
  Database
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Mock tools data for search functionality
  const tools = [
    { name: 'Base64 Encoder/Decoder', description: 'Encode/decode Base64 with multi-layer support', category: 'encoding', icon: <Code size={16} /> },
    { name: 'URL Encoder/Decoder', description: 'Encode/decode URL text', category: 'encoding', icon: <Code size={16} /> },
    { name: 'HTML Entity Encoder/Decoder', description: 'Encode/decode HTML entities', category: 'encoding', icon: <Code size={16} /> },
    { name: 'Hex Encoder/Decoder', description: 'Convert text to/from hexadecimal', category: 'encoding', icon: <Hash size={16} /> },
    { name: 'Binary Encoder/Decoder', description: 'Convert text to/from binary', category: 'encoding', icon: <Hash size={16} /> },
    { name: 'ASCII Encoder/Decoder', description: 'Convert text to/from ASCII codes', category: 'encoding', icon: <Hash size={16} /> },
    { name: 'Caesar Cipher', description: 'Classical substitution cipher with shift', category: 'crypto', icon: <Key size={16} /> },
    { name: 'ROT13 Cipher', description: 'ROT13 substitution cipher', category: 'crypto', icon: <Key size={16} /> },
    { name: 'ROT47 Cipher', description: 'ROT47 substitution cipher', category: 'crypto', icon: <Key size={16} /> },
    { name: 'Vigenère Encrypt', description: 'Encrypt using Vigenère cipher', category: 'crypto', icon: <Lock size={16} /> },
    { name: 'Vigenère Decrypt', description: 'Decrypt Vigenère cipher', category: 'crypto', icon: <Lock size={16} /> },
    { name: 'Atbash Cipher', description: 'Hebrew substitution cipher', category: 'crypto', icon: <Key size={16} /> },
    { name: 'Morse Code Encoder', description: 'Convert text to Morse code', category: 'crypto', icon: <Zap size={16} /> },
    { name: 'Morse Code Decoder', description: 'Convert Morse code to text', category: 'crypto', icon: <Zap size={16} /> },
    { name: 'MD5 Hash', description: 'Generate MD5 hash', category: 'hash', icon: <Hash size={16} /> },
    { name: 'SHA1 Hash', description: 'Generate SHA1 hash', category: 'hash', icon: <Hash size={16} /> },
    { name: 'SHA256 Hash', description: 'Generate SHA256 hash', category: 'hash', icon: <Hash size={16} /> },
    { name: 'SHA512 Hash', description: 'Generate SHA512 hash', category: 'hash', icon: <Hash size={16} /> },
    { name: 'Hash Identifier', description: 'Identify hash type', category: 'hash', icon: <Target size={16} /> },
    { name: 'Case Converter', description: 'Convert text case (upper/lower/title)', category: 'text', icon: <Code size={16} /> },
    { name: 'Text Length Counter', description: 'Count characters, words, lines', category: 'text', icon: <Hash size={16} /> },
    { name: 'Whitespace Remover', description: 'Remove extra whitespace', category: 'text', icon: <Code size={16} /> },
    { name: 'Line Sorter', description: 'Sort lines alphabetically', category: 'text', icon: <Code size={16} /> },
    { name: 'Unique Lines', description: 'Remove duplicate lines', category: 'text', icon: <Code size={16} /> },
    { name: 'Grep Tool', description: 'Search for patterns in text', category: 'text', icon: <Search size={16} /> },
    { name: 'Text Diff', description: 'Compare two texts', category: 'text', icon: <Code size={16} /> },
    { name: 'Word Frequency', description: 'Count word occurrences', category: 'text', icon: <TrendingUp size={16} /> }
  ];

  const stats = [
    { label: 'CTF Tools', value: '40+', icon: <Wrench size={24} />, color: 'text-slate-400' },
    { label: 'Categories', value: '8', icon: <Shield size={24} />, color: 'text-slate-400' },
    { label: 'Uptime', value: '99.9%', icon: <Activity size={24} />, color: 'text-green-400' },
    { label: 'Active Users', value: '1K+', icon: <Users size={24} />, color: 'text-slate-400' }
  ];

  const features = [
    {
      title: 'Advanced Encoding',
      description: 'Multi-layer Base64, URL encoding, HTML entities with automatic detection.',
      icon: <Code size={32} />,
      color: 'from-slate-600 to-slate-700'
    },
    {
      title: 'Cryptographic Ciphers',
      description: 'Classical and modern ciphers including Caesar, Vigenère, ROT variants.',
      icon: <Key size={32} />,
      color: 'from-slate-600 to-slate-700'
    },
    {
      title: 'Hash Functions',
      description: 'Generate and identify various hash types with collision detection.',
      icon: <Hash size={32} />,
      color: 'from-slate-600 to-slate-700'
    },
    {
      title: 'Text Processing',
      description: 'Advanced text manipulation and analysis tools for CTF challenges.',
      icon: <FileText size={32} />,
      color: 'from-slate-600 to-slate-700'
    }
  ];

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API}/announcements`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/tools');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      encoding: 'bg-slate-700/20 text-slate-300 border-slate-600/30',
      crypto: 'bg-slate-700/20 text-slate-300 border-slate-600/30',
      hash: 'bg-slate-700/20 text-slate-300 border-slate-600/30',
      text: 'bg-slate-700/20 text-slate-300 border-slate-600/30'
    };
    return colors[category] || 'bg-slate-700/20 text-slate-300 border-slate-600/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          
          <div className="relative z-10 pt-8 pb-8">
            {/* Logo */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-xl mb-6 border border-slate-600/50">
                <Shield size={36} className="text-slate-200" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              SectoolBox
            </h1>
            
            <div className="mb-8">
              <p className="text-xl md:text-2xl text-slate-300 mb-4">
                Professional CTF & Security Analysis Platform
              </p>
              <p className="text-lg text-slate-400 font-mono">
                // Advanced toolset for cybersecurity professionals
              </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-900/60 transition-all duration-300"
                >
                  <div className={`flex items-center justify-center mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-200 mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleToolSearch} className="relative">
                <div className="relative group">
                  <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search 40+ CTF tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/80 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500/70 focus:border-slate-400 rounded-xl pl-14 pr-6 py-5 text-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all duration-300 shadow-xl"
                  />
                </div>
                
                {/* Search Results */}
                {searchTerm && filteredTools.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-20">
                    <div className="p-2">
                      {filteredTools.slice(0, 8).map((tool, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchTerm('');
                            navigate('/tools');
                          }}
                          className="p-4 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors">
                                {tool.icon}
                              </div>
                              <div>
                                <h4 className="text-slate-200 font-medium group-hover:text-white transition-colors">
                                  {tool.name}
                                </h4>
                                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                                  {tool.description}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 border rounded-full ${getCategoryColor(tool.category)}`}>
                              {tool.category}
                            </span>
                          </div>
                        </div>
                      ))}
                      {filteredTools.length > 8 && (
                        <div className="p-3 text-center border-t border-slate-700">
                          <button 
                            onClick={() => navigate('/tools')}
                            className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors flex items-center space-x-2 mx-auto"
                          >
                            <span>View all {filteredTools.length} results</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {searchTerm && filteredTools.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl p-6 text-center z-20">
                    <AlertCircle size={32} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-slate-400">No tools found matching "<span className="text-slate-300">{searchTerm}</span>"</p>
                  </div>
                )}
              </form>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link 
                  to="/tools" 
                  className="group bg-slate-800/60 hover:bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500/70 text-slate-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:shadow-lg transform hover:scale-105"
                >
                  <Wrench size={20} />
                  <span>Browse All Tools</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/analysis" 
                  className="group bg-slate-800/60 hover:bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500/70 text-slate-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:shadow-lg transform hover:scale-105"
                >
                  <FileText size={20} />
                  <span>File Analysis</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-slate-400 text-lg">Advanced tools designed for security professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-900/60 hover:border-slate-600/70 transition-all duration-300 group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-200 flex items-center space-x-3">
                <Calendar size={28} className="text-slate-400" />
                <span>Latest Updates</span>
              </h2>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <div className="grid gap-4">
              {announcements.slice(0, 3).map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-900/60 hover:border-slate-600/70 transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${announcement.is_important ? 'bg-red-600/20 text-red-400' : 'bg-slate-600/20 text-slate-400'} group-hover:scale-110 transition-transform duration-300`}>
                      {announcement.is_important ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors">
                        {announcement.title}
                      </h3>
                      <p className="text-slate-400 mb-3 group-hover:text-slate-300 transition-colors">
                        {announcement.content}
                      </p>
                      <div className="text-sm text-slate-500 flex items-center space-x-2">
                        <Clock size={14} />
                        <span>{new Date(announcement.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;