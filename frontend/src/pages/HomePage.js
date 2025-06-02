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
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          
          <div className="relative z-10 pt-8 pb-8">

            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent animate-fadeInScale">
              SectoolBox
            </h1>
            
            <div className="mb-8">
              <p className="text-lg text-slate-400 font-mono animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                // Advanced toolset for cybersecurity professionals
              </p>
            </div>

            {/* Animated Search Section */}
            <div className="max-w-2xl mx-auto mb-12 animate-floatSlow">
              <form onSubmit={handleToolSearch} className="relative">
                <div className="relative group">
                  <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10 group-hover:scale-110 transition-transform duration-300" />
                  <input
                    type="text"
                    placeholder="Search 40+ CTF tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/80 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500/70 focus:border-slate-400 rounded-xl pl-14 pr-6 py-5 text-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all duration-300 shadow-xl hover:shadow-2xl focus:shadow-2xl animate-shimmer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
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
                            navigate('/tools', { 
                              state: { 
                                openTool: tool.name,
                                searchTerm: tool.name 
                              } 
                            });
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
              
              {/* Impressive Card Carousel */}
              <div className="mt-12 mb-8">
                <h3 className="text-2xl font-bold text-center text-slate-200 mb-8">
                  Explore SectoolBox
                </h3>
                
                <div className="relative overflow-hidden">
                  {/* Card Container */}
                  <div className="flex items-center justify-center space-x-8 py-8">
                    {[
                      {
                        to: '/tools',
                        title: 'Security Tools',
                        description: 'Comprehensive toolkit with 42+ CTF tools for encoding, cryptography, and analysis',
                        icon: '🛠️',
                        gradient: 'from-blue-600 to-purple-600',
                        delay: '0s'
                      },
                      {
                        to: '/analysis',
                        title: 'File Analysis',
                        description: 'Advanced file analysis with hex dumps, string extraction, and metadata scanning',
                        icon: '📄',
                        gradient: 'from-green-600 to-blue-600',
                        delay: '0.2s'
                      },
                      {
                        to: '/custom',
                        title: 'Custom Scripts',
                        description: 'Execute custom security scripts and tools for specialized analysis tasks',
                        icon: '⚡',
                        gradient: 'from-purple-600 to-pink-600',
                        delay: '0.4s'
                      },
                      {
                        to: '/about',
                        title: 'About Us',
                        description: 'Learn about our mission, team, and the technology behind SectoolBox',
                        icon: '👥',
                        gradient: 'from-orange-600 to-red-600',
                        delay: '0.6s'
                      },
                      {
                        to: '/',
                        title: 'Home',
                        description: 'Return to the main dashboard with latest updates and quick access',
                        icon: '🏠',
                        gradient: 'from-slate-600 to-gray-600',
                        delay: '0.8s'
                      }
                    ].map((page, index) => (
                      <Link
                        key={page.to}
                        to={page.to}
                        className="group relative block transform transition-all duration-500 hover:scale-110 animate-fadeInScale"
                        style={{ animationDelay: page.delay }}
                      >
                        {/* Card */}
                        <div className="relative w-64 h-80 rounded-2xl overflow-hidden">
                          {/* Background with gradient */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${page.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          
                          {/* Animated border */}
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pulse"></div>
                          </div>
                          
                          {/* Floating particles effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-1 h-1 bg-white/60 rounded-full animate-bounce"
                                style={{
                                  left: `${20 + (i * 12)}%`,
                                  top: `${15 + (i * 8)}%`,
                                  animationDelay: `${i * 0.2}s`,
                                  animationDuration: '2s'
                                }}
                              />
                            ))}
                          </div>
                          
                          {/* Content */}
                          <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
                            {/* Icon */}
                            <div className="text-center">
                              <div className="text-6xl mb-4 transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                                {page.icon}
                              </div>
                              <h4 className="text-xl font-bold mb-3 group-hover:text-yellow-200 transition-colors duration-300">
                                {page.title}
                              </h4>
                            </div>
                            
                            {/* Description */}
                            <p className="text-sm text-white/90 text-center leading-relaxed group-hover:text-white transition-colors duration-300">
                              {page.description}
                            </p>
                            
                            {/* Arrow indicator */}
                            <div className="text-center mt-4">
                              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 group-hover:bg-white/30 transition-all duration-300">
                                <span className="text-sm font-medium">Explore</span>
                                <ChevronRight size={16} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Shine effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
                          </div>
                        </div>
                        
                        {/* Shadow */}
                        <div className="absolute inset-0 bg-black/20 rounded-2xl blur-xl transform translate-y-4 opacity-0 group-hover:opacity-60 transition-all duration-300 -z-10"></div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
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