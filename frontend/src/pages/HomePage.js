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
  Search
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
    { name: 'Base64 Encoder/Decoder', description: 'Encode/decode Base64 with multi-layer support', category: 'encoding' },
    { name: 'URL Encoder/Decoder', description: 'Encode/decode URL text', category: 'encoding' },
    { name: 'HTML Entity Encoder/Decoder', description: 'Encode/decode HTML entities', category: 'encoding' },
    { name: 'Hex Encoder/Decoder', description: 'Convert text to/from hexadecimal', category: 'encoding' },
    { name: 'Binary Encoder/Decoder', description: 'Convert text to/from binary', category: 'encoding' },
    { name: 'ASCII Encoder/Decoder', description: 'Convert text to/from ASCII codes', category: 'encoding' },
    { name: 'Caesar Cipher', description: 'Classical substitution cipher with shift', category: 'crypto' },
    { name: 'ROT13 Cipher', description: 'ROT13 substitution cipher', category: 'crypto' },
    { name: 'ROT47 Cipher', description: 'ROT47 substitution cipher', category: 'crypto' },
    { name: 'Vigenère Encrypt', description: 'Encrypt using Vigenère cipher', category: 'crypto' },
    { name: 'Vigenère Decrypt', description: 'Decrypt Vigenère cipher', category: 'crypto' },
    { name: 'Atbash Cipher', description: 'Hebrew substitution cipher', category: 'crypto' },
    { name: 'Morse Code Encoder', description: 'Convert text to Morse code', category: 'crypto' },
    { name: 'Morse Code Decoder', description: 'Convert Morse code to text', category: 'crypto' },
    { name: 'MD5 Hash', description: 'Generate MD5 hash', category: 'hash' },
    { name: 'SHA1 Hash', description: 'Generate SHA1 hash', category: 'hash' },
    { name: 'SHA256 Hash', description: 'Generate SHA256 hash', category: 'hash' },
    { name: 'SHA512 Hash', description: 'Generate SHA512 hash', category: 'hash' },
    { name: 'Hash Identifier', description: 'Identify hash type', category: 'hash' },
    { name: 'Case Converter', description: 'Convert text case (upper/lower/title)', category: 'text' },
    { name: 'Text Length Counter', description: 'Count characters, words, lines', category: 'text' },
    { name: 'Whitespace Remover', description: 'Remove extra whitespace', category: 'text' },
    { name: 'Line Sorter', description: 'Sort lines alphabetically', category: 'text' },
    { name: 'Unique Lines', description: 'Remove duplicate lines', category: 'text' },
    { name: 'Grep Tool', description: 'Search for patterns in text', category: 'text' },
    { name: 'Text Diff', description: 'Compare two texts', category: 'text' },
    { name: 'Word Frequency', description: 'Count word occurrences', category: 'text' }
  ];

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToolSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/tools');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API}/announcements`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // Add some demo announcements if API fails
      setAnnouncements([
        {
          id: '1',
          title: 'Welcome to SectoolBox',
          content: 'Your comprehensive CTF toolkit is now ready! Explore 40+ tools and advanced file analysis features.',
          date: new Date().toISOString(),
          is_important: true
        },
        {
          id: '2',
          title: 'New Tools Added',
          content: 'Added advanced cryptographic tools including Vigenère cipher and improved binary analysis.',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          is_important: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
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
      {/* Hero Section */}
      <div className="relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Heading */}
            <h1 className="heading-xl mb-8 max-w-4xl mx-auto">
              SectoolBox
            </h1>
            
            {/* Tool Search Section */}
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={handleToolSearch} className="relative">
                <div className="relative group">
                  <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-300 transition-colors z-10" />
                  <input
                    type="text"
                    placeholder="Search 40+ CTF tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800/80 backdrop-blur-sm border-2 border-gray-600 hover:border-slate-500 focus:border-blue-500 rounded-2xl pl-14 pr-6 py-6 text-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-xl shadow-gray-900/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                {/* Search Results Dropdown */}
                {searchTerm && filteredTools.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl shadow-2xl shadow-black/50 max-h-96 overflow-y-auto z-20">
                    <div className="p-2">
                      {filteredTools.slice(0, 8).map((tool, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchTerm('');
                            navigate('/tools');
                          }}
                          className="p-4 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-gray-100 font-medium group-hover:text-white transition-colors">
                                {tool.name}
                              </h4>
                              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                                {tool.description}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded">
                              {tool.category}
                            </span>
                          </div>
                        </div>
                      ))}
                      {filteredTools.length > 8 && (
                        <div className="p-3 text-center border-t border-gray-700">
                          <button 
                            onClick={() => navigate('/tools')}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                          >
                            View all {filteredTools.length} results →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {searchTerm && filteredTools.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl shadow-2xl shadow-black/50 p-6 text-center z-20">
                    <AlertCircle size={32} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-400">No tools found matching "{searchTerm}"</p>
                  </div>
                )}
              </form>
              
              {/* Quick Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link 
                  to="/tools" 
                  className="group bg-gradient-to-r from-slate-600/20 to-gray-700/20 hover:from-slate-600/30 hover:to-gray-700/30 backdrop-blur-sm border border-gray-600 hover:border-slate-500 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:shadow-lg transform hover:scale-105"
                >
                  <Wrench size={20} />
                  <span>Browse All Tools</span>
                </Link>
                
                <Link 
                  to="/analysis" 
                  className="group bg-gradient-to-r from-slate-600/20 to-gray-700/20 hover:from-slate-600/30 hover:to-gray-700/30 backdrop-blur-sm border border-gray-600 hover:border-slate-500 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:shadow-lg transform hover:scale-105"
                >
                  <FileText size={20} />
                  <span>File Analysis</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-lg flex items-center space-x-3">
              <Calendar size={32} className="text-slate-400" />
              <span>Latest Updates</span>
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-700 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-xl">
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No announcements</h3>
                  <p className="text-gray-500">Check back later for updates!</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        announcement.is_important 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {announcement.is_important ? (
                          <AlertCircle size={20} />
                        ) : (
                          <CheckCircle size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-100">
                            {announcement.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {formatDate(announcement.date)}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {announcement.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-slate-900 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Brand & Links */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-3">
                <h3 className="text-xl font-bold text-gradient">SectoolBox</h3>
                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">Professional CTF & Security Analysis Platform</p>
              
              {/* Social Links */}
              <div className="flex justify-center md:justify-start space-x-3">
                <a
                  href="https://github.com/zebbern"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 bg-gray-800/60 hover:bg-gray-700 border border-gray-600 hover:border-slate-500 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
                >
                  <Github size={16} className="text-gray-400 group-hover:text-white" />
                  <span className="text-gray-300 group-hover:text-white text-sm">GitHub</span>
                </a>
                
                <a
                  href="https://medium.com/@zebbern"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 bg-gray-800/60 hover:bg-gray-700 border border-gray-600 hover:border-slate-500 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
                >
                  <PenTool size={16} className="text-gray-400 group-hover:text-white" />
                  <span className="text-gray-300 group-hover:text-white text-sm">Medium</span>
                </a>
              </div>
            </div>

            {/* Right: Quick Stats & Info */}
            <div className="text-center md:text-right">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="text-slate-400 text-lg font-bold">40+</div>
                  <div className="text-gray-500 text-xs">CTF Tools</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="text-slate-400 text-lg font-bold">24/7</div>
                  <div className="text-gray-500 text-xs">Available</div>
                </div>
              </div>
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} • Built for Security Professionals
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;