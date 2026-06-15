import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Code, Zap, Send, Users, TrendingUp, Menu, X, ArrowUpRight } from "lucide-react";
import plane from '../plane.png';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

// Seth Bailey monogram mark — refined "SB" squircle, matches favicon.svg
const BrandMark = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 40 40"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="bmStroke" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#60A5FA" />
        <stop offset="1" stopColor="#A78BFA" />
      </linearGradient>
      <linearGradient id="bmFill" x1="20" y1="1" x2="20" y2="39" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#161824" />
        <stop offset="1" stopColor="#0a0b11" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#bmFill)" stroke="url(#bmStroke)" strokeWidth="1.5" />
    <text
      x="20"
      y="20.5"
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      fontSize="16.5"
      fontWeight="600"
      letterSpacing="-0.5"
      fill="#ffffff"
    >
      SB
    </text>
  </svg>
);

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

  const techStack = ["React", "Node.js", "AI / LLMs", "React Native", "Firebase", "AEM"];

  return (
    <div className="min-h-screen w-full bg-[#06070d] text-white antialiased">
      <header className="sticky top-0 z-30 bg-[#06070d]/70 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-[1600px] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark className="w-8 h-8" />
            <span className="text-sm font-medium tracking-[0.28em] text-white/90">
              SETH&nbsp;BAILEY
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="#projects"
              className="text-gray-300 hover:text-white transition-colors cursor-pointer tracking-wide"
              onClick={(e) => scrollToSection(e, 'projects')}
            >
              WORK
            </a>
            <a
              href="#contact"
              className="text-gray-300 hover:text-white transition-colors cursor-pointer tracking-wide"
              onClick={(e) => scrollToSection(e, 'contact')}
            >
              CONTACT
            </a>
            <button
              onClick={onSignIn}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              Sign In
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
              className="md:hidden border-t border-white/5 bg-[#06070d]/95 backdrop-blur"
            >
              <nav className="flex flex-col px-6 py-4 space-y-4">
                <a
                  href="#projects"
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer py-2 text-lg"
                  onClick={(e) => scrollToSection(e, 'projects')}
                >
                  WORK
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
                  className="px-4 py-3 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white transition-colors text-left text-lg font-semibold"
                >
                  Sign In
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* Ambient gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-32 w-[42rem] h-[42rem] bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-10 right-0 w-[38rem] h-[38rem] bg-violet-600/20 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(circle at 30% 40%, black, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(circle at 30% 40%, black, transparent 75%)",
            }}
          />
        </div>

        {/* Plane visual, faded into the background */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-3/5">
          <div className="absolute inset-0 bg-gradient-to-r from-[#06070d] via-[#06070d]/85 lg:via-[#06070d]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070d] via-transparent to-[#06070d]/40 z-10" />
          <img
            src={plane}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-50 lg:opacity-70"
          />
        </div>

        <div className="relative z-20 mx-auto max-w-[1600px] px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Available for new projects
            </span>

            <h2 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Building the future
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                with AI.
              </span>
            </h2>

            <p className="mt-6 text-lg md:text-xl text-gray-300/90 leading-relaxed max-w-xl">
              I'm Seth Bailey — a full-stack engineer shipping AI-powered
              products end to end. From forecasting platforms to mobile apps, I
              turn ambitious ideas into fast, reliable software.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-7">
              <a
                href="#projects"
                onClick={(e) => scrollToSection(e, 'projects')}
                className="group inline-flex items-center gap-2 rounded-full bg-white text-black pl-6 pr-5 py-3 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                View work
                <span className="grid place-items-center w-5 h-5 rounded-full bg-black/10 transition-transform group-hover:translate-x-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, 'contact')}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                <span className="relative">
                  Get in touch
                  <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-white/40 transition-transform duration-300 group-hover:scale-x-100" />
                </span>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-2.5">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Selected Work — scroll-driven scenes */}
      <main id="projects" className="relative">
        <div className="mx-auto max-w-[1600px] px-6 pt-24 pb-4 text-left">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-400/80">
            Selected Work
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
            Things I've shipped.
          </h2>
        </div>
        {projects.map((project, index) => (
          <ProjectScene
            key={project.id}
            project={project}
            index={index}
            isReversed={index % 2 === 1}
          />
        ))}
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

function ProjectScene({ project, index, isReversed }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax: image drifts opposite to scroll, big index number drifts with it
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const numberY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  let domain = "";
  try {
    domain = project.url ? new URL(project.url).hostname.replace(/^www\./, "") : "";
  } catch (e) {
    domain = "";
  }

  const num = String(index + 1).padStart(2, "0");

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-28 lg:py-36 border-t border-white/5 overflow-hidden"
    >
      <div
        className={`mx-auto max-w-[1500px] px-6 grid items-center gap-12 lg:gap-20 lg:grid-cols-2`}
      >
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={`relative h-[44vh] sm:h-[56vh] lg:h-[72vh] overflow-hidden rounded-2xl ${
            isReversed ? "lg:order-2" : "lg:order-1"
          }`}
        >
          {project.image && (
            <motion.img
              src={project.image}
              alt={project.name}
              style={{ y: imageY }}
              className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover"
            />
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
        </motion.div>

        {/* Text */}
        <div className={`relative ${isReversed ? "lg:order-1" : "lg:order-2"} text-left`}>
          {/* Oversized index, drifts on scroll */}
          <motion.span
            aria-hidden="true"
            style={{ y: numberY }}
            className="pointer-events-none absolute -top-20 -left-2 select-none font-bold text-[7rem] lg:text-[10rem] leading-none text-white/[0.04]"
          >
            {num}
          </motion.span>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.08 }}
            className="relative"
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-blue-400/80"
            >
              {num} — {project.owner}
            </motion.p>

            <motion.h3
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
              className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              {project.name}
            </motion.h3>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
              className="mt-5 text-xl md:text-2xl text-gray-200 leading-snug max-w-xl"
            >
              {project.summary}
            </motion.p>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
              className="mt-5 text-base text-gray-400 leading-relaxed max-w-xl"
            >
              {project.description}
            </motion.p>

            {project.url && (
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5 }}
                className="mt-8 flex items-center gap-6"
              >
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-white"
                >
                  <span className="relative">
                    Visit site
                    <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-white/40 transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                {domain && (
                  <span className="font-mono text-xs text-gray-500">{domain}</span>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
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
              className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight pb-2"
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
                    className={`mb-6 p-6 rounded-xl border-2 ${submitStatus === 'success'
                        ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/50 text-white'
                        : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/50 text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${submitStatus === 'success'
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
                <a href="https://www.linkedin.com/in/seth-bailey/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
                <a href="https://github.com/seth1993" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  GitHub
                </a>
                {/* <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a> */}
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
