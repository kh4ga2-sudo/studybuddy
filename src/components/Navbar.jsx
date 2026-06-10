import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { state, setView, setLang } = useApp();
  const isAr = state.lang === 'ar';
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "stats", "pricing"];
      
      // Boundary check for top of page
      if (window.scrollY < 80) {
        setActiveSection("home");
        return;
      }

      // Boundary check for bottom of page
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      if (isAtBottom) {
        setActiveSection("pricing");
        return;
      }

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = isAr 
    ? [
        { id: "home", label: "الرئيسية" },
        { id: "features", label: "المزايا" },
        { id: "stats", label: "الأرقام" },
        { id: "pricing", label: "الأسعار" },
      ]
    : [
        { id: "home", label: "Home" },
        { id: "features", label: "Features" },
        { id: "stats", label: "Stats" },
        { id: "pricing", label: "Pricing" },
      ];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 🌟 Massive Fixed Premium Brand Logo */}
      <div 
        className={`fixed top-6 z-50 transition-all duration-300 ${
          isAr ? "right-6 md:right-10" : "left-6 md:left-10"
        }`}
      >
        <button 
          onClick={() => {
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          className="focus:outline-none flex items-center transition-all hover:scale-105 p-4 md:p-5 rounded-2xl bg-white/40 backdrop-blur-md border border-purple-200/50 shadow-xl shadow-purple-100/10 hover:shadow-purple-200/20"
          aria-label="Study Buddy Home"
        >
          {/* Logo is now 35% bigger again: h-[72px] md:h-[88px] */}
          <img src="/logo.svg" className="h-[72px] md:h-[88px] w-auto" alt="STUDY BUDDY Logo" />
        </button>
      </div>

      {/* 🧭 Sleek Floating Smooth Vertical Navigation Capsule */}
      <div 
        className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isAr ? "left-6 md:left-10" : "right-6 md:right-10"
        }`}
      >
        <div className="bg-white/50 backdrop-blur-lg border border-purple-200/60 shadow-2xl shadow-purple-950/5 rounded-full py-8 px-3.5 flex flex-col items-center gap-7">
          {/* Navigation Indicators */}
          <nav className="flex flex-col gap-5 items-center">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="group relative flex items-center justify-center p-1.5 focus:outline-none"
                  aria-label={item.label}
                >
                  {/* Dynamic Tooltip */}
                  <span 
                    className={`absolute whitespace-nowrap text-xs font-bold text-[#24113f] bg-white/95 backdrop-blur-sm border border-purple-100/80 px-3 py-1.5 rounded-lg shadow-lg opacity-0 pointer-events-none transition-all duration-300 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${
                      isAr 
                        ? "left-full ml-4" 
                        : "right-full mr-4"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Sleek Dot Indicator */}
                  <span 
                    className={`rounded-full transition-all duration-300 ${
                      isActive 
                        ? "w-3.5 h-3.5 bg-purple-700 scale-125 shadow-md shadow-purple-300" 
                        : "w-2.5 h-2.5 bg-purple-300 hover:bg-purple-500 hover:scale-110"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Separation Line */}
          <div className="w-6 h-[1px] bg-purple-200/80" />

          {/* Premium Language Toggler Capsule */}
          <button
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black uppercase bg-purple-50 text-purple-700 hover:bg-purple-100 hover:scale-110 active:scale-95 transition-all shadow-sm border border-purple-100/60 focus:outline-none cursor-pointer"
            title={isAr ? "Switch to English" : "تغيير للغة العربية"}
          >
            {isAr ? 'EN' : 'AR'}
          </button>

          {/* Premium Auth Portal Circular Action Button */}
          <button 
            onClick={() => setView('auth')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-700 text-white hover:bg-purple-800 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-purple-200/50 focus:outline-none cursor-pointer"
            title={isAr ? "حسابي" : "My Account"}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2.5" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
