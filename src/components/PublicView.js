import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Code, Zap, Send, Users, TrendingUp, Menu, X } from "lucide-react";
import plane from '../plane.png';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

// Custom Seth Bailey Logo/Icon Component
const SethBaileyIcon = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 40 40"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 15L20 8L28 15L25 20L20 25L15 20Z" fill="currentColor" opacity="0.8" />
    <path d="M8 20H14M26 20H32M20 8V14M20 26V32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="20" cy="20" r="2" fill="currentColor" />
  </svg>
);

const projects = [
    {
        id: 1,
        name: "Strike Fusion",
        summary: "Revolutionary fusion technology for modern applications.",
        description: "Strike Fusion represents the next generation of application development, combining cutting-edge technology with intuitive design. This platform enables teams to build and deploy scalable solutions with unprecedented speed and efficiency. By leveraging modern frameworks and cloud infrastructure, Strike Fusion transforms complex development challenges into streamlined workflows that deliver real business value.",
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
        description: "AI Bid revolutionizes the construction bidding process through advanced machine learning algorithms and intelligent automation. The platform analyzes historical data, market trends, and project specifications to generate accurate, competitive bids in minutes rather than days. Construction teams can focus on what they do best while AI Bid handles the complex calculations and optimizations that maximize profitability and win rates.",
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
        description: "PM XL is a comprehensive project management solution designed for teams that demand precision and insight. With powerful forecasting capabilities, real-time collaboration features, and intelligent resource allocation, PM XL helps organizations deliver projects on time and under budget. The platform integrates seamlessly with existing workflows while providing the analytics and reporting needed to make data-driven decisions.",
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
        description: "Pull Plan App brings collaborative scheduling to construction teams with an intuitive, visual planning interface. Based on lean construction principles, this tool enables teams to create, share, and update project schedules in real-time. The result is better coordination, fewer delays, and improved project outcomes through enhanced communication and transparency across all stakeholders.",
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
        description: "TikTok Store harnesses the power of social media to create seamless shopping experiences. By integrating directly with TikTok's massive user base, merchants can showcase products, engage with customers, and drive sales through authentic, engaging content. The platform combines entertainment with commerce, making shopping fun and accessible while providing powerful analytics to optimize performance.",
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
        description: "Our AEM consulting services help enterprises maximize their investment in Adobe Experience Manager. From initial implementation to ongoing optimization, we provide expert guidance on content strategy, architecture design, and performance tuning. Our team ensures your digital experiences are not only beautiful and engaging but also scalable, maintainable, and aligned with your business objectives.",
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
];

const PublicView = ({ onSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    
    // Track navigation clicks in analytics
    if (analytics) {
      logEvent(analytics, 'navigation_click', {
        section_name: sectionId,
        source: 'header_nav'
      });
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Close mobile menu after navigation
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-gray-800">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SethBaileyIcon className="w-10 h-10 text-white" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight lettering-wide">
              SETH BAILEY
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#projects" 
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              onClick={(e) => scrollToSection(e, 'projects')}
            >
              PROJECTS
            </a>
            <a 
              href="#contact" 
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              onClick={(e) => scrollToSection(e, 'contact')}
            >
              CONTACT
            </a>
            <button
              onClick={onSignIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              SIGN IN
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:text-gray-300 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-800 bg-black/95 backdrop-blur"
            >
              <nav className="flex flex-col px-6 py-4 space-y-4">
                <a 
                  href="#projects" 
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer py-2 text-lg"
                  onClick={(e) => scrollToSection(e, 'projects')}
                >
                  PROJECTS
                </a>
                <a 
                  href="#contact" 
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer py-2 text-lg"
                  onClick={(e) => scrollToSection(e, 'contact')}
                >
                  CONTACT
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignIn();
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left text-lg font-semibold"
                >
                  SIGN IN
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
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

      <main id="projects" className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8 bg-black">
        <div className="space-y-6">
          {projects.map((project, index) => (
            <FullWidthTile 
              key={project.id} 
              project={project}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>
      </main>
      
      {/* Contact Section */}
      <div id="contact">
        <ContactSection />
      </div>
      
      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

function FullWidthTile({ project, isReversed }) {
  return (
    <motion.div
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-stretch min-h-[500px]`}>
        {/* Image Side with Fade Overlay */}
        <div className="w-full lg:w-1/2 relative overflow-hidden min-h-[300px] lg:min-h-[500px]">
          {project.image && (
            <>
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full h-full object-cover"
              />
              {/* Strong Fade to Content Side - Only on Desktop */}
              <div className={`absolute inset-0 hidden lg:block bg-gradient-to-${isReversed ? 'l' : 'r'} from-transparent via-gray-900/60 to-gray-900`} />
              {/* Dark overlay for mobile */}
              <div className="absolute inset-0 lg:hidden bg-black/30" />
            </>
          )}
        </div>
        
        {/* Content Side */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-900 to-gray-800 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
            }}></div>
          </div>
          
          <div className="relative z-10">
            {/* Header with Icon */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <FolderKanban className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-4xl font-bold tracking-tight text-white mb-2">{project.name}</h2>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <p className="text-xs lg:text-sm uppercase tracking-widest text-gray-400">{project.owner}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-4 font-medium">
              {project.summary}
            </p>

            {/* Extended Description */}
            <p className="text-sm lg:text-base text-gray-400 leading-relaxed mb-6 lg:mb-8">
              {project.description}
            </p>

            {/* CTA Button */}
            <div>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm lg:text-base font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                <span>Visit Site</span>
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
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
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track form submission attempt in analytics
      if (analytics) {
        logEvent(analytics, 'form_submit_attempt', {
          form_name: 'contact_form',
          project_type: formData.project
        });
      }

      // Submit to Firebase Function
      const functionUrl = process.env.NODE_ENV === 'development' 
        ? 'http://127.0.0.1:5001/sethbaileydev-84a1e/us-central1/sendContactEmail'
        : 'https://us-central1-sethbaileydev-84a1e.cloudfunctions.net/sendContactEmail';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Success - track in analytics
        if (analytics) {
          logEvent(analytics, 'form_submit_success', {
            form_name: 'contact_form',
            project_type: formData.project
          });
        }

        setSubmitStatus('success');
        setFormData({ name: '', email: '', project: '', message: '' });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      } else {
        // Error from server
        if (analytics) {
          logEvent(analytics, 'form_submit_error', {
            form_name: 'contact_form',
            error_type: 'server_error'
          });
        }
        
        setSubmitStatus('error');
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      }
    } catch (error) {
      // Network or other error
      if (analytics) {
        logEvent(analytics, 'form_submit_error', {
          form_name: 'contact_form',
          error_type: 'network_error'
        });
      }
      
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
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
              {/* Success/Error Message */}
              <AnimatePresence>
                {submitStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`mb-6 p-6 rounded-xl border-2 ${
                      submitStatus === 'success'
                        ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/50 text-white'
                        : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/50 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          submitStatus === 'success' 
                            ? 'bg-emerald-500/30' 
                            : 'bg-red-500/30'
                        }`}
                      >
                        {submitStatus === 'success' ? (
                          <motion.svg
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </motion.svg>
                        ) : (
                          <motion.svg
                            initial={{ rotate: -90, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </motion.svg>
                        )}
                      </motion.div>
                      <div>
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="font-bold text-lg relative"
                        >
                          {submitStatus === 'success' ? '🚀 Message Sent!' : '😵 Oops!'}
                          {submitStatus === 'success' && (
                            <div className="absolute -top-2 -right-2">
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, x: 0, y: 0 }}
                                  animate={{ 
                                    scale: [0, 1, 0],
                                    x: Math.cos(i * 60 * Math.PI / 180) * 20,
                                    y: Math.sin(i * 60 * Math.PI / 180) * 20
                                  }}
                                  transition={{ 
                                    delay: 0.6 + i * 0.1,
                                    duration: 1.5,
                                    ease: "easeOut"
                                  }}
                                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                                />
                              ))}
                            </div>
                          )}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-sm opacity-90"
                        >
                          {submitStatus === 'success' 
                            ? "Thanks for reaching out! I'll get back to you within 24 hours. Let's build something amazing together! 🎉"
                            : "Something went wrong. Please try again or reach out directly. Don't give up - great things are coming! 💪"
                          }
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Your Name</label>
                  <motion.input
                    whileFocus={{ scale: isSubmitting ? 1 : 1.02 }}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <motion.input
                    whileFocus={{ scale: isSubmitting ? 1 : 1.02 }}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Type</label>
                  <motion.select
                    whileFocus={{ scale: isSubmitting ? 1 : 1.02 }}
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    whileFocus={{ scale: isSubmitting ? 1 : 1.02 }}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PublicView;
