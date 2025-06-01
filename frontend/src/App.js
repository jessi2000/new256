import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  Home, 
  Wrench, 
  FileText, 
  Users, 
  Shield,
  Search,
  Menu,
  X,
  Code,
  Github,
  PenTool
} from 'lucide-react';
import './App.css';

// Import page components
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import FileAnalysisPage from './pages/FileAnalysisPage';
import CustomPage from './pages/CustomPage';
import AboutPage from './pages/AboutPage';

const NavLink = ({ to, children, icon: Icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative group ${
        isActive 
          ? 'bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-500/20' 
          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
      }`}
    >
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
      )}
      <Icon size={20} />
      <span className="font-medium">{children}</span>
    </Link>
  );
};

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/tools', label: 'Tools', icon: Wrench },
    { to: '/analysis', label: 'File Analysis', icon: FileText },
    { to: '/custom', label: 'Custom', icon: Code },
    { to: '/about', label: 'About', icon: Users }
  ];

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                SectoolBox
              </h1>
              <p className="text-xs text-gray-400">CTF Toolkit</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700/50">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} icon={item.icon}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-blue-950 border-t border-blue-500/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Brand & Links */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-3">
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent">SectoolBox</h3>
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">Professional CTF & Security Analysis Platform</p>
            
            {/* Social Links */}
            <div className="flex justify-center md:justify-start space-x-3">
              <a
                href="https://discord.gg/CNsTEPDmKr"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-400/50 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/20"
              >
                <svg className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span className="text-indigo-300 group-hover:text-indigo-200 text-sm font-medium">Discord</span>
              </a>
              
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
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 flex flex-col">
        {/* Consistent Background Particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0">
            {/* Primary particles */}
            {[...Array(15)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-slate-500/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `smoothRandomFloat ${20 + Math.random() * 15}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 20}s`,
                }}
              />
            ))}
            
            {/* Secondary particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={`particle2-${i}`}
                className="absolute w-1.5 h-1.5 bg-purple-500/15 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `smoothRandomFloat2 ${25 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 25}s`,
                }}
              />
            ))}
            
            {/* Tertiary particles */}
            {[...Array(10)].map((_, i) => (
              <div
                key={`particle3-${i}`}
                className="absolute w-1 h-1 bg-blue-500/10 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `smoothRandomFloat3 ${18 + Math.random() * 12}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 18}s`,
                }}
              />
            ))}
          </div>
        </div>

        <Navigation />
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/analysis" element={<FileAnalysisPage />} />
            <Route path="/custom" element={<CustomPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;