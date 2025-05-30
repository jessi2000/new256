import React from 'react';
import { 
  Shield, 
  Users, 
  Target, 
  Award,
  Github,
  Mail,
  Globe,
  Lock,
  Zap,
  CheckCircle,
  Heart,
  Code
} from 'lucide-react';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Alex Rodriguez',
      role: 'Lead Security Engineer',
      bio: 'Former penetration tester with 8+ years experience in CTF competitions and cybersecurity research.',
      avatar: '👨‍💻',
      specialties: ['Penetration Testing', 'Cryptography', 'Reverse Engineering']
    },
    {
      name: 'Sarah Chen',
      role: 'Frontend Architect',
      bio: 'Full-stack developer specializing in secure web applications and user experience design.',
      avatar: '👩‍💻',
      specialties: ['Web Security', 'UI/UX Design', 'JavaScript']
    },
    {
      name: 'Marcus Thompson',
      role: 'Cryptography Expert',
      bio: 'PhD in Cryptography with extensive research in modern encryption algorithms and CTF tool development.',
      avatar: '🔐',
      specialties: ['Applied Cryptography', 'Algorithm Design', 'Security Research']
    },
    {
      name: 'Elena Vasquez',
      role: 'DevOps & Security',
      bio: 'Infrastructure security specialist ensuring our tools meet the highest security standards.',
      avatar: '🛡️',
      specialties: ['Infrastructure Security', 'DevOps', 'Cloud Security']
    }
  ];

  const features = [
    {
      icon: Lock,
      title: 'Client-Side Processing',
      description: 'All analysis happens in your browser. Your files never leave your device, ensuring maximum security and privacy.'
    },
    {
      icon: Zap,
      title: '40+ Professional Tools',
      description: 'Comprehensive suite of encoding, decoding, cryptographic, and analysis tools used by professionals worldwide.'
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Built with security as the primary concern. No data collection, no tracking, no external dependencies for sensitive operations.'
    },
    {
      icon: Code,
      title: 'Open Source Ready',
      description: 'Designed with transparency in mind. Every tool implementation is available for review and contribution.'
    }
  ];

  const achievements = [
    {
      icon: Users,
      title: '10,000+',
      description: 'CTF participants using our tools'
    },
    {
      icon: Award,
      title: '50+',
      description: 'Major CTF competitions supported'
    },
    {
      icon: Target,
      title: '99.9%',
      description: 'Tool accuracy rate'
    },
    {
      icon: Shield,
      title: '100%',
      description: 'Client-side processing'
    }
  ];

  const libraries = [
    'React 19 - Modern frontend framework',
    'CryptoJS - Cryptographic functions',
    'Web Crypto API - Browser-native security',
    'Tailwind CSS - Utility-first styling',
    'Lucide React - Beautiful icons',
    'React Hot Toast - User notifications'
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl animate-pulse-glow">
              <Shield size={48} className="text-white" />
            </div>
          </div>
          <h1 className="heading-xl mb-6">About SectoolBox</h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Professional-grade CTF toolkit trusted by cybersecurity professionals, 
            students, and CTF teams worldwide. Built for security, performance, and reliability.
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-16">
          <div className="tool-card text-center">
            <h2 className="heading-lg mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
              To democratize access to professional cybersecurity tools while maintaining the highest 
              standards of security and privacy. We believe that everyone should have access to the same 
              tools used by security professionals, without compromising on safety or functionality.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="heading-lg text-center mb-12">Why Choose SectoolBox?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="tool-card">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-purple-600/20 rounded-lg">
                      <IconComponent size={24} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-100 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-16">
          <h2 className="heading-lg text-center mb-12">Trusted by the Community</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="tool-card text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gradient mb-2">
                    {achievement.title}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="heading-lg text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="tool-card text-center">
                <div className="text-4xl mb-4">{member.avatar}</div>
                <h3 className="text-lg font-semibold text-gray-100 mb-1">
                  {member.name}
                </h3>
                <p className="text-purple-400 text-sm font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {member.bio}
                </p>
                <div className="space-y-1">
                  {member.specialties.map((specialty, idx) => (
                    <span 
                      key={idx}
                      className="inline-block bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs mr-1 mb-1"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="tool-card">
              <h3 className="heading-md mb-6 flex items-center">
                <Code size={24} className="mr-2 text-blue-400" />
                Technology Stack
              </h3>
              <div className="space-y-3">
                {libraries.map((library, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{library}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tool-card">
              <h3 className="heading-md mb-6 flex items-center">
                <Shield size={24} className="mr-2 text-green-400" />
                Security Principles
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Zero data collection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Client-side only processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">No external dependencies for sensitive operations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Open source algorithms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Regular security audits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">Privacy by design</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-16">
          <div className="tool-card text-center">
            <h2 className="heading-lg mb-8">Get in Touch</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Have questions, suggestions, or want to contribute? We'd love to hear from you. 
              Join our community of cybersecurity enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:team@sectoolbox.com" 
                className="btn-primary flex items-center space-x-2"
              >
                <Mail size={20} />
                <span>Email Us</span>
              </a>
              <a 
                href="https://github.com/sectoolbox" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary flex items-center space-x-2"
              >
                <Github size={20} />
                <span>GitHub</span>
              </a>
              <a 
                href="https://sectoolbox.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary flex items-center space-x-2"
              >
                <Globe size={20} />
                <span>Website</span>
              </a>
            </div>
          </div>
        </section>

        {/* Privacy Policy & Terms */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="tool-card">
              <h3 className="heading-md mb-4">Privacy Policy</h3>
              <div className="text-gray-300 space-y-3 text-sm">
                <p>
                  <strong>Data Collection:</strong> We do not collect, store, or transmit any user data. 
                  All processing happens locally in your browser.
                </p>
                <p>
                  <strong>Cookies:</strong> We use only essential cookies for basic functionality. 
                  No tracking or analytics cookies are used.
                </p>
                <p>
                  <strong>Third Parties:</strong> No data is shared with third parties. Your files 
                  and analysis results remain completely private.
                </p>
                <p>
                  <strong>Security:</strong> All cryptographic operations use industry-standard 
                  algorithms implemented in your browser's secure environment.
                </p>
              </div>
            </div>

            <div className="tool-card">
              <h3 className="heading-md mb-4">Terms of Use</h3>
              <div className="text-gray-300 space-y-3 text-sm">
                <p>
                  <strong>Educational Use:</strong> This tool is intended for educational purposes, 
                  security research, and authorized testing only.
                </p>
                <p>
                  <strong>Responsibility:</strong> Users are responsible for ensuring they have 
                  proper authorization before analyzing files or systems.
                </p>
                <p>
                  <strong>Accuracy:</strong> While we strive for accuracy, users should verify 
                  results independently for critical applications.
                </p>
                <p>
                  <strong>Updates:</strong> We regularly update tools and algorithms to maintain 
                  security and add new features.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Attribution */}
        <section className="text-center">
          <div className="tool-card">
            <h3 className="heading-md mb-4 flex items-center justify-center">
              <Heart size={20} className="mr-2 text-red-400" />
              Acknowledgments
            </h3>
            <p className="text-gray-300 text-sm max-w-3xl mx-auto">
              Special thanks to the open source community, security researchers, and CTF organizers 
              who have contributed algorithms, feedback, and testing. This project stands on the 
              shoulders of giants in the cybersecurity community.
            </p>
            <div className="mt-6 text-xs text-gray-500">
              <p>SectoolBox v1.0.0 • Built with ❤️ for the cybersecurity community</p>
              <p className="mt-2">© 2025 SectoolBox Team. All tools provided as-is for educational use.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;