import React, { useState, useCallback, useRef, useEffect } from "react";
import { CameraManager } from "./components/CameraManager";
import { ActiveMode } from "./components/ActiveMode";
import { CalmMode } from "./components/CalmMode";
import { AnimatePresence, motion } from "framer-motion";
import { audioService } from "./lib/audio";
import { THOUGHTS } from "./data";
import { Sun, Moon } from "lucide-react";
import { initializeMediapipe } from "./lib/vision";

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [blinkTrigger, setBlinkTrigger] = useState(0);
  const [isAiReady, setIsAiReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);

  useEffect(() => {
    // Background preload of the AI model so it's fast when user clicks start
    initializeMediapipe().catch(() => {});
  }, []);

  const [theme, setTheme] = useState<'cream' | 'midnight'>(() => {
    try {
      const savedTheme = localStorage.getItem("aether_theme") as 'cream' | 'midnight';
      return savedTheme === 'midnight' ? 'midnight' : 'cream';
    } catch (e) {
      return 'cream';
    }
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'cream' ? 'midnight' : 'cream';
      try {
        localStorage.setItem("aether_theme", next);
      } catch (e) {}
      return next;
    });
    try {
      audioService.playShatter();
    } catch (e) {}
  }, []);

  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * THOUGHTS.length));
  const [isClarified, setIsClarified] = useState(false);
  const [savedIndices, setSavedIndices] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("aether_saved_thoughts");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const touchSide = useRef<'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    // Detect swipes starting near the right edge (> window.innerWidth - 60px)
    if (clientX > window.innerWidth - 60) {
      touchStartX.current = clientX;
      touchCurrentX.current = clientX;
      touchSide.current = 'right';
      setSwipeProgress(0);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null || touchSide.current !== 'right') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchCurrentX.current = clientX;
    
    const diff = touchStartX.current - clientX;
    if (diff > 0) setSwipeProgress(Math.min(diff / 100, 1));
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current !== null && touchCurrentX.current !== null && touchSide.current === 'right') {
      const diff = touchStartX.current - touchCurrentX.current;
      if (diff > 60) {
        setHasStarted(false);
      }
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
    touchSide.current = null;
    setSwipeProgress(0);
  }, []);

  const lastBlinkRef = useRef<number>(0);

  const handleBlink = useCallback(() => {
    // Only trigger blinks if we are awake
    if (!isDrowsy) {
      const now = Date.now();
      const diff = now - lastBlinkRef.current;
      if (diff < 600) { // Rapid double blink (within 600ms)
        setBlinkTrigger(prev => prev + 1);
        lastBlinkRef.current = 0; // Prevent consecutive single-blink triggers
      } else {
        lastBlinkRef.current = now;
      }
    }
  }, [isDrowsy]);

  const handleDrowsy = useCallback(() => {
    setIsDrowsy(true);
    setSavedIndices((prev) => {
      if (!prev.includes(currentIndex)) {
        const next = [...prev, currentIndex];
        try {
          localStorage.setItem("aether_saved_thoughts", JSON.stringify(next));
        } catch (e) {}
        return next;
      }
      return prev;
    });
  }, [currentIndex]);

  const handleAwake = useCallback(() => {
    setIsDrowsy(false);
  }, []);

  const enterManualMode = useCallback(() => {
    setIsManualMode(true);
    setCameraError(null);
    setIsAiReady(true);
  }, []);

  useEffect(() => {
    if (!isManualMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        // Trigger a simulated blink cycle
        handleBlink();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        // Toggle simulated deep breathing / drowsiness
        if (isDrowsy) {
          handleAwake();
        } else {
          handleDrowsy();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isManualMode, handleBlink, handleDrowsy, handleAwake, isDrowsy]);

  return (
    <div className={`w-full h-screen font-sans flex flex-col overflow-hidden select-none transition-colors duration-1000 ${
      theme === "midnight" 
        ? "bg-[#050814] text-[#E0E7FF]" 
        : "bg-[#F8F7F2] text-[#1A1A1A]"
    }`}>
      {/* Universal Theme Toggle in Circular Shape */}
      <button
        onClick={toggleTheme}
        className={`fixed top-8 right-4 md:top-12 md:right-6 z-50 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all duration-500 shadow-xl border ${
          theme === "midnight"
            ? "bg-[#0B1528]/95 border-sky-450/30 text-amber-300 hover:text-amber-100 hover:scale-105 hover:bg-[#0E1B35] shadow-[0_0_20px_rgba(56,189,248,0.25)]"
            : "bg-white/95 border-[#1A1A1A]/10 text-indigo-950 hover:bg-white hover:scale-105 shadow-[0_4px_15px_rgba(0,0,0,0.06)]"
        } active:scale-95`}
        title={theme === "midnight" ? "切换至浅色模式 Aether Cream" : "切换至深蓝黑夜模式 Midnight Blue"}
      >
        {theme === "midnight" ? (
          <Sun className="w-4 h-4 animate-[spin_30s_linear_infinite]" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      {!hasStarted ? (
        <div className={`flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden group transition-colors duration-1000 ${
          theme === "midnight" ? "bg-[#090E20]" : "bg-[#EAE8E3]"
        }`}>
          {/* CAFA-inspired dynamic fluid background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
             <motion.div 
               animate={{ 
                 x: ['-20%', '20%', '-20%'], 
                 y: ['-10%', '10%', '-10%'], 
                 rotate: [0, 10, -10, 0] 
               }} 
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] transition-colors duration-1000 bg-gradient-to-tr ${
                 theme === "midnight" 
                   ? "from-blue-600/30 to-transparent" 
                   : "from-[#1A1A1A]/40 to-transparent"
               }`} 
             />
             <motion.div 
               animate={{ 
                 x: ['20%', '-20%', '20%'], 
                 y: ['10%', '-10%', '10%'],
                 scale: [1, 1.2, 1] 
               }} 
               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
               className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] transition-colors duration-1000 bg-gradient-to-bl ${
                 theme === "midnight" 
                   ? "from-indigo-600/20 to-transparent" 
                   : "from-[#4A4A4A]/30 to-transparent"
               }`} 
             />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 w-full max-w-7xl flex flex-col justify-between h-full py-4 md:py-10"
          >
            {/* Top aesthetic metadata */}
            <div className="flex justify-between items-start w-full">
              <div className={`text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black font-sans transition-colors duration-1000 ${
                theme === "midnight" ? "text-blue-300/40" : "text-[#1A1A1A]/50"
              }`}>
                Aether Project <br />
                Vision & Reality
              </div>
              <div className={`text-right text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-black font-sans transition-colors duration-1000 ${
                theme === "midnight" ? "text-blue-300/40" : "text-[#1A1A1A]/50"
              } pr-12 md:pr-16`}>
                2026. / Central <br />
                Mindfulness
              </div>
            </div>

            {/* Kinetic Typography Centerpiece */}
            <div className="text-center relative my-auto py-20 flex flex-col items-center">
              <div className="relative w-full max-w-4xl mx-auto flex justify-center">
                <motion.h1 
                  className={`text-[22vw] md:text-[16vw] leading-[0.7] tracking-tighter font-serif uppercase relative z-10 transition-colors duration-1000 ${
                    theme === "midnight" ? "text-[#E0E7FF] drop-shadow-[0_0_40px_rgba(56,189,248,0.2)]" : "text-[#1A1A1A]"
                  }`}
                >
                  AETHER
                </motion.h1>
                <h1 
                  className="text-[22vw] md:text-[16vw] leading-[0.7] tracking-tighter text-transparent font-serif uppercase absolute top-2 md:top-4 left-[2%] md:left-[4%] w-full z-0 opacity-30 select-none transition-all duration-1000" 
                  style={{ WebkitTextStroke: theme === "midnight" ? "2px #38BDF8" : "2px #1A1A1A" }}
                >
                  AETHER
                </h1>
              </div>
              <div className="mt-12 md:mt-16 flex flex-col items-center gap-6">
                <span className={`font-serif italic text-4xl md:text-6xl transition-colors duration-1000 ${
                  theme === "midnight" ? "text-indigo-200" : "text-[#1A1A1A]"
                }`}>历 历 在 目</span>
                <span className={`text-[9px] md:text-[11px] uppercase tracking-[0.6em] font-black block text-center max-w-md transition-colors duration-1000 ${
                  theme === "midnight" ? "text-blue-300/55" : "text-[#1A1A1A]/50"
                }`}>
                  Ocular Interaction System // 空间与念头的感知边界
                </span>
              </div>
            </div>

            {/* Bottom info and interaction */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-10 mt-auto">
              <div className="text-center md:text-left flex flex-col gap-2 relative">
                <div className={`hidden md:block w-8 h-[1px] absolute -top-4 left-0 transition-colors duration-1000 ${
                  theme === "midnight" ? "bg-blue-400/20" : "bg-[#1A1A1A]/30"
                }`}></div>
                <p className={`text-[11px] md:text-xs font-serif italic max-w-[280px] leading-relaxed transition-colors duration-1000 ${
                  theme === "midnight" ? "text-indigo-200/85" : "text-[#1A1A1A]/80"
                }`}>
                  The interface reacts to your ocular frequency. 
                  <br/><br/>
                  <span className="opacity-70">此体验捕获您的眼部特征，快速眨眼两次以过滤环境噪音；闭合长于两秒，坠入平静。</span>
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3">
                <button 
                  onClick={() => {
                    setHasStarted(true);
                    try {
                      audioService.playShatter();
                    } catch (e) {}
                  }}
                  className={`group relative px-12 py-5 overflow-hidden rounded-none transition-all active:scale-[0.98] cursor-pointer ${
                    theme === "midnight" 
                      ? "bg-[#38BDF8] text-[#050814]" 
                      : "bg-[#1A1A1A] text-[#F8F7F2]"
                  }`}
                >
                  <div className={`absolute inset-0 w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] ${
                    theme === "midnight" ? "bg-[#7DD3FC]" : "bg-[#333]"
                  }`}></div>
                  <span className="relative z-10 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black whitespace-nowrap">
                    [ 开启相机感知 / Initialize Camera ]
                  </span>
                </button>
                <button 
                  onClick={() => {
                    setHasStarted(true);
                    enterManualMode();
                    try {
                      audioService.playShatter();
                    } catch (e) {}
                  }}
                  className={`text-[9px] tracking-[0.15em] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer border-b pb-0.5 active:scale-95 ${
                    theme === "midnight" 
                      ? "text-sky-300/80 hover:text-sky-300 border-sky-450/20 hover:border-sky-450/60" 
                      : "text-[#1A1A1A]/50 hover:text-[#1A1A1A] border-[#1A1A1A]/10 hover:border-[#1A1A1A]/40"
                  }`}
                >
                  键盘/点击调试模式 (无相机) 🚀
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div 
          className="flex-1 w-full h-full relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          {/* 右侧返回提示 */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center h-48">
            <motion.div 
              animate={{ 
                x: swipeProgress > 0 && touchSide.current === 'right' ? -swipeProgress * 30 : [0, -4, 0], 
                opacity: swipeProgress > 0 && touchSide.current === 'right' ? 0.8 : [0.1, 0.4, 0.1]
              }}
              transition={swipeProgress > 0 ? { duration: 0 } : { duration: 2.5, right: 0, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="flex items-center mr-1 flex-row-reverse"
            >
              <div className={`w-[3px] h-12 rounded-full drop-shadow-md transition-colors duration-1000 ${
                theme === "midnight" ? "bg-sky-400" : "bg-[#1A1A1A]"
              }`}></div>
              {swipeProgress > 0 && touchSide.current === 'right' && (
                <div className={`p-1.5 rounded-full mr-3 drop-shadow-lg transition-colors duration-1000 ${
                  theme === "midnight" ? "bg-sky-400 text-slate-900" : "bg-[#1A1A1A] text-white"
                }`} style={{ scale: Math.min(1, 0.5 + swipeProgress) }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              )}
              {(!swipeProgress || touchSide.current !== 'right') && (
                <span className={`text-[8px] font-black tracking-[0.3em] mr-2 transition-colors duration-1000 ${
                  theme === "midnight" ? "text-sky-300 opacity-60" : "text-[#1A1A1A] opacity-60"
                }`} style={{ writingMode: "vertical-rl" }}>
                  滑动返回
                </span>
              )}
            </motion.div>
          </div>

          {/* 手动模拟调试控制栏 */}
          {isManualMode && (
            <div className={`absolute top-10 md:top-14 left-1/2 -translate-x-1/2 z-40 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-black px-5 py-3 rounded-full flex items-center gap-4 shadow-xl backdrop-blur-md border select-none transition-all duration-1000 ${
              theme === "midnight"
                ? "bg-[#090E20]/95 text-[#E0E7FF] border-[#38BDF8]/20"
                : "bg-[#1A1A1A]/95 text-[#F8F7F2] border-[#F8F7F2]/10"
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="opacity-80">手动调试</span>
              </div>
              <div className="h-3 w-px bg-[#F8F7F2]/20" />
              <button 
                onClick={() => {
                  // Simulate double blink quickly
                  setBlinkTrigger(prev => prev + 1);
                  try { audioService.playShatter(); } catch (e) {}
                }}
                className="hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-none active:scale-95"
                title="按下空格键亦可模拟眨眼"
              >
                [ 模拟眨眼 (空格键) ]
              </button>
              <div className="h-3 w-px bg-[#F8F7F2]/20" />
              <button 
                onClick={() => {
                  if (isDrowsy) {
                    handleAwake();
                  } else {
                    handleDrowsy();
                  }
                }}
                className="hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-none active:scale-95"
                title="按下回车键亦可模拟"
              >
                [ {isDrowsy ? "睁眼" : "闭眼2秒(回车键)"} ]
              </button>
            </div>
          )}

          {!isManualMode && (
            <CameraManager 
              onBlink={handleBlink} 
              onDrowsy={handleDrowsy} 
              onAwake={handleAwake} 
              onReady={() => setIsAiReady(true)}
              onError={(err) => setCameraError(err)}
            />
          )}

          {/* 品牌定位：左上角 */}
          <div className="absolute top-10 left-10 md:top-14 md:left-14 z-30 pointer-events-none">
            <h1 className={`font-serif text-2xl md:text-4xl italic tracking-tighter transition-colors duration-1000 opacity-80 ${
              theme === "midnight" ? "text-[#E2E8F0]" : "text-[#1A1A1A]"
            }`}>
              Aether
            </h1>
            <div className="flex items-center gap-2 mt-2 opacity-30">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-1000 ${
                isDrowsy 
                  ? "bg-amber-400 animate-pulse" 
                  : theme === "midnight" ? "bg-sky-400" : "bg-emerald-500"
              }`}></div>
              <span className={`text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black transition-colors duration-1000 ${
                theme === "midnight" ? "text-sky-300" : "text-[#1A1A1A]"
              }`}>
                {isDrowsy ? "Calm Protocol" : "Active Observation"}
              </span>
            </div>
          </div>

          {/* 实时数据：右上角 */}
          <div className="absolute top-10 right-16 md:top-14 md:right-20 z-30 text-right pointer-events-none">
            <span className={`text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black opacity-20 block mb-1 transition-colors duration-1000 ${
              theme === "midnight" ? "text-indigo-200" : "text-[#1A1A1A]"
            }`}>Clarity Cycles</span>
            <span className={`text-2xl md:text-5xl font-serif italic tracking-tighter transition-colors duration-1000 ${
              theme === "midnight" ? "text-indigo-400/40" : "text-[#1A1A1A]/30"
            }`}>{blinkTrigger}</span>
          </div>

          {/* 观察记录：左下角 */}
          <div className="absolute bottom-10 left-10 md:bottom-14 md:left-14 z-30 max-w-[160px] md:max-w-[240px] pointer-events-none">
            <span className={`text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black opacity-20 block mb-2 transition-colors duration-1000 ${
              theme === "midnight" ? "text-indigo-200" : "text-[#1A1A1A]"
            }`}>Observer Note</span>
            <p className={`text-[10px] md:text-[12px] font-serif italic leading-relaxed transition-colors duration-1000 ${
              theme === "midnight" ? "text-indigo-200/40" : "text-[#1A1A1A]/30"
            }`}>
              {isDrowsy 
                ? "Respiration and biological state being normalized." 
                : "Active processing based on ocular frequency."}
            </p>
          </div>

          {/* 模式信息：右下角 */}
          <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-30 text-right pointer-events-none">
            <span className={`text-[8px] md:text-[9px] uppercase tracking-[0.5em] font-black opacity-20 block mb-1 transition-colors duration-1000 ${
              theme === "midnight" ? "text-indigo-200" : "text-[#1A1A1A]"
            }`}>Status</span>
            <span className={`text-[10px] md:text-[12px] font-serif italic tracking-tight transition-colors duration-1000 ${
              theme === "midnight" ? "text-sky-400/40" : "text-opacity-30 text-[#1A1A1A]"
            }`}>
              {isDrowsy ? "Resting" : "Sensing"}
            </span>
          </div>

          <main className="flex-1 relative flex w-full h-full overflow-hidden">
            {!isAiReady && !cameraError && (
              <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-1000 ${
                theme === "midnight" ? "bg-[#090E20]" : "bg-[#F3F2EC]"
              }`}>
                <div className={`w-10 h-10 border-2 rounded-full animate-spin mb-8 ${
                  theme === "midnight" 
                    ? "border-sky-500/20 border-t-sky-400" 
                    : "border-[#1A1A1A]/20 border-t-[#1A1A1A]/80"
                }`}></div>
                <p className={`font-serif italic text-xl transition-colors duration-1000 ${
                  theme === "midnight" ? "text-sky-100" : "text-[#1A1A1A]/80"
                }`}>正在唤醒模型...</p>
                <p className={`text-[10px] uppercase tracking-[0.2em] font-black opacity-40 mt-4 text-center max-w-xs leading-relaxed transition-colors duration-1000 ${
                  theme === "midnight" ? "text-sky-200" : "text-[#1A1A1A]"
                }`}>
                  初始化光学传感器<br/>这可能需要几秒钟
                </p>
              </div>
            )}
            
            {cameraError && (
              <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center px-8 text-center transition-colors duration-1000 ${
                theme === "midnight" ? "bg-[#090E20]" : "bg-[#F3F2EC]"
              }`}>
                <p className={`font-serif italic text-xl mb-4 transition-colors duration-1000 ${
                  theme === "midnight" ? "text-sky-100" : "text-[#1A1A1A]/80"
                }`}>传感器初始化失败</p>
                <p className={`text-[10px] tracking-[0.1em] font-bold opacity-60 mb-8 max-w-md whitespace-pre-wrap text-left p-5 rounded-lg leading-relaxed transition-all duration-1000 ${
                  theme === "midnight" 
                    ? "bg-slate-900/60 text-sky-200 border border-sky-950" 
                    : "bg-[#1A1A1A]/5 text-[#1A1A1A]"
                }`}>{cameraError}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className={`w-full sm:w-auto px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-black transition-colors ${
                      theme === "midnight" 
                        ? "bg-blue-900/40 text-sky-300 hover:bg-blue-900/60" 
                        : "bg-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/10"
                    }`}
                  >
                    重 新 加 载 页 面
                  </button>
                  <a 
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-black transition-all shadow-sm cursor-pointer ${
                      theme === "midnight" 
                        ? "bg-sky-400 text-slate-950 hover:bg-sky-300" 
                        : "bg-[#1A1A1A]"
                    }`}
                  >
                    在 新 标 签 页 中 打 开 (推荐)
                  </a>
                  <button 
                    onClick={enterManualMode}
                    className="w-full sm:w-auto px-8 py-3 bg-amber-500 text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:bg-amber-600 transition-all shadow-md cursor-pointer"
                  >
                    进入键盘调试模式 (无需相机) 🚀
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {isDrowsy ? (
                <CalmMode key="calm" quoteIndex={currentIndex} theme={theme} />
              ) : (
                <ActiveMode 
                  key="active" 
                  blinkTrigger={blinkTrigger} 
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  isClarified={isClarified}
                  setIsClarified={setIsClarified}
                  savedIndices={savedIndices}
                  setSavedIndices={setSavedIndices}
                  theme={theme}
                />
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
}
