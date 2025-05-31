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
  Code
} from 'lucide-react';
import './App.css';

// Import page components
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import FileAnalysisPage from './pages/FileAnalysisPage';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        <Navigation />
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/analysis" element={<FileAnalysisPage />} />
            <Route path="/custom" element={<CustomPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
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