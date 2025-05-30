import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Wrench,
  FileText
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fadeInUp">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl animate-pulse-glow">
                <Shield size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="heading-xl mb-6 animate-gradient">
              SectoolBox
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Your Complete CTF Toolkit
            </p>
            
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Professional-grade tools for Capture The Flag competitions, penetration testing, 
              and cybersecurity analysis. All tools run locally for maximum security.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/tools" className="btn-primary group">
                <Wrench size={20} className="inline mr-2" />
                Explore Tools
                <ArrowRight size={20} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link to="/analysis" className="btn-secondary group">
                <FileText size={20} className="inline mr-2" />
                Analyze Files
                <ArrowRight size={20} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fadeInUp">
            <div className="tool-card text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap size={24} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">40+ CTF Tools</h3>
              <p className="text-gray-400">
                Complete suite of encoding, decoding, cryptographic, and analysis tools
              </p>
            </div>

            <div className="tool-card text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield size={24} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Secure Analysis</h3>
              <p className="text-gray-400">
                All processing happens locally - your files never leave your browser
              </p>
            </div>

            <div className="tool-card text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Professional Grade</h3>
              <p className="text-gray-400">
                Used by cybersecurity professionals and CTF teams worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Calendar size={24} className="text-purple-400 mr-3" />
            <h2 className="heading-lg">Latest Announcements</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    className={`tool-card ${announcement.is_important ? 'border-amber-500/30 bg-amber-500/5' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        announcement.is_important 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'bg-blue-500/20 text-blue-400'
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
                          <span className="text-sm text-gray-400 flex-shrink-0">
                            {formatDate(announcement.date)}
                          </span>
                        </div>
                        <p className="text-gray-300">{announcement.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No announcements yet. Check back later for updates!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="tool-card">
            <h3 className="heading-md mb-4">Ready to Start?</h3>
            <p className="text-gray-400 mb-8">
              Join thousands of cybersecurity professionals using SectoolBox for their CTF challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tools" className="btn-primary">
                Browse All Tools
              </Link>
              <Link to="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;