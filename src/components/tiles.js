import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, ExternalLink, TrendingUp, Users, FileText, X, Calendar, Target, Mail, MessageSquare, Code, Zap, Send } from "lucide-react";
import plane from '../plane.png';

// Custom Seth Bailey Logo/Icon Component
const SethBaileyIcon = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 40 40"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer ring */}
    <circle
      cx="20"
      cy="20"
      r="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    {/* Inner geometric design */}
    <path
      d="M12 15L20 8L28 15L25 20L20 25L15 20Z"
      fill="currentColor"
      opacity="0.8"
    />
    {/* Accent lines */}
    <path
      d="M8 20H14M26 20H32M20 8V14M20 26V32"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Center dot */}
    <circle cx="20" cy="20" r="2" fill="currentColor" />
  </svg>
);

// --- Tweak these if you want different sizing ---
const TILE_WIDTH = 500;  // px
const TILE_HEIGHT = 300; // px

// Demo data — replace with your real projects

const projects = [
    {
        id: 1,
        name: "Strike Fusion",
        summary: "Revolutionary fusion technology for modern applications.",
        owner: "Design",
        image: "/strike.png",
        metrics: {
            monthlyTraffic: "2.4K",
            conversionRate: "3.2%",
            contentPieces: 12
        },
        details: {
            lastCampaign: "LinkedIn Tech Series",
            topContent: "AI Integration Guide",
            nextPost: "Tomorrow 2PM",
            platforms: ["LinkedIn", "Twitter", "Medium"],
            monthlyGoal: "5K visitors"
        }
    },
    {
        id: 2,
        name: "AI Bid",
        summary: "Intelligent bidding platform powered by machine learning.",
        owner: "Build",
        image: "/bidfolder.png",
        metrics: {
            monthlyTraffic: "1.8K",
            conversionRate: "4.7%",
            contentPieces: 8
        },
        details: {
            lastCampaign: "Construction AI Series",
            topContent: "Smart Bidding Demo",
            nextPost: "Friday 10AM",
            platforms: ["YouTube", "LinkedIn", "Industry Forums"],
            monthlyGoal: "3K visitors"
        }
    },
    {
        id: 3,
        name: "PM XL",
        summary: "Advanced project management and forecasting tools.",
        owner: "Research",
        image: "/pmxl.png",
        metrics: {
            monthlyTraffic: "3.1K",
            conversionRate: "2.8%",
            contentPieces: 15
        },
        details: {
            lastCampaign: "Project Efficiency Tips",
            topContent: "Forecasting Best Practices",
            nextPost: "Monday 9AM",
            platforms: ["LinkedIn", "Project Management Blogs", "Newsletters"],
            monthlyGoal: "4K visitors"
        }
    },
    {
        id: 4,
        name: "Pull Plan App",
        summary: "Streamlined construction scheduling and planning application.",
        owner: "Ops",
        image: "/tobysquish.png",
        metrics: {
            monthlyTraffic: "1.2K",
            conversionRate: "5.1%",
            contentPieces: 6
        },
        details: {
            lastCampaign: "Construction Planning 101",
            topContent: "Scheduling Tutorial Video",
            nextPost: "Wednesday 1PM",
            platforms: ["YouTube", "Construction Forums", "Instagram"],
            monthlyGoal: "2K visitors"
        }
    },
    {
        id: 5,
        name: "Tiktok Store",
        summary: "Social commerce platform for the next generation.",
        owner: "Design",
        image: "/waimeavalley.jpg",
        metrics: {
            monthlyTraffic: "5.7K",
            conversionRate: "6.3%",
            contentPieces: 24
        },
        details: {
            lastCampaign: "Social Shopping Trends",
            topContent: "TikTok Commerce Tutorial",
            nextPost: "Daily at 6PM",
            platforms: ["TikTok", "Instagram", "Twitter", "YouTube"],
            monthlyGoal: "8K visitors"
        }
    },
    {
        id: 6,
        name: "AEM consulting",
        summary: "Adobe Experience Manager implementation and optimization.",
        owner: "Build",
        image: "/aemconsult.png",
        metrics: {
            monthlyTraffic: "900",
            conversionRate: "8.2%",
            contentPieces: 4
        },
        details: {
            lastCampaign: "AEM Implementation Guide",
            topContent: "Digital Experience Optimization",
            nextPost: "Thursday 11AM",
            platforms: ["LinkedIn", "Adobe Community", "Medium"],
            monthlyGoal: "1.5K visitors"
        }
    },
    {
        id: 7,
        name: "Rule Your Kingdom",
        summary: "Comprehensive kingdom management and strategy platform.",
        owner: "Research",
        image: "/ruleyourkingdom.png",
        metrics: {
            monthlyTraffic: "4.2K",
            conversionRate: "3.9%",
            contentPieces: 18
        },
        details: {
            lastCampaign: "Strategy Game Mechanics",
            topContent: "Kingdom Building Guide",
            nextPost: "Saturday 7PM",
            platforms: ["Reddit", "Discord", "YouTube", "Gaming Blogs"],
            monthlyGoal: "6K visitors"
        }
    },
    {
        id: 8,
        name: "AI Customer Service",
        summary: "Intelligent customer support automation with natural language processing.",
        owner: "AI",
        image: "/logo512.png",
        metrics: {
            monthlyTraffic: "1.5K",
            conversionRate: "4.4%",
            contentPieces: 10
        },
        details: {
            lastCampaign: "AI Support Revolution",
            topContent: "Chatbot Implementation Guide",
            nextPost: "Tuesday 3PM",
            platforms: ["LinkedIn", "AI Communities", "Medium", "Twitter"],
            monthlyGoal: "3K visitors"
        }
    },
];

export default function Tiles() {
  const [selectedProject, setSelectedProject] = useState(null);
  
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-neutral-100 text-neutral-900">
      <header className="sticky top-0 z-20 bg-neutral-100/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SethBaileyIcon className="w-10 h-10 text-gray-800" />
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight lettering-wide">
              SETH BAILEY
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#projects" 
              className="text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              onClick={(e) => scrollToSection(e, 'projects')}
            >
              PROJECTS
            </a>
            <a 
              href="#contact" 
              className="text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              onClick={(e) => scrollToSection(e, 'contact')}
            >
              CONTACT
            </a>
          </nav>
        </div>
      </header>
      
      {/* Header Image Section */}
      <div className="relative w-full h-96 overflow-hidden bg-black">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-black flex items-center">
            <div className="text-white max-w-md mx-auto max-w-[1600px] px-6 text-left">
              <div className="flex items-center gap-4 mb-4">
                <SethBaileyIcon className="w-16 h-16 text-white" />
                <h2 className="text-6xl font-light tracking-tight text-left">
                  SETH BAILEY
                </h2>
              </div>
              <p className="text-lg text-gray-300 text-left">
                Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure
              </p>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
            <img 
              src={plane} 
              alt="Header" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <main id="projects" className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
        {/*
          Responsive grid: 1 column on mobile, 2 on tablet, 3+ on desktop
          Cards take full width on mobile with some padding
        */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <Tile key={p.id} project={p} onClick={() => setSelectedProject(p)} />)
          )}
        </div>
      </main>
      
      {/* Contact Section */}
      <div id="contact">
        <ContactSection />
      </div>
      
      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />
      
      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Tile({ project, onClick }) {
  return (
    <motion.div
      className="group relative cursor-pointer rounded-2xl shadow-lg ring-1 ring-black/5 h-72 sm:h-80 md:h-72 lg:h-80"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onClick={onClick}
    >
      {/* Background image */}
      {project.image && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Black overlay for readability */}
      <div className="absolute inset-0 bg-black/70 rounded-2xl" />

      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 10px 30px rgba(0,0,0,0.45)" }} />

      <div className="relative z-10 h-full p-6 flex flex-col justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
            <p className="text-xs uppercase tracking-wider text-white/60">{project.owner}</p>
          </div>
        </div>

        <p className="mt-4 text-white/90 max-w-[46ch] leading-snug">
          {project.summary}
        </p>

        {/* Marketing Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs text-white/70">Traffic</span>
            </div>
            <div className="text-sm font-semibold">{project.metrics.monthlyTraffic}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-3 w-3" />
              <span className="text-xs text-white/70">CVR</span>
            </div>
            <div className="text-sm font-semibold">{project.metrics.conversionRate}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-3 w-3" />
              <span className="text-xs text-white/70">Content</span>
            </div>
            <div className="text-sm font-semibold">{project.metrics.contentPieces}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-white/70">Click for details</span>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-white">
            View <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectDetailModal({ project, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {project.image && (
            <div className="h-48 overflow-hidden rounded-t-2xl">
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="bg-black/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            <p className="text-white/80">{project.summary}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{project.metrics.monthlyTraffic}</div>
              <div className="text-sm text-gray-600">Monthly Traffic</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{project.metrics.conversionRate}</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{project.metrics.contentPieces}</div>
              <div className="text-sm text-gray-600">Content Pieces</div>
            </div>
          </div>

          {/* Content Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Next Scheduled Post</div>
                <div className="text-sm text-gray-600">{project.details.nextPost}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Target className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Monthly Goal</div>
                <div className="text-sm text-gray-600">{project.details.monthlyGoal}</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">Top Performing Content</div>
              <div className="text-sm text-gray-600">{project.details.topContent}</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">Active Platforms</div>
              <div className="flex flex-wrap gap-2">
                {project.details.platforms.map((platform, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">Recent Campaign</div>
              <div className="text-sm text-gray-600">{project.details.lastCampaign}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      alert('Thanks for reaching out! I\'ll get back to you soon.');
      setFormData({ name: '', email: '', project: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const floatingElements = [
    { icon: Code, delay: 0 },
    { icon: Zap, delay: 0.2 },
    { icon: Users, delay: 0.4 },
    { icon: TrendingUp, delay: 0.6 }
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className="absolute opacity-10"
            initial={{ 
              x: Math.random() * 1200, 
              y: Math.random() * 800,
              rotate: 0 
            }}
            animate={{
              x: [
                Math.random() * 1200,
                Math.random() * 1200,
                Math.random() * 1200
              ],
              y: [
                Math.random() * 800,
                Math.random() * 800,
                Math.random() * 800
              ],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: element.delay,
              ease: "linear"
            }}
          >
            <element.icon className="w-16 h-16 text-blue-500" />
          </motion.div>
        ))}
      </div>

      {/* 3D Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform -skew-y-12"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent transform skew-x-12"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.h2 
              className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Let's Build Something Amazing
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Looking for a developer who can bring your vision to life? I specialize in creating 
              innovative solutions that drive real results. From AI-powered applications to 
              modern web experiences, let's collaborate on your next big idea.
            </motion.p>

            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Full-Stack Development</h3>
                  <p className="text-gray-400 text-sm">React, Node.js, AI Integration, Mobile Apps</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Performance Optimization</h3>
                  <p className="text-gray-400 text-sm">Speed, SEO, Conversion Rate Optimization</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Business Growth</h3>
                  <p className="text-gray-400 text-sm">Marketing Automation, Analytics, Revenue Optimization</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Your Name</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Type</label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select a project type</option>
                    <option value="web-app">Web Application</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="ai-integration">AI Integration</option>
                    <option value="e-commerce">E-commerce Platform</option>
                    <option value="custom">Custom Solution</option>
                  </motion.select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tell me about your project</label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe your project, timeline, and any specific requirements..."
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Start Our Collaboration
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer({ scrollToSection }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      <div className="relative w-full h-96">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-black flex items-center">
            <div className="text-white max-w-md mx-auto max-w-[1600px] px-6 text-left">
              
              {/* Footer Links */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="#projects" 
                        onClick={(e) => scrollToSection(e, 'projects')}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Projects
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#contact" 
                        onClick={(e) => scrollToSection(e, 'contact')}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Services</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>Web Development</li>
                    <li>Mobile Apps</li>
                    <li>AI Integration</li>
                    <li>E-commerce</li>
                  </ul>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-6 mb-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  GitHub
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
              </div>
              
              {/* Copyright */}
              <div className="text-sm text-gray-500">
                © {currentYear} Seth Bailey. All rights reserved.
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
            <img 
              src={plane} 
              alt="Footer Background" 
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
