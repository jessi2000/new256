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
  MousePointer
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
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
    { label: 'CTF Tools', value: '40+', icon: <Wrench size={20} />, color: 'text-blue-400' },
    { label: 'Categories', value: '8', icon: <Shield size={20} />, color: 'text-purple-400' },
    { label: 'Uptime', value: '99.9%', icon: <Clock size={20} />, color: 'text-green-400' },
    { label: 'Users', value: '1K+', icon: <Users size={20} />, color: 'text-orange-400' }
  ];

  const features = [
    {
      title: 'Advanced Encoding',
      description: 'Multi-layer Base64, URL encoding, HTML entities, and more sophisticated encoding tools.',
      icon: <Code size={32} />,
      color: 'from-blue-500 to-cyan-500',
      highlights: ['Multi-layer decoding', 'Automatic detection', 'Batch processing']
    },
    {
      title: 'Cryptographic Ciphers',
      description: 'Classical and modern ciphers including Caesar, Vigenère, ROT variants, and Morse code.',
      icon: <Key size={32} />,
      color: 'from-purple-500 to-pink-500',
      highlights: ['Classical ciphers', 'Modern algorithms', 'Key analysis']
    },
    {
      title: 'Hash Functions',
      description: 'Generate and identify various hash types including MD5, SHA family, and hash cracking tools.',
      icon: <Hash size={32} />,
      color: 'from-green-500 to-emerald-500',
      highlights: ['Multiple hash types', 'Hash identification', 'Collision detection']
    },
    {
      title: 'Text Processing',
      description: 'Advanced text manipulation, analysis, and processing tools for CTF challenges.',
      icon: <FileText size={32} />,
      color: 'from-orange-500 to-red-500',
      highlights: ['Pattern matching', 'Text analysis', 'Format conversion']
    }
  ];

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchAnnouncements();
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      encoding: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      crypto: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      hash: 'bg-green-500/10 text-green-400 border-green-500/30',
      text: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    };
    return colors[category] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      {/* Interactive Mouse Follower */}
      <div 
        className="fixed w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none z-0 transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          opacity: isHoveringHero ? 0.6 : 0.3
        }}
      />

      {/* Enhanced Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0">
          {/* Sparkle effects */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <Sparkles size={12 + Math.random() * 8} className="text-yellow-400/40" />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Hero Section */}
        <div 
          className="text-center mb-16 relative"
          onMouseEnter={() => setIsHoveringHero(true)}
          onMouseLeave={() => setIsHoveringHero(false)}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-3xl blur-3xl transform transition-all duration-1000 hover:scale-110 hover:from-purple-600/20 hover:via-blue-600/20 hover:to-cyan-600/20"></div>
          
          <div className="relative z-10 pt-16 pb-8">
            {/* Animated Logo */}
            <div className="mb-8 transform transition-all duration-700 hover:scale-110">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl shadow-purple-500/25 mb-6 transform hover:rotate-6 transition-all duration-500 hover:shadow-purple-500/40">
                <Shield size={40} className="text-white animate-pulse" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent animate-fadeInUp">
              SectoolBox
            </h1>
            
            <div className="relative mb-8">
              <p className="text-xl md:text-2xl text-gray-300 mb-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                The Ultimate CTF & Security Analysis Platform
              </p>
              
              {/* Typewriter Effect */}
              <div className="h-8 mb-6">
                <p className="text-lg text-purple-400 font-mono animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  {"// Ready for your next security challenge...".split('').map((char, i) => (
                    <span 
                      key={i} 
                      className="inline-block opacity-0 animate-fadeInUp"
                      style={{ animationDelay: `${0.6 + i * 0.05}s`, animationFillMode: 'forwards' }}
                    >
                      {char}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Live Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 hover:border-slate-500/50 group"
                >
                  <div className={`flex items-center justify-center mb-2 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tool Search Section */}
            <div className="max-w-2xl mx-auto mb-16 animate-fadeInUp" style={{ animationDelay: '1s' }}>
              <form onSubmit={handleToolSearch} className="relative">
                <div className="relative group">
                  <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-all duration-300 z-10 group-hover:scale-110" />
                  <input
                    type="text"
                    placeholder="Search 40+ CTF tools... Try 'base64', 'hash', or 'cipher'"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800/80 backdrop-blur-sm border-2 border-gray-600 hover:border-purple-500/50 focus:border-purple-500 rounded-2xl pl-14 pr-6 py-6 text-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 shadow-xl shadow-gray-900/50 hover:shadow-purple-500/10 focus:shadow-purple-500/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  {/* Animated border effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none blur-sm"></div>
                </div>
                
                {/* Enhanced Search Results Dropdown */}
                {searchTerm && filteredTools.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl shadow-2xl shadow-black/50 max-h-96 overflow-y-auto z-20 animate-fadeInUp">
                    <div className="p-2">
                      {filteredTools.slice(0, 8).map((tool, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchTerm('');
                            navigate('/tools');
                          }}
                          className="p-4 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-all duration-200 group hover:scale-[1.02]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-700/50 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                                {tool.icon}
                              </div>
                              <div>
                                <h4 className="text-gray-100 font-medium group-hover:text-white transition-colors">
                                  {tool.name}
                                </h4>
                                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
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
                        <div className="p-3 text-center border-t border-gray-700">
                          <button 
                            onClick={() => navigate('/tools')}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center space-x-2 mx-auto group"
                          >
                            <span>View all {filteredTools.length} results</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {searchTerm && filteredTools.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl shadow-2xl shadow-black/50 p-6 text-center z-20 animate-fadeInUp">
                    <AlertCircle size={32} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400">No tools found matching "<span className="text-purple-400">{searchTerm}</span>"</p>
                    <p className="text-gray-500 text-sm mt-1">Try searching for 'base64', 'hash', 'cipher', or 'encoding'</p>
                  </div>
                )}
              </form>
              
              {/* Quick Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link 
                  to="/tools" 
                  className="group bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105"
                >
                  <Wrench size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>Browse All Tools</span>
                  <Sparkles size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                
                <Link 
                  to="/analysis" 
                  className="group bg-gradient-to-r from-slate-600/20 to-gray-700/20 hover:from-slate-600/30 hover:to-gray-700/30 backdrop-blur-sm border border-gray-600 hover:border-slate-500 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:shadow-lg transform hover:scale-105"
                >
                  <FileText size={20} className="group-hover:scale-110 transition-transform duration-300" />
                  <span>File Analysis</span>
                  <Play size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Features Showcase */}
        <div className="mb-16 animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-gray-400 text-lg">Advanced tools designed for CTF professionals</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature Tabs */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                    activeFeature === index
                      ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} ${activeFeature === index ? 'scale-110' : ''} transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-100 mb-2">{feature.title}</h3>
                      <p className="text-gray-400 mb-3">{feature.description}</p>
                      {activeFeature === index && (
                        <div className="space-y-1 animate-fadeInUp">
                          {feature.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-purple-400">
                              <CheckCircle size={14} />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Display */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-8 h-full">
                <div className="text-center">
                  <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-r ${features[activeFeature].color} mb-6 transform transition-all duration-500 hover:scale-110`}>
                    {React.cloneElement(features[activeFeature].icon, { size: 48 })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-4">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {features[activeFeature].description}
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {features[activeFeature].highlights.map((highlight, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-center space-x-3 bg-gray-700/30 rounded-lg p-3 animate-fadeInUp"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <Star size={16} className="text-yellow-400" />
                        <span className="text-gray-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Animated corner accent */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '1.4s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-100 flex items-center space-x-3">
                <Calendar size={28} className="text-blue-400" />
                <span>Latest Updates</span>
              </h2>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <div className="grid gap-4">
              {announcements.slice(0, 3).map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all duration-300 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/10 group hover:scale-[1.02]"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${announcement.is_important ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'} group-hover:scale-110 transition-transform duration-300`}>
                      {announcement.is_important ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-400 mb-3 group-hover:text-gray-300 transition-colors">
                        {announcement.content}
                      </p>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
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

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes float-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
          50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;