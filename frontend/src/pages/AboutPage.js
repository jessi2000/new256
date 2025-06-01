import React from 'react';
import { Shield, Users, Code, Zap, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 relative overflow-hidden">
      <div className="container mx-auto px-4 py-12 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
            About SectoolBox
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Professional cybersecurity toolkit for security researchers and CTF enthusiasts
          </p>
        </div>

        {/* Platform Description */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-slate-300">Our Platform</h2>
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-lg">
            <p className="text-slate-300 mb-4">
              SectoolBox is a comprehensive platform designed for cybersecurity professionals, CTF enthusiasts, and security researchers. 
              Our mission is to provide a unified toolkit that simplifies common security tasks and enhances your workflow.
            </p>
            <p className="text-slate-300 mb-4">
              Whether you're participating in Capture The Flag competitions, performing security assessments, or learning about cybersecurity, 
              SectoolBox offers a wide range of tools to help you succeed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start">
                <div className="bg-slate-700/40 p-3 rounded-lg mr-4">
                  <Shield className="text-slate-400" size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Security-Focused</h3>
                  <p className="text-slate-400">Built with security best practices in mind</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-slate-700/40 p-3 rounded-lg mr-4">
                  <Code className="text-slate-400" size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Open Source</h3>
                  <p className="text-slate-400">Transparent, community-driven development</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-slate-700/40 p-3 rounded-lg mr-4">
                  <Zap className="text-slate-400" size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Fast & Efficient</h3>
                  <p className="text-slate-400">Optimized for performance and usability</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-slate-700/40 p-3 rounded-lg mr-4">
                  <Heart className="text-slate-400" size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">User-Friendly</h3>
                  <p className="text-slate-400">Designed with the user experience in mind</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-slate-300">Our Team</h2>
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-slate-800/60 border border-slate-700/50 rounded-full mb-4 flex items-center justify-center">
                  <Users size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-medium text-white">Alex Chen</h3>
                <p className="text-slate-400 mb-2">Lead Developer</p>
                <p className="text-slate-500 text-sm">Security researcher with a passion for CTF competitions and tool development.</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-slate-800/60 border border-slate-700/50 rounded-full mb-4 flex items-center justify-center">
                  <Users size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-medium text-white">Samantha Lee</h3>
                <p className="text-slate-400 mb-2">Security Engineer</p>
                <p className="text-slate-500 text-sm">Specializes in cryptography and secure coding practices.</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-slate-800/60 border border-slate-700/50 rounded-full mb-4 flex items-center justify-center">
                  <Users size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-medium text-white">Marcus Johnson</h3>
                <p className="text-slate-400 mb-2">UI/UX Designer</p>
                <p className="text-slate-500 text-sm">Creates intuitive interfaces that enhance the security workflow.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-300">Get In Touch</h2>
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-lg">
            <p className="text-slate-300 mb-6">
              Have questions, suggestions, or want to contribute to the project? We'd love to hear from you!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="mailto:contact@sectoolbox.com" className="btn-secondary w-full text-center">
                Email Us
              </a>
              <a href="https://github.com/sectoolbox" target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-center">
                GitHub Repository
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
    </div>
  );
};

export default AboutPage;