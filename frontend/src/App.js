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
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 relative group ${
        isActive 
          ? 'bg-gradient-to-r from-slate-800/60 to-slate-700/60 text-white shadow-md shadow-blue-500/20 border border-slate-600/40' 
          : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-700/40 hover:shadow-md hover:shadow-slate-500/10 border border-transparent hover:border-slate-600/30'
      }`}
    >
      {isActive && (
        <>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 rounded-full"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-slate-700/20 rounded-lg opacity-50 blur-sm"></div>
        </>
      )}
      <div className="relative z-10 flex items-center space-x-2">
        <Icon size={16} className={`transition-all duration-300 ${isActive ? 'text-blue-300' : 'group-hover:scale-110 group-hover:text-blue-400'}`} />
        <span className="font-medium text-sm">{children}</span>
      </div>
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
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b-2 border-blue-500 sticky top-0 z-50 relative">
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-slate-800/30 to-slate-900/40 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo - Left */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 via-slate-700 to-slate-800 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-blue-500/30">
              <Shield size={20} className="text-blue-200 group-hover:text-white transition-colors duration-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-200 via-slate-100 to-blue-300 bg-clip-text text-transparent group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                SectoolBox
              </h1>
              <p className="text-xs text-blue-300/80 group-hover:text-blue-200 transition-colors duration-300 font-medium">CTF Toolkit</p>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} icon={item.icon}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right spacer to balance the layout */}
          <div className="w-32"></div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors border border-slate-600/30 hover:border-blue-400/50"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/30">
            <div className="flex flex-col space-y-2">
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
    <footer className="bg-gradient-to-r from-slate-950 to-blue-950 border-t border-slate-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center">
          {/* Centered Professional Team Avatars */}
          <div className="flex items-center justify-center space-x-6">
            {/* Zebbern */}
            <div className="flex items-center space-x-3 group">
              <img
                src="https://avatars.githubusercontent.com/u/185730623?v=4"
                alt="Zebbern"
                className="w-12 h-12 rounded-full border-2 border-slate-600 group-hover:border-slate-500 transition-colors duration-300 shadow-lg"
              />
              <div className="text-left">
                <div className="text-slate-300 text-sm font-medium group-hover:text-slate-200 transition-colors duration-300">Zebbern</div>
                <div className="text-gray-500 text-xs">Lead Developer</div>
              </div>
            </div>
            
            {/* Opkimmi */}
            <div className="flex items-center space-x-3 group">
              <img
                src="https://avatars.githubusercontent.com/u/150441423?v=4"
                alt="Opkimmi"
                className="w-12 h-12 rounded-full border-2 border-slate-600 group-hover:border-slate-500 transition-colors duration-300 shadow-lg"
              />
              <div className="text-left">
                <div className="text-slate-300 text-sm font-medium group-hover:text-slate-200 transition-colors duration-300">Opkimmi</div>
                <div className="text-gray-500 text-xs">Security Expert</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            **Copyright**: © 2025 SectoolBox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950 flex flex-col">
        {/* Enhanced Consistent Background Particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0">
            {/* Staggered Primary particles with random entry/exit */}
            {[...Array(15)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-slate-500/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `staggeredParticleFlow ${20 + Math.random() * 15}s ease-in-out infinite`,
                  animationDelay: `${i * 2 + Math.random() * 10}s`,
                }}
              />
            ))}
            
            {/* Staggered Secondary particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={`particle2-${i}`}
                className="absolute w-1.5 h-1.5 bg-slate-500/15 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `staggeredParticleFlow2 ${25 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${i * 2.5 + Math.random() * 15}s`,
                }}
              />
            ))}
            
            {/* Staggered Tertiary particles */}
            {[...Array(10)].map((_, i) => (
              <div
                key={`particle3-${i}`}
                className="absolute w-1 h-1 bg-blue-500/10 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `staggeredParticleFlow3 ${18 + Math.random() * 12}s ease-in-out infinite`,
                  animationDelay: `${i * 3 + Math.random() * 8}s`,
                }}
              />
            ))}

            {/* Twinkling stars with staggered timing */}
            {[...Array(20)].map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-slate-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `staggeredTwinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5 + Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        </div>

        <Navigation />
        <main className="flex-1 relative z-5">
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