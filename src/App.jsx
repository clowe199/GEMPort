// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Briefcase, Mail, Send, Linkedin, Github, Twitter, ExternalLink, Menu, X, Zap, Terminal, Loader2 } from 'lucide-react';
import * as Tone from 'tone';

// --- Custom Hooks & Utility ---
const smoothScrollTo = (id) => {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const useScrollAnimation = (options = { threshold: 0.1, triggerOnce: true }) => {
    const [ref, setRef] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (!ref) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (options.triggerOnce && entry.target) { 
                    observer.unobserve(entry.target);
                }
            } else {
                if (!options.triggerOnce) setIsVisible(false);
            }
        }, options);
        observer.observe(ref);
        return () => { if (ref && observer && typeof observer.unobserve === 'function') observer.unobserve(ref); };
    }, [ref, options]);
    return [setRef, isVisible];
};

// --- Components ---

const DigitalRainBackground = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return; 
        let animationFrameId;
        const setCanvasDimensions = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        setCanvasDimensions();
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()*&^%<>?:";{}[]|';
        const fontSize = 12; let columns = Math.floor(canvas.width / fontSize);
        const drops = []; for (let i = 0; i < columns; i++) drops[i] = Math.random() * canvas.height / fontSize;
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.07)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillStyle = '#00FF00'; ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                drops[i]++;
                if (drops[i] * fontSize > canvas.height && Math.random() > .975) drops[i] = 0;
            }
        };
        const animate = () => { draw(); animationFrameId = window.requestAnimationFrame(animate); };
        animate();
        const handleResize = () => { 
            setCanvasDimensions(); columns = Math.floor(canvas.width / fontSize);
            drops.length = 0; for (let i = 0; i < columns; i++) drops[i] = Math.random() * canvas.height / fontSize;
        };
        window.addEventListener('resize', handleResize);
        return () => { window.cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
};

const DotWaveAnimation = ({ matrixModeActive, funModeActive, logoFunModeActive }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if(!ctx) return;
        let animationFrameId; let time = 0;
        const setupCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        setupCanvas();
        const numDotsX = 50; const numDotsY = 35; 
        const dotBaseSize = 1.5; const dotSizeVariance = 0.7;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); time += 0.015;
            for (let i = 0; i < numDotsX; i++) {
                for (let j = 0; j < numDotsY; j++) {
                    const u = i / (numDotsX - 1); const v = j / (numDotsY - 1);
                    const x = u * canvas.width;
                    const wave1 = Math.sin(u * 5 + time + v * 2.5) * 20;
                    const wave2 = Math.sin(u * 3.5 + v * 3.5 + time * 0.7) * 15;
                    const wave3 = Math.cos(v * 4.5 + time * 1.2 - u * 2.5) * 10;
                    const yOffset = wave1 + wave2 + wave3;
                    const baseY = v * canvas.height; const y = baseY + yOffset;
                    let R, G, B, A;
                    const dynamicAlphaFactor = 0.4 + Math.sin(u * Math.PI * 2.2 + time * 1.1 + v * Math.PI * 1.2) * 0.3;
                    if (matrixModeActive) {
                        R = 0; G = 255; B = 0; A = 0.1 + Math.max(0, Math.sin(u * 7 + v * 5 + time * 2.5)) * 0.25;
                    } else if (funModeActive || logoFunModeActive) {
                        const hue = (time * 30 + u * 180 + v * 90) % 360;
                        if (hue < 60) { R=255; G=Math.floor(hue/60*255); B=0; }
                        else if (hue < 120) { R=Math.floor(255-(hue-60)/60*255); G=255; B=0; }
                        else if (hue < 180) { R=0; G=255; B=Math.floor((hue-120)/60*255); }
                        else if (hue < 240) { R=0; G=Math.floor(255-(hue-180)/60*255); B=255; }
                        else if (hue < 300) { R=Math.floor((hue-240)/60*255); G=0; B=255; }
                        else { R=255; G=0; B=Math.floor(255-(hue-300)/60*255); }
                        A = 0.25 + dynamicAlphaFactor * 0.35;
                    } else {
                        R = 120; G = 130; B = 160; A = 0.08 + dynamicAlphaFactor * 0.18; 
                    }
                    A = Math.max(0.03, Math.min(0.6, A));
                    const currentDotSize = dotBaseSize + Math.sin(u * 10 + v * 5 + time * 1.5) * dotSizeVariance;
                    ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${A})`;
                    ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, currentDotSize), 0, Math.PI * 2); ctx.fill();
                }
            }
            animationFrameId = window.requestAnimationFrame(draw);
        };
        draw(); window.addEventListener('resize', setupCanvas);
        return () => { window.cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', setupCanvas); };
    }, [matrixModeActive, funModeActive, logoFunModeActive]);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[1] pointer-events-none" />;
};

// SIMPLIFIED ColorSplashCursor Component
const ColorSplashCursor = ({ funModeActive, matrixModeActive }) => {
  const cursorOuterRef = useRef(null);
  const matrixCursorRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(null);
  const [isHoveringInteractiveElement, setIsHoveringInteractiveElement] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      lastMousePos.current.x = e.clientX;
      lastMousePos.current.y = e.clientY;
      // For debugging: console.log('Mouse:', lastMousePos.current.x, lastMousePos.current.y);
    };

    const updateCursorVisuals = () => {
      const xPos = lastMousePos.current.x;
      const yPos = lastMousePos.current.y;

      if (matrixCursorRef.current) {
        matrixCursorRef.current.style.left = `${xPos + 2}px`; // Small offset for block cursor
        matrixCursorRef.current.style.top = `${yPos + 2}px`;
      }
      if (cursorOuterRef.current) {
        // Directly position top-left corner at mouse position
        cursorOuterRef.current.style.left = `${xPos}px`;
        cursorOuterRef.current.style.top = `${yPos}px`;
      }
      animationFrameId.current = requestAnimationFrame(updateCursorVisuals);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId.current = requestAnimationFrame(updateCursorVisuals);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // This effect runs once to set up the continuous position update

  useEffect(() => {
    const interactiveElements = document.querySelectorAll(
      'button, a, [data-interactive], input, textarea, select'
    );
    const handleMouseEnter = (e) => {
      setIsHoveringInteractiveElement(true);
      const target = e.target.closest('button, a, [data-interactive], input, textarea, select');
      if (target) {
        const tagName = target.tagName.toLowerCase();
        if (tagName === 'button' || tagName === 'a' || target.hasAttribute('data-interactive') || tagName === 'select') {
            document.body.style.cursor = 'pointer';
        } else if (tagName === 'input' || tagName === 'textarea') {
            document.body.style.cursor = 'text';
        } else { document.body.style.cursor = 'auto'; }
      } else { document.body.style.cursor = 'auto'; }
    };
    const handleMouseLeave = () => {
      setIsHoveringInteractiveElement(false);
      document.body.style.cursor = 'none';
    };
    interactiveElements.forEach(el => { el.addEventListener('mouseenter', handleMouseEnter); el.addEventListener('mouseleave', handleMouseLeave); });
    if (!isHoveringInteractiveElement) document.body.style.cursor = 'none';
    return () => { interactiveElements.forEach(el => { el.removeEventListener('mouseenter', handleMouseEnter); el.removeEventListener('mouseleave', handleMouseLeave); }); document.body.style.cursor = 'auto'; };
  }, [isHoveringInteractiveElement]);

  const showCustomSplashCursor = !isHoveringInteractiveElement && !matrixModeActive;

  if (matrixModeActive) {
    return ( <div ref={matrixCursorRef} className="fixed pointer-events-none z-[9999] w-2 h-5 bg-matrix-green animate-cursor-blink" style={{ transform: 'translateY(-100%)' /* Adjust block cursor anchor */ }} /> );
  }
  if (!showCustomSplashCursor) return null; 
  
  let cursorOuterClasses = "fixed pointer-events-none z-[9999] rounded-full transition-all duration-200 ease-out";
  const currentCursorSize = funModeActive ? (24 * 1.5) : 24;
  const blurAmount = funModeActive ? 'blur-md' : 'blur-sm';
  const opacityAmount = funModeActive ? 'opacity-90' : 'opacity-70';
  cursorOuterClasses += ` bg-gradient-to-br from-cyan-400 via-pink-500 to-yellow-400 ${opacityAmount} ${blurAmount}`;
  if (funModeActive) cursorOuterClasses += ' scale-150 animate-pulse-fast';
  
  return (
    <div ref={cursorOuterRef} className={cursorOuterClasses} style={{ width: `${currentCursorSize}px`, height: `${currentCursorSize}px` }} />
  );
};


const Preloader = ({ onLoaded }) => {
    useEffect(() => { const timer = setTimeout(onLoaded, 2500); return () => clearTimeout(timer); }, [onLoaded]);
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[10000] pointer-events-auto">
            <div className="mb-4 text-neutral-400 text-sm animate-pulse">Loading Curtis Bryant's Portfolio...</div>
            <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 animate-preloader-fill"></div>
            </div>
        </div>
    );
};

const mockProjects = [
  { id: 1, title: 'E-commerce Platform', description: 'A full-featured e-commerce platform with Stripe integration and admin dashboard. Built with Next.js, Tailwind CSS, and Firebase.', imageUrl: 'https://placehold.co/600x400/3498db/ffffff?text=Project+Alpha', liveUrl: '#', repoUrl: '#', tags: ['Next.js', 'React', 'Firebase', 'Tailwind CSS', 'Stripe']},
  { id: 2, title: 'Task Management App', description: 'A collaborative task management tool with real-time updates, drag-and-drop interface, and notification system.', imageUrl: 'https://placehold.co/600x400/2ecc71/ffffff?text=Project+Beta', liveUrl: '#', repoUrl: '#', tags: ['React', 'Node.js', 'Socket.io', 'MongoDB']},
  { id: 3, title: 'Portfolio Website V1', description: 'My previous personal portfolio website, showcasing earlier projects and skills. Focused on clean design and animations.', imageUrl: 'https://placehold.co/600x400/e74c3c/ffffff?text=Project+Gamma', liveUrl: '#', repoUrl: '#', tags: ['HTML', 'CSS', 'JavaScript', 'GSAP']},
];

const ParallaxSection = ({ children, bgImage, className, strength = 0.1, bgColor, funModeActive, funModeStyle, matrixModeActive }) => {
  const [offsetY, setOffsetY] = useState(0);
  useEffect(() => { const handleScroll = () => setOffsetY(window.pageYOffset); window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []);
  let sectionStyle = {};
  if (!matrixModeActive) {
    sectionStyle = bgImage ? { backgroundImage: `url(${bgImage})`, backgroundPositionY: offsetY * strength } : { backgroundColor: bgColor || 'transparent' };
    if (funModeActive && funModeStyle) sectionStyle = { ...sectionStyle, ...funModeStyle };
  }
  return (
    <section className={`relative bg-cover bg-center bg-no-repeat transition-all duration-500 ${className} ${matrixModeActive ? 'bg-black' : ''}`} style={sectionStyle}>
      {matrixModeActive && (bgImage || className.includes("min-h-screen")) && <DigitalRainBackground />} 
      {!matrixModeActive && bgImage && !funModeActive && <div className="absolute inset-0 bg-black opacity-75 z-0"></div>}
      {funModeActive && !matrixModeActive && <div className="absolute inset-0 animate-fun-mode-bg-pulse z-0"></div>}
      <div className="relative z-10">{children}</div>
    </section>
  );
};

const Navbar = ({ setActiveSection, activeSection, onLogoRapidClick, matrixModeActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimer = useRef(null);
  const navLinks = [ { id: 'hero', title: 'Home' }, { id: 'about', title: 'About' }, { id: 'projects', title: 'Projects' }, { id: 'contact', title: 'Contact' }];
  const handleLinkClick = (id) => { smoothScrollTo(id); if (typeof setActiveSection === 'function') setActiveSection(id.replace('_wrapper', '')); setIsOpen(false); };
  const handleLogoClick = () => {
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    const newClickCount = logoClickCount + 1; setLogoClickCount(newClickCount);
    if (newClickCount >= 7) { onLogoRapidClick(); setLogoClickCount(0); } 
    else { logoClickTimer.current = setTimeout(() => setLogoClickCount(0), 1500); }
    handleLinkClick('hero');
  };

  return (
    <nav className={`p-4 fixed w-full top-0 z-50 transition-colors duration-500 ${matrixModeActive ? 'bg-black text-matrix-green' : 'bg-black bg-opacity-70 backdrop-blur-sm text-neutral-300'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <button data-interactive onClick={handleLogoClick} className={`text-2xl font-semibold transition-colors duration-300 focus:outline-none ${matrixModeActive ? 'hover:text-white' : 'text-neutral-100 hover:text-cyan-400'}`}>
          Curtis Bryant
        </button>
        <div className="hidden md:flex space-x-1">
          {navLinks.map((link) => (
            <button key={link.id} data-interactive onClick={() => handleLinkClick(link.id)}
              className={`px-3 py-2 rounded-sm text-sm transition-all duration-300 group relative
                ${activeSection === link.id ? (matrixModeActive ? 'text-white underline decoration-matrix-green' : 'text-white underline underline-offset-4 decoration-pink-500') : (matrixModeActive ? 'hover:text-white' : 'text-neutral-400 hover:text-cyan-400')}`}
            >
              {link.title}
              {!matrixModeActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>}
            </button>
          ))}
        </div>
        <div className="md:hidden">
          <button data-interactive onClick={() => setIsOpen(!isOpen)} className={`focus:outline-none transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green hover:text-white' : 'text-neutral-200 hover:text-pink-500'}`}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className={`md:hidden absolute top-full left-0 right-0 shadow-md transition-colors duration-500 ${matrixModeActive ? 'bg-black bg-opacity-95 text-matrix-green' : 'bg-black bg-opacity-95 backdrop-blur-sm text-neutral-300'}`}>
          <ul className="flex flex-col items-center py-2">
            {navLinks.map((link) => ( <li key={link.id} className="w-full text-center"> <button data-interactive onClick={() => handleLinkClick(link.id)} className={`block w-full py-3 transition-colors duration-300 ${activeSection === link.id ? (matrixModeActive ? 'text-white bg-neutral-800' : 'text-pink-400 bg-neutral-800') : (matrixModeActive ? 'hover:text-white hover:bg-neutral-800' : 'text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800')}`}>{link.title}</button></li>))}
          </ul>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ funModeActive, logoFunModeActive, matrixModeActive }) => {
  const prefixText = "Hello, I'm "; const nameText = "Curtis Bryant"; const suffixText = ".";
  const prefixDelay = (index) => `${index * 0.07}s`;
  const nameDelay = (index) => `${(prefixText.length + index) * 0.07}s`;
  const suffixDelay = (index) => `${(prefixText.length + nameText.length + index) * 0.07}s`;
  const heroFunModeStyle = logoFunModeActive && !matrixModeActive ? { backgroundImage: 'linear-gradient(45deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)', backgroundSize: '400% 400%', animation: 'logoFunBg 3s ease infinite' } : null;

  return (
    <ParallaxSection id="hero" bgImage={logoFunModeActive || matrixModeActive ? '' : "https://placehold.co/1920x1080/0a0a0a/1a1a1a?text="} 
      className="min-h-screen flex items-center justify-center text-center" strength={0.1}
      funModeActive={logoFunModeActive && !matrixModeActive} funModeStyle={heroFunModeStyle} matrixModeActive={matrixModeActive}>
      <DotWaveAnimation matrixModeActive={matrixModeActive} funModeActive={funModeActive || logoFunModeActive} />
      <div className={`container mx-auto px-4 py-20 relative z-10 ${matrixModeActive ? 'text-matrix-green' : 'text-neutral-100'}`}>
        <h1 className={`text-4xl md:text-6xl font-medium mb-6 ${(logoFunModeActive && !matrixModeActive) ? 'animate-text-pop' : ''}`}>
          {prefixText.split('').map((letter, index) => (<span key={`prefix-${index}`} className={`inline-block opacity-0 animate-letter-reveal ${matrixModeActive ? 'text-matrix-green' : 'text-neutral-100'}`} style={{ animationDelay: prefixDelay(index) }}>{letter === ' ' ? '\u00A0' : letter}</span>))}
          <span className="inline-block group" data-interactive>
            {nameText.split('').map((letter, index) => (<span key={`name-${index}`} className={`inline-block opacity-0 animate-letter-reveal ${matrixModeActive ? 'text-matrix-green hover:text-white' : 'text-neutral-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-500'} transition-all duration-500 ease-in-out ${(logoFunModeActive && !matrixModeActive) ? 'animate-text-rainbow-fast' : ''}`} style={{ animationDelay: nameDelay(index) }}>{letter === ' ' ? '\u00A0' : letter}</span>))}
          </span>
          {suffixText.split('').map((letter, index) => (<span key={`suffix-${index}`} className={`inline-block opacity-0 animate-letter-reveal ${matrixModeActive ? 'text-matrix-green' : 'text-neutral-100'}`} style={{ animationDelay: suffixDelay(index) }}>{letter}</span>))}
        </h1>
        <p className={`text-lg md:text-xl mb-8 animate-fade-in-up animation-delay-300 transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green' : 'text-neutral-300 hover:text-neutral-100'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow' : ''}`}>
          A Creative Developer & UI/UX Enthusiast.
        </p>
        <button data-interactive onClick={() => smoothScrollTo('projects')}
          className={`font-normal py-2.5 px-6 rounded-sm text-md transition-all duration-300 animate-fade-in-up animation-delay-600 ${matrixModeActive ? 'border border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black' : `border border-neutral-500 text-neutral-200 hover:border-transparent hover:text-white hover:shadow-[0_0_15px_5px_rgba(255,0,255,0.3),0_0_20px_7px_rgba(0,255,255,0.2)] hover:bg-gradient-to-br from-purple-600 via-pink-600 to-blue-500`} hover:scale-105 ${(funModeActive && !matrixModeActive) ? 'animate-button-pulse' : ''}`}>
          View My Work
        </button>
      </div>
    </ParallaxSection>
  );
};

const About = ({ funModeActive, matrixModeActive }) => {
    const [setRef, isVisible] = useScrollAnimation(); const [setImgRef, isImgVisible] = useScrollAnimation({threshold: 0.3}); const [setText1Ref, isText1Visible] = useScrollAnimation({threshold: 0.5}); const [setText2Ref, isText2Visible] = useScrollAnimation({threshold: 0.5, delay: 200}); const [setText3Ref, isText3Visible] = useScrollAnimation({threshold: 0.5, delay: 400}); const [setSocialRef, isSocialVisible] = useScrollAnimation({threshold:0.2});
    return (
      <section id="about" className={`py-16 md:py-24 overflow-hidden transition-colors duration-500 ${matrixModeActive ? 'bg-black text-matrix-green' : 'bg-neutral-900 text-neutral-200'}`}>
        <div className="container mx-auto px-6 md:px-12">
          <h2 ref={setRef} className={`text-3xl font-medium text-center mb-10 md:mb-16 group transition-all duration-300 ${isVisible ? 'animate-scroll-fade-in-up' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow' : (matrixModeActive ? 'text-matrix-green' : 'text-neutral-100 hover:text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500')}`}>
            <User size={28} className={`inline-block mr-2 align-middle transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green' : `text-neutral-100 ${(funModeActive && !matrixModeActive) ? '' : 'group-hover:text-pink-500'}`}`} /> About
          </h2>
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
            <div ref={setImgRef} className={`md:w-1/3 flex justify-center ${isImgVisible ? 'animate-scroll-fade-in-left' : 'opacity-0'}`}>
              <img data-interactive src="https://placehold.co/300x300/1c1c1c/555555?text=CB" alt="Curtis Bryant"
                className={`rounded-sm w-48 h-48 md:w-64 md:h-64 object-cover border transition-all duration-300 ${matrixModeActive ? 'border-matrix-green filter-matrix-image' : 'border-neutral-700 hover:border-pink-500'} hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30 ${(funModeActive && !matrixModeActive) ? 'animate-image-color-cycle' : ''}`} />
            </div>
            <div className={`md:w-2/3 text-md space-y-4 leading-relaxed ${isText1Visible || isText2Visible || isText3Visible ? '' : 'opacity-0'} ${matrixModeActive ? 'text-matrix-green' : 'text-neutral-300'}`}>
              <p ref={setText1Ref} className={`transition-colors duration-200 ${isText1Visible ? 'animate-scroll-fade-in-right' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow animation-delay-200' : (matrixModeActive ? '' : 'hover:text-neutral-100')}`}>I am a Creative Developer from Illinois, with a focus on crafting engaging UI/UX and bringing digital ideas to life. My work is driven by a passion for clean code, intuitive design, and user-centered digital experiences.</p>
              <p ref={setText2Ref} className={`transition-colors duration-200 ${isText2Visible ? 'animate-scroll-fade-in-right animation-delay-200' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow animation-delay-400' : (matrixModeActive ? '' : 'hover:text-neutral-100')}`}>With 5+ years of experience, I've had the opportunity to work on diverse projects, honing my skills in React, Next.js, Node.js, and modern CSS frameworks. I approach each challenge with curiosity and a commitment to quality.</p>
              <p ref={setText3Ref} className={`transition-colors duration-200 ${isText3Visible ? 'animate-scroll-fade-in-right animation-delay-400' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow animation-delay-600' : (matrixModeActive ? '' : 'hover:text-neutral-100')}`}>Beyond coding, I enjoy exploring generative art, playing guitar, and staying updated with the latest tech trends. Continuously learning and pushing creative boundaries is what keeps me inspired.</p>
              <div ref={setSocialRef} className={`flex space-x-5 mt-8 ${isSocialVisible ? 'animate-scroll-fade-in-up animation-delay-[600ms]' : 'opacity-0'}`}>
                <a data-interactive href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className={`${matrixModeActive ? 'text-matrix-green hover:text-white' : 'text-neutral-400 hover:text-cyan-400'} transition-colors duration-300 transform hover:scale-125`}><Linkedin size={22} /></a>
                <a data-interactive href="https://github.com/" target="_blank" rel="noopener noreferrer" className={`${matrixModeActive ? 'text-matrix-green hover:text-white' : 'text-neutral-400 hover:text-pink-400'} transition-colors duration-300 transform hover:scale-125`}><Github size={22} /></a>
                <a data-interactive href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className={`${matrixModeActive ? 'text-matrix-green hover:text-white' : 'text-neutral-400 hover:text-yellow-400'} transition-colors duration-300 transform hover:scale-125`}><Twitter size={22} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
};

const ProjectCard = ({ project, index, funModeActive, matrixModeActive }) => {
    const [setRef, isVisible] = useScrollAnimation({threshold: 0.2}); const animationDelay = `${index * 150}ms`; 
    return (
      <div ref={setRef} data-interactive 
           className={`overflow-hidden flex flex-col h-full group transition-all duration-300 ${matrixModeActive ? 'bg-black border border-matrix-green/50 rounded-none' : 'bg-neutral-800/50 border border-neutral-700 rounded-sm hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/20'} hover:scale-[1.02] ${isVisible ? (matrixModeActive ? 'animate-scroll-fade-in' : 'animate-scroll-zoom-in') : 'opacity-0 scale-90 filter grayscale'} ${(funModeActive && !matrixModeActive) ? 'animate-card-bounce' : ''}`}
           style={{ animationDelay: isVisible ? animationDelay : '0ms' }}>
        <div className="w-full h-48 overflow-hidden">
            <img src={project.imageUrl} alt={project.title} 
                className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${matrixModeActive ? 'filter-matrix-image' : `filter grayscale group-hover:filter-none group-hover:saturate-150 group-hover:hue-rotate-15deg ${isVisible ? 'grayscale-0' : 'grayscale'}`} ${(funModeActive && !matrixModeActive) ? 'animate-image-color-cycle-fast' : ''}`}
                onError={(e) => e.target.src='https://placehold.co/600x400/2a2a2a/444444?text=Error'}/>
        </div>
        <div className={`p-5 flex flex-col flex-grow ${matrixModeActive ? 'text-matrix-green' : ''}`}>
          <h3 className={`text-xl font-medium mb-2 transition-all duration-300 ${matrixModeActive ? 'text-matrix-green' : `text-neutral-100 ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow' : 'group-hover:text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500'}`}`}>{project.title}</h3>
          <p className={`mb-3 text-sm flex-grow transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green/80' : 'text-neutral-400 group-hover:text-neutral-200'}`}>{project.description}</p>
          <div className="mb-3">
            {project.tags.map(tag => ( <span key={tag} className={`inline-block text-xs mr-1.5 mb-1.5 px-2 py-0.5 transition-all duration-300 ${matrixModeActive ? 'border border-matrix-green/50 text-matrix-green/70' : `border border-neutral-600 text-neutral-500 rounded-sm group-hover:border-yellow-500/50 group-hover:text-yellow-400`} ${(funModeActive && !matrixModeActive) ? 'animate-tag-pulse' : ''}`}>{tag}</span>))}
          </div>
          <div className="mt-auto flex space-x-2">
            {project.liveUrl && project.liveUrl !== '#' && ( <a data-interactive href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center font-normal py-1.5 px-3 text-xs flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${matrixModeActive ? 'border border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black' : 'border border-neutral-600 text-neutral-300 rounded-sm hover:border-cyan-500 hover:text-cyan-300 hover:bg-cyan-500/10'}`}><ExternalLink size={14} className="mr-1.5" /> Demo</a>)}
            {project.repoUrl && project.repoUrl !== '#' && (<a data-interactive href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center font-normal py-1.5 px-3 text-xs flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${matrixModeActive ? 'border border-matrix-green text-matrix-green hover:bg-matrix-green hover:text-black' : 'border border-neutral-600 text-neutral-300 rounded-sm hover:border-pink-500 hover:text-pink-300 hover:bg-pink-500/10'}`}><Github size={14} className="mr-1.5" /> Code</a>)}
          </div>
        </div>
      </div>
    );
};

const Projects = ({ funModeActive, matrixModeActive }) => {
    const [setTitleRef, isTitleVisible] = useScrollAnimation();
    return (
      <ParallaxSection id="projects" bgImage={matrixModeActive ? '' : "https://placehold.co/1920x1080/111111/222222?text="} 
        className="py-16 md:py-24 overflow-hidden" strength={0.1} matrixModeActive={matrixModeActive}>
        <div className={`container mx-auto px-6 md:px-12 ${matrixModeActive ? 'text-matrix-green' : 'text-neutral-200'}`}>
          <h2 ref={setTitleRef} className={`text-3xl font-medium text-center mb-10 md:mb-16 group transition-all duration-300 ${isTitleVisible ? 'animate-scroll-fade-in-up' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow' : (matrixModeActive ? 'text-matrix-green' : 'text-neutral-100 hover:text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500')}`}>
            <Briefcase size={28} className={`inline-block mr-2 align-middle transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green' : `text-neutral-100 ${(funModeActive && !matrixModeActive) ? '' : 'group-hover:text-yellow-500'}`}`} /> Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {mockProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} funModeActive={funModeActive && !matrixModeActive} matrixModeActive={matrixModeActive} />)}
          </div>
           <p className={`text-center mt-10 md:mt-16 text-sm ${isTitleVisible ? 'animate-scroll-fade-in-up animation-delay-300' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow animation-delay-200' : (matrixModeActive ? 'text-matrix-green/80' : 'text-neutral-400')}`}>
            Find more on my <a data-interactive href="https://github.com/" target="_blank" rel="noopener noreferrer" className={`${matrixModeActive ? 'text-matrix-green hover:text-white' : 'text-neutral-300 hover:text-pink-400'} underline underline-offset-2 hover:decoration-wavy transition-all duration-300`}>GitHub</a>.
          </p>
        </div>
      </ParallaxSection>
    );
};

const ContactForm = ({ funModeActive, matrixModeActive }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' }); 
  const [status, setStatus] = useState(''); 
  const [responseMessage, setResponseMessage] = useState(''); 
  const [setTitleRef, isTitleVisible] = useScrollAnimation(); 
  const [setFormRef, isFormVisible] = useScrollAnimation({threshold: 0.2});
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => { 
    e.preventDefault(); setStatus('loading'); setResponseMessage('');
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setStatus('success'); setResponseMessage(result.message || 'Message sent successfully! I will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error'); setResponseMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error); setStatus('error');
      setResponseMessage('An unexpected error occurred. Please try again later.');
    }
  };
  return (
    <section id="contact" className={`py-16 md:py-24 overflow-hidden transition-colors duration-500 ${matrixModeActive ? 'bg-black text-matrix-green' : 'bg-neutral-900 text-neutral-200'}`}>
      <div className="container mx-auto px-6 md:px-12">
        <h2 ref={setTitleRef} className={`text-3xl font-medium text-center mb-10 md:mb-16 group transition-all duration-300 ${isTitleVisible ? 'animate-scroll-fade-in-up' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow' : (matrixModeActive ? 'text-matrix-green' : 'text-neutral-100 hover:text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-cyan-500')}`}>
          <Mail size={28} className={`inline-block mr-2 align-middle transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green' : `text-neutral-100 ${(funModeActive && !matrixModeActive) ? '' : 'group-hover:text-cyan-500'}`}`} /> Contact
        </h2>
        <form ref={setFormRef} onSubmit={handleSubmit} className={`max-w-xl mx-auto p-6 md:p-8 space-y-5 transition-all duration-300 group ${matrixModeActive ? 'bg-black border border-matrix-green/50 rounded-none' : 'bg-neutral-800/30 border border-neutral-700 rounded-sm hover:border-cyan-500/50'} ${isFormVisible ? 'animate-scroll-fade-in' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-form-shake' : ''}`}>
          <div>
            <label htmlFor="name" className={`block text-xs font-normal mb-1 transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green/80' : 'text-neutral-400 group-hover:text-cyan-300'}`}>Name</label>
            <input data-interactive type="text" name="name" id="name" value={formData.name} onChange={handleChange} required autoComplete="name"
              className={`w-full px-3 py-2 text-sm outline-none transition-all duration-300 ${matrixModeActive ? 'bg-black border border-matrix-green/60 text-matrix-green focus:border-matrix-green focus:ring-0 placeholder-matrix-green/50' : 'bg-neutral-800 border border-neutral-600 text-neutral-200 rounded-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-neutral-500'}`} placeholder="Your Name" />
          </div>
          <div>
            <label htmlFor="email" className={`block text-xs font-normal mb-1 transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green/80' : 'text-neutral-400 group-hover:text-cyan-300'}`}>Email</label>
            <input data-interactive type="email" name="email" id="email" value={formData.email} onChange={handleChange} required autoComplete="email"
              className={`w-full px-3 py-2 text-sm outline-none transition-all duration-300 ${matrixModeActive ? 'bg-black border border-matrix-green/60 text-matrix-green focus:border-matrix-green focus:ring-0 placeholder-matrix-green/50' : 'bg-neutral-800 border border-neutral-600 text-neutral-200 rounded-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-neutral-500'}`} placeholder="your.email@example.com" />
          </div>
          <div>
            <label htmlFor="subject" className={`block text-xs font-normal mb-1 transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green/80' : 'text-neutral-400 group-hover:text-cyan-300'}`}>Subject</label>
            <input data-interactive type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required autoComplete="off"
              className={`w-full px-3 py-2 text-sm outline-none transition-all duration-300 ${matrixModeActive ? 'bg-black border border-matrix-green/60 text-matrix-green focus:border-matrix-green focus:ring-0 placeholder-matrix-green/50' : 'bg-neutral-800 border border-neutral-600 text-neutral-200 rounded-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-neutral-500'}`} placeholder="Regarding..." />
          </div>
          <div>
            <label htmlFor="message" className={`block text-xs font-normal mb-1 transition-colors duration-300 ${matrixModeActive ? 'text-matrix-green/80' : 'text-neutral-400 group-hover:text-cyan-300'}`}>Message</label>
            <textarea data-interactive name="message" id="message" rows="4" value={formData.message} onChange={handleChange} required autoComplete="off"
              className={`w-full px-3 py-2 text-sm resize-none outline-none transition-all duration-300 ${matrixModeActive ? 'bg-black border border-matrix-green/60 text-matrix-green focus:border-matrix-green focus:ring-0 placeholder-matrix-green/50' : 'bg-neutral-800 border border-neutral-600 text-neutral-200 rounded-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-neutral-500'}`} placeholder="Your message..."></textarea>
          </div>
          <div> <button data-interactive type="submit" disabled={status === 'loading'} className={`w-full flex items-center justify-center font-normal py-2.5 px-6 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 ${matrixModeActive ? 'border border-matrix-green bg-transparent text-matrix-green hover:bg-matrix-green hover:text-black' : `border border-neutral-500 bg-neutral-700 text-neutral-200 rounded-sm hover:border-transparent hover:text-white hover:shadow-[0_0_15px_5px_rgba(0,255,255,0.3),0_0_20px_7px_rgba(255,0,255,0.2)] hover:bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-500`} ${(funModeActive && !matrixModeActive) ? 'animate-button-pulse' : ''}`}>{status === 'loading' ? (<><Loader2 size={16} className="mr-2 animate-spin" />Sending...</>) : (<><Send size={16} className="mr-2" /> Send Message</>)}</button> </div>
          {responseMessage && (<p className={`mt-3 text-xs text-center ${status === 'success' ? (matrixModeActive ? 'text-matrix-green' : 'text-green-400') : (matrixModeActive ? 'text-red-500' : 'text-red-400')}`}>{responseMessage}</p>)}
        </form>
        <p className={`text-center mt-6 text-xs ${isFormVisible ? 'animate-scroll-fade-in animation-delay-200' : 'opacity-0'} ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow animation-delay-400' : (matrixModeActive ? 'text-matrix-green/70' : 'text-neutral-500')}`}> Or email: <a data-interactive href="mailto:hello@clowe.co" className={`${matrixModeActive ? 'text-matrix-green hover:text-white' : 'text-neutral-400 hover:text-cyan-300'} underline underline-offset-2 hover:decoration-wavy transition-all duration-300`}>hello@clowe.co</a></p>
      </div>
    </section>
  );
};

const Footer = ({funModeActive, matrixModeActive}) => {
    const [setWord1Ref, isWord1Visible] = useScrollAnimation({threshold:1, triggerOnce: false}); const [word1Clicked, setWord1Clicked] = useState(false);
    const handleWordClick = (setter) => { 
        setter(true); setTimeout(() => setter(false), 1000);
        if (!matrixModeActive && !funModeActive) { try { if (typeof Tone !== 'undefined' && Tone.Synth) {const synth = new Tone.Synth().toDestination(); synth.triggerAttackRelease("C5", "8n", Tone.now()); synth.triggerAttackRelease("E5", "8n", Tone.now() + 0.1); synth.triggerAttackRelease("G5", "8n", Tone.now() + 0.2); }} catch(e){ console.error("Tone.js Footer Error:", e); }}
    };
    const getWordColorClass = (baseColorClass) => matrixModeActive ? 'text-matrix-green' : baseColorClass;

    return (
      <footer className={`py-8 text-center transition-colors duration-500 ${matrixModeActive ? 'bg-black text-matrix-green/70' : 'bg-black text-neutral-500'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-5 mb-3">
            <a data-interactive href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className={`${matrixModeActive ? 'hover:text-white' : 'hover:text-cyan-400'} transition-colors duration-300 transform hover:scale-125`}><Linkedin size={20} /></a>
            <a data-interactive href="https://github.com/" target="_blank" rel="noopener noreferrer" className={`${matrixModeActive ? 'hover:text-white' : 'hover:text-pink-400'} transition-colors duration-300 transform hover:scale-125`}><Github size={20} /></a>
            <a data-interactive href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className={`${matrixModeActive ? 'hover:text-white' : 'hover:text-yellow-400'} transition-colors duration-300 transform hover:scale-125`}><Twitter size={20} /></a>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} Curtis Bryant. All rights reserved.</p>
          <p className={`text-xs mt-1 ${(funModeActive && !matrixModeActive) ? 'animate-text-rainbow' : ''}`}>
            <span ref={setWord1Ref} data-interactive onClick={() => handleWordClick(setWord1Clicked)} className={`inline-block cursor-pointer transition-all duration-300 ${word1Clicked ? `animate-word-pop ${getWordColorClass('text-pink-400')}` : ''} ${isWord1Visible && !word1Clicked ? (matrixModeActive ? 'hover:text-white' : 'hover:text-cyan-400') : ''}`}>Minimalist</span> Design. {' '}
            <span data-interactive onClick={(e) => { e.target.classList.add('animate-word-pop'); e.target.classList.add(getWordColorClass('text-yellow-400')); setTimeout(() => {e.target.classList.remove('animate-word-pop'); e.target.classList.remove(getWordColorClass('text-yellow-400'))}, 1000)}} className={`cursor-pointer transition-colors duration-200 ${matrixModeActive ? 'hover:text-white' : 'hover:text-yellow-500'}`}>Typewriter</span> Font. {' '}
            <span data-interactive onClick={(e) => { e.target.classList.add('animate-word-pop'); e.target.classList.add(getWordColorClass('text-purple-400')); setTimeout(() => {e.target.classList.remove('animate-word-pop'); e.target.classList.remove(getWordColorClass('text-purple-400'))}, 1000)}} className={`cursor-pointer transition-colors duration-200 ${matrixModeActive ? 'hover:text-white' : 'hover:text-purple-500'}`}>Color Splash</span> Hovers.
          </p>
        </div>
      </footer>
    );
};

const konamiSequence = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const matrixSequence = ['m', 'a', 't', 'r', 'i', 'x'];

export default function App() {
  const [activeSection, setActiveSection] = useState('hero'); const [isLoading, setIsLoading] = useState(true); 
  const sectionRefs = { hero: useRef(null), about: useRef(null), projects: useRef(null), contact: useRef(null) };
  const [konamiInput, setKonamiInput] = useState([]); const [funModeActive, setFunModeActive] = useState(false);
  const [logoFunModeActive, setLogoFunModeActive] = useState(false); const [showFunMessage, setShowFunMessage] = useState('');
  const [matrixInput, setMatrixInput] = useState([]); const [matrixModeActive, setMatrixModeActive] = useState(false);
  const matrixInputTimeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      const newKonamiInput = [...konamiInput, key];
      if (konamiSequence.slice(0, newKonamiInput.length).join('') === newKonamiInput.join('')) {
        if (newKonamiInput.length === konamiSequence.length) {
          if (!matrixModeActive) { 
            setFunModeActive(true); setShowFunMessage("FUN MODE ACTIVATED!"); setKonamiInput([]);
            try { if (typeof Tone !== 'undefined' && Tone.PolySynth && Tone.Synth) { const synth = new Tone.PolySynth(Tone.Synth).toDestination(); const now = Tone.now(); synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", now); synth.triggerAttackRelease(["E4", "G4", "C5"], "8n", now + 0.2); synth.triggerAttackRelease(["G4", "C5", "E5"], "8n", now + 0.4); }} catch(e){ console.error("Tone.js Konami Error: ", e)}
            setTimeout(() => { setFunModeActive(false); setShowFunMessage(''); }, 7000);
          } else { setKonamiInput([]); } 
        } else { setKonamiInput(newKonamiInput); }
      } else { setKonamiInput(konamiSequence.includes(key) ? [key] : []); } 

      if (matrixSequence.includes(key)) {
        const newMatrixTyped = [...matrixInput, key];
        if (matrixInputTimeoutRef.current) clearTimeout(matrixInputTimeoutRef.current);
        if (newMatrixTyped.join('') === matrixSequence.join('')) {
            setMatrixModeActive(true); setShowFunMessage("ENTERING THE MATRIX..."); setMatrixInput([]);
            try { if (typeof Tone !== 'undefined' && Tone.FMSynth) { const synth = new Tone.FMSynth().toDestination(); const now = Tone.now(); synth.triggerAttackRelease("C2", "2n", now); synth.triggerAttackRelease("G2", "2n", now + 0.1); synth.triggerAttackRelease("D3", "2n", now + 0.2); }} catch(e){ console.error("Tone.js Matrix Error: ", e)}
            setTimeout(() => { setMatrixModeActive(false); setShowFunMessage(''); }, 12000); 
        } else {
            setMatrixInput(newMatrixTyped);
            matrixInputTimeoutRef.current = setTimeout(() => setMatrixInput([]), 1500); 
        }
      } else {
        if (!key.startsWith("arrow")) { setMatrixInput([]); if (matrixInputTimeoutRef.current) clearTimeout(matrixInputTimeoutRef.current); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiInput, matrixInput, matrixModeActive, funModeActive]); 

  const handleLogoRapidClick = () => {
    if (!matrixModeActive) { 
        setLogoFunModeActive(true); setShowFunMessage("LOGO FUN MODE!");
        try { if (typeof Tone !== 'undefined' && Tone.MembraneSynth) { const synth = new Tone.MembraneSynth().toDestination(); synth.triggerAttackRelease("C2", "8n", Tone.now()); setTimeout(() => synth.triggerAttackRelease("G2", "8n", Tone.now()), 150); setTimeout(() => synth.triggerAttackRelease("C3", "8n", Tone.now()), 300); }} catch(e){ console.error("Tone.js Logo Error: ", e)}
        setTimeout(() => { setLogoFunModeActive(false); setShowFunMessage(''); }, 5000);
    }
  };

  useEffect(() => { // For active navigation section highlighting
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
    const observerCallback = (entries) => { entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id.replace('_wrapper', '')); }); };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentRefs = Object.values(sectionRefs).map(ref => ref.current).filter(Boolean);
    currentRefs.forEach(ref => { if(ref) observer.observe(ref);});
    return () => currentRefs.forEach(ref => { if(ref && observer && typeof observer.unobserve === 'function') observer.unobserve(ref);});
  }, []);
  
  useEffect(() => { // For managing global body classes and base styles
      const body = document.body;
      body.style.fontFamily = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace";
      body.style.webkitFontSmoothing = 'antialiased';
      body.style.mozOsxFontSmoothing = 'grayscale';

      const classesToRemove = ['is-loading', 'fun-mode-active-bg', 'matrix-mode-active-bg'];
      classesToRemove.forEach(cls => body.classList.remove(cls)); 

      if (isLoading) { body.classList.add('is-loading'); }
      if (funModeActive && !matrixModeActive) { body.classList.add('fun-mode-active-bg'); }
      if (matrixModeActive) { body.classList.add('matrix-mode-active-bg'); }
      
      return () => { 
          body.style.fontFamily = '';
          body.style.webkitFontSmoothing = '';
          body.style.mozOsxFontSmoothing = '';
          classesToRemove.forEach(cls => body.classList.remove(cls));
      };
  }, [isLoading, funModeActive, matrixModeActive]); 

  if (isLoading) { return <Preloader onLoaded={() => setIsLoading(false)} />; }

  return (
    <div className={`min-h-screen font-mono transition-all duration-500 ${matrixModeActive ? 'bg-black matrix-text-global' : 'bg-black'}`}>
      <ColorSplashCursor funModeActive={(funModeActive || logoFunModeActive) && !matrixModeActive} matrixModeActive={matrixModeActive} />
      <Navbar setActiveSection={setActiveSection} activeSection={activeSection} onLogoRapidClick={handleLogoRapidClick} matrixModeActive={matrixModeActive} />
      
      {showFunMessage && (
        <div data-interactive className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 p-4 md:p-6 rounded-lg shadow-2xl z-[10001] text-center animate-scroll-fade-in-up transition-all duration-300 ${matrixModeActive ? 'bg-matrix-green text-black' : 'bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 text-black'}`}>
          {matrixModeActive ? <Terminal size={24} className="mx-auto mb-1 md:mb-2 md:w-8 md:h-8" /> : <Zap size={24} className="mx-auto mb-1 md:mb-2 animate-pulse md:w-8 md:h-8" />}
          <p className="text-base md:text-xl font-bold">{showFunMessage}</p>
          {!matrixModeActive && <p className="text-xs md:text-sm">Enjoy the chaos!</p>}
        </div>
      )}

      <main className={`opacity-0 animate-scroll-fade-in ${matrixModeActive ? 'matrix-mode-active-content' : ''}`} style={{animationDelay: '0.2s'}}> 
        <div ref={sectionRefs.hero} id="hero_wrapper"><Hero funModeActive={funModeActive} logoFunModeActive={logoFunModeActive} matrixModeActive={matrixModeActive} /></div>
        <div ref={sectionRefs.about} id="about_wrapper"><About funModeActive={funModeActive} matrixModeActive={matrixModeActive} /></div>
        <div ref={sectionRefs.projects} id="projects_wrapper"><Projects funModeActive={funModeActive} matrixModeActive={matrixModeActive} /></div>
        <div ref={sectionRefs.contact} id="contact_wrapper"><ContactForm funModeActive={funModeActive} matrixModeActive={matrixModeActive} /></div>
      </main>
      <Footer funModeActive={funModeActive && !matrixModeActive} matrixModeActive={matrixModeActive} />
    </div>
  );
}