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
  X,
  Target,
  Sparkles,
  Play,
  MousePointer,
  ChevronRight,
  Activity,
  Cpu,
  Database,
  History,
  Plus
} from 'lucide-react';
import axios from 'axios';
import { loadTools } from '../Toolscripts/toolLoader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tools, setTools] = useState([]);
  const navigate = useNavigate();

  // Load tools on component mount
  useEffect(() => {
    const loadedTools = loadTools();
    setTools(loadedTools);
  }, []);

  const stats = [
    { label: 'CTF Tools', value: '40+', icon: <Wrench size={24} />, color: 'text-slate-400' },
    { label: 'Categories', value: '8', icon: <Shield size={24} />, color: 'text-slate-400' },
    { label: 'Uptime', value: '99.9%', icon: <Activity size={24} />, color: 'text-green-400' },
    { label: 'Active Users', value: '1K+', icon: <Users size={24} />, color: 'text-slate-400' }
  ];

  // Mock changelog data for demonstration
  const changelogEntries = [
    {
      id: 1,
      title: 'New Multi-layer Base64 Decoder',
      content: 'Enhanced Base64 decoder now supports automatic detection and decoding of multiple encoding layers. Perfect for CTF challenges!',
      date: '2025-01-15',
      type: 'feature',
      important: false
    },
    {
      id: 2,
      title: 'Performance Improvements',
      content: 'Optimized file analysis engine for 40% faster processing of large binaries and enhanced memory usage.',
      date: '2025-01-12',
      type: 'improvement',
      important: false
    },
    {
      id: 3,
      title: 'Enhanced Cryptographic Tools',
      content: 'Added new cipher tools including Bacon cipher, MD4 hashing, and improved XOR cipher functionality.',
      date: '2025-01-10',
      type: 'feature',
      important: true
    }
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
    // Fetch announcements on page load
    fetchAnnouncements();
  }, [navigate]);

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

  const getChangelogIcon = (type) => {
    switch (type) {
      case 'feature': return <Plus size={20} className="text-green-400" />;
      case 'improvement': return <Zap size={20} className="text-blue-400" />;
      case 'fix': return <CheckCircle size={20} className="text-orange-400" />;
      default: return <Star size={20} className="text-purple-400" />;
    }
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
                ~ Everything you need to decode, hash, and inspect binaries, all in one place ~
              </p>
            </div>

            {/* Most Popular Tool Promotion */}
            <div className="max-w-md mx-auto mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div 
                className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer hover:border-blue-500/40"
                onClick={() => navigate('/tools', { state: { openTool: 'Encoding Detective', searchTerm: 'Encoding Detective' } })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="text-sm font-medium text-blue-300 group-hover:text-blue-200 transition-colors">
                        🔍 Try Encoding Detective
                      </div>
                      <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full font-medium">
                        MOST POPULAR
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                      Decode multi-layer encodings automatically
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform ml-3" />
                </div>
              </div>
            </div>

            {/* Centered Search Section */}
            <div className="max-w-2xl mx-auto mb-12 animate-floatSlow flex justify-center">
              <form onSubmit={handleToolSearch} className="relative w-full max-w-lg">
                <div className="relative group">
                  <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10 group-hover:scale-125 group-hover:text-blue-400 transition-all duration-300" />
                  <input
                    type="text"
                    placeholder="Search 40+ CTF tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/80 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 focus:border-blue-400 rounded-xl pl-14 pr-6 py-5 text-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 shadow-xl hover:shadow-2xl focus:shadow-2xl focus:shadow-blue-500/20 animate-shimmer transform hover:scale-[1.02] focus:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600/5 to-transparent opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none animate-pulse"></div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </div>
                
                {/* Search Results */}
                {searchTerm && filteredTools.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-20 animate-slideInDown">
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
                          className="p-4 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-all duration-200 group animate-fadeInUp"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors">
                                <tool.icon size={16} className={tool.iconColor || 'text-slate-400'} />
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
            </div>

            {/* Compact Encoding Detective Promotion */}
            <div className="max-w-md mx-auto mb-12 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div 
                className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4 group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer hover:border-blue-500/40"
                onClick={() => navigate('/tools', { state: { openTool: 'Encoding Detective', searchTerm: 'Encoding Detective' } })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                      <Search size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-300 group-hover:text-blue-200 transition-colors">
                        🔍 Try Encoding Detective
                      </div>
                      <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        Decode multi-layer encodings automatically
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Changelog Section */}
        <div className="space-y-6 mb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-200 flex items-center space-x-3">
              <History size={28} className="text-slate-400" />
              <span>Changelog</span>
            </h2>
          </div>

          <div className="grid gap-4">
            {changelogEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-900/60 hover:border-slate-600/70 transition-all duration-300 group relative"
              >
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${entry.important ? 'bg-red-600/20' : 'bg-slate-600/20'} group-hover:scale-110 transition-transform duration-300`}>
                    {entry.important ? <AlertCircle size={20} className="text-red-400" /> : getChangelogIcon(entry.type)}
                  </div>
                  <div className="flex-1 pr-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {entry.title}
                      </h3>
                      <div className="text-sm text-slate-500 flex items-center space-x-2">
                        <Clock size={14} />
                        <span>{new Date(entry.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                      {entry.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No announcements section - removed as requested */}
      </div>
    </div>
  );
};

export default HomePage;