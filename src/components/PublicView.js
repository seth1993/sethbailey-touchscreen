import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Zap, Send, TrendingUp, Menu, X, ArrowRight, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import plane from '../plane.png';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

const projects = [
  {
    id: 1,
    name: "Strike Fusion",
    summary: "Precision cost forecasting for construction projects.",
    description: "Strike Fusion delivers accurate cost forecasting and budget management for construction projects of any scale. By analyzing historical data, material costs, labor trends, and project specifications, the platform provides real-time insights that help contractors and project managers forecast costs with confidence. From initial estimates to project completion, Strike Fusion keeps your construction jobs on budget and profitable, turning complex forecasting challenges into clear, actionable financial intelligence.",
    owner: "Design",
    image: "/strike.png",
    url: "https://fusion.strikeusa.com",
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
    url: "https://bidfolder.com",
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
    url: "https://pm-xl.com",
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
    name: "Planful",
    summary: "Dream it. Plan it. Do it.",
    description: "Planful transforms dreams into achievable goals through strategic planning and purposeful action. This comprehensive planning platform provides personalized resources, motivational content, and practical tools to help individuals and professionals navigate their unique journeys. With features like the 90-day planning system, journal integration, and goal-tracking resources, Planful empowers users to turn aspirations into reality through thoughtful, structured planning.",
    owner: "Ops",
    image: "/planful.png",
    url: "https://planful.app",
    metrics: {
      monthlyTraffic: "1.2K",
      conversionRate: "5.1%",
      contentPieces: 6
    },
    details: {
      lastCampaign: "90 Day Goal Setting",
      topContent: "Dream to Action Guide",
      nextPost: "Wednesday 1PM",
      platforms: ["Instagram", "X", "Resources Blog"],
      monthlyGoal: "2K visitors"
    }
  },
  {
    id: 5,
    name: "Tiktok Store",
    summary: "Social commerce platform for the next generation.",
    description: "TikTok Store harnesses the power of social media to create seamless shopping experiences. By integrating directly with TikTok's massive user base, merchants can showcase products, engage with customers, and drive sales through authentic, engaging content. The platform combines entertainment with commerce, making shopping fun and accessible while providing powerful analytics to optimize performance.",
    owner: "Design",
    image: "/tobysquish.png",
    url: "https://tobysquish.com",
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
    url: "https://bailey.marketing",
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
    <div className="min-h-screen w-full bg-neutral-950 text-white antialiased text-left">
      <header className="fixed top-0 inset-x-0 z-30 bg-neutral-950/70 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/f35-logo.png" alt="F-35 Logo" className="w-9 h-9 object-contain" />
            <span className="text-sm font-semibold tracking-[0.25em]">SETH BAILEY</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#projects"
              className="text-xs tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
              onClick={(e) => scrollToSection(e, 'projects')}
            >
              PROJECTS
            </a>
            <a
              href="#contact"
              className="text-xs tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
              onClick={(e) => scrollToSection(e, 'contact')}
            >
              CONTACT
            </a>
            <button
              onClick={onSignIn}
              className="text-xs tracking-[0.15em] px-4 py-2 rounded-full border border-white/15 text-gray-200 hover:bg-white hover:text-black transition-colors"
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
              className="md:hidden border-t border-white/5 bg-neutral-950/95 backdrop-blur"
            >
              <nav className="flex flex-col px-6 py-4 space-y-1">
                <a
                  href="#projects"
                  className="text-gray-300 hover:text-white transition-colors py-3 text-sm tracking-[0.2em]"
                  onClick={(e) => scrollToSection(e, 'projects')}
                >
                  PROJECTS
                </a>
                <a
                  href="#contact"
                  className="text-gray-300 hover:text-white transition-colors py-3 text-sm tracking-[0.2em]"
                  onClick={(e) => scrollToSection(e, 'contact')}
                >
                  CONTACT
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignIn();
                  }}
                  className="mt-2 px-4 py-3 rounded-full border border-white/15 text-sm tracking-[0.15em] text-left hover:bg-white hover:text-black transition-colors"
                >
                  SIGN IN
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <img
          src={plane}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/60" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-sky-300/90 border border-sky-400/20 bg-sky-400/5 rounded-full px-4 py-2 mb-8">
              FULL-STACK DEVELOPER · AI BUILDER
            </p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.05] mb-6">
              Building the future
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400 font-normal">
                with AI.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed mb-10">
              I design and ship products that put artificial intelligence to work —
              from construction tech to planning tools. Bringing your projects to life.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                onClick={(e) => scrollToSection(e, 'projects')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                View projects
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, 'contact')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-colors"
              >
                Get in touch
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      <main id="projects" className="mx-auto max-w-7xl px-6 py-24 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-xs tracking-[0.3em] text-sky-400 mb-3">SELECTED WORK</p>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight">Projects</h2>
        </motion.div>

        <div className="space-y-10">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>
      </main>

      {/* Contact Section */}
      <div id="contact" className="scroll-mt-20">
        <ContactSection />
      </div>

      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

function ProjectCard({ project, index, isReversed }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-stretch`}>
        {/* Image side */}
        <div className="w-full lg:w-1/2 relative overflow-hidden min-h-[260px] lg:min-h-[460px]">
          {project.image && (
            <>
              <img
                src={project.image}
                alt={project.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
              <div
                className={`absolute inset-0 hidden lg:block ${
                  isReversed
                    ? 'bg-gradient-to-l from-transparent via-neutral-900/40 to-neutral-900'
                    : 'bg-gradient-to-r from-transparent via-neutral-900/40 to-neutral-900'
                }`}
              />
              <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />
            </>
          )}
        </div>

        {/* Content side */}
        <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-mono text-gray-600">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="h-px w-8 bg-gray-700" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-sky-400/90">
              {project.owner}
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-white mb-3">
            {project.name}
          </h2>

          <p className="text-base lg:text-lg text-gray-300 leading-relaxed mb-4">
            {project.summary}
          </p>

          <p className="text-sm lg:text-[15px] text-gray-500 leading-relaxed mb-8">
            {project.description}
          </p>

          {project.url && (
            <div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Visit site
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          )}
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

  const services = [
    {
      icon: Code,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      title: 'Full-Stack Development',
      blurb: 'React, Node.js, AI Integration, Mobile Apps'
    },
    {
      icon: Zap,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      title: 'Performance Optimization',
      blurb: 'Speed, SEO, Conversion Rate Optimization'
    },
    {
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      title: 'Business Growth',
      blurb: 'Marketing Automation, Analytics, Revenue Optimization'
    }
  ];

  return (
    <section className="relative py-28 overflow-hidden border-t border-white/5">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white lg:sticky lg:top-28"
          >
            <p className="text-xs tracking-[0.3em] text-sky-400 mb-3">CONTACT</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-tight mb-6">
              Let's build something
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400">
                amazing together.
              </span>
            </h2>

            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-md">
              Looking for a developer who can bring your vision to life? From AI-powered
              applications to modern web experiences, let's collaborate on your next big idea.
            </p>

            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${service.iconBg}`}>
                    <service.icon className={`w-5 h-5 ${service.iconColor}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">{service.title}</h3>
                    <p className="text-gray-500 text-sm">{service.blurb}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="bg-white/[0.04] backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              {/* Success/Error Message */}
              <AnimatePresence>
                {submitStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${submitStatus === 'success'
                        ? 'bg-emerald-500/10 border-emerald-400/30'
                        : 'bg-red-500/10 border-red-400/30'
                      }`}
                  >
                    {submitStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">
                        {submitStatus === 'success' ? 'Message sent!' : 'Something went wrong'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {submitStatus === 'success'
                          ? "Thanks for reaching out — I'll get back to you within 24 hours."
                          : 'Please try again, or reach out on LinkedIn.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium tracking-wide text-gray-400 mb-2">YOUR NAME</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-neutral-950/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium tracking-wide text-gray-400 mb-2">EMAIL</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-neutral-950/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium tracking-wide text-gray-400 mb-2">PROJECT TYPE</label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-neutral-950/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select a project type</option>
                    <option value="web-app">Web Application</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="ai-integration">AI Integration</option>
                    <option value="e-commerce">E-commerce Platform</option>
                    <option value="custom">Custom Solution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium tracking-wide text-gray-400 mb-2">TELL ME ABOUT YOUR PROJECT</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-950/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/40 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Describe your project, timeline, and any specific requirements..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send message
                    </>
                  )}
                </button>
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
    <footer className="border-t border-white/5 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-3 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/f35-logo.png" alt="F-35 Logo" className="w-8 h-8 object-contain" />
              <span className="text-sm font-semibold tracking-[0.25em]">SETH BAILEY</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Building the future with AI. Bringing your projects to life.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.25em] text-gray-500 mb-4">QUICK LINKS</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#projects"
                  onClick={(e) => scrollToSection(e, 'projects')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, 'contact')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.25em] text-gray-500 mb-4">SERVICES</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>Web Development</li>
              <li>Mobile Apps</li>
              <li>AI Integration</li>
              <li>E-commerce</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="flex gap-6">
            <a href="https://www.linkedin.com/in/seth-bailey/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors">
              LinkedIn
            </a>
            <a href="https://github.com/seth1993" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors">
              GitHub
            </a>
          </div>
          <div className="text-sm text-gray-600">
            © {currentYear} Seth Bailey. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicView;
