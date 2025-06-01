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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-slate-700/50">
                  <img 
                    src="https://avatars.githubusercontent.com/u/185730623?v=4" 
                    alt="Zebbern"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-slate-800/60 border border-slate-700/50 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                    <Users size={48} className="text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-white">Zebbern</h3>
                <p className="text-slate-400 mb-2">Lead Developer</p>
                <p className="text-slate-500 text-sm mb-3">Security researcher and CTF enthusiast with expertise in tool development.</p>
                <a
                  href="https://github.com/zebbern"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-slate-700/50">
                  <img 
                    src="https://avatars.githubusercontent.com/u/150441423?v=4" 
                    alt="Opkimmi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-slate-800/60 border border-slate-700/50 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                    <Users size={48} className="text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-white">Opkimmi</h3>
                <p className="text-slate-400 mb-2">Security Engineer</p>
                <p className="text-slate-500 text-sm mb-3">Cybersecurity specialist focusing on penetration testing and vulnerability research.</p>
                <a
                  href="https://github.com/Opkimmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
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