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
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                to="/tools" 
                className="group bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-xl hover:shadow-slate-500/25 transform hover:scale-105"
              >
                <Wrench size={24} />
                <span>Explore Tools</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/file-analysis" 
                className="group bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-slate-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-xl hover:shadow-gray-500/25 transform hover:scale-105"
              >
                <FileText size={24} />
                <span>Analyze Files</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
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