import { useState, useCallback, useRef } from "react";
import { CameraManager } from "./components/CameraManager";
import { ActiveMode } from "./components/ActiveMode";
import { CalmMode } from "./components/CalmMode";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [blinkTrigger, setBlinkTrigger] = useState(0);
  const [isAiReady, setIsAiReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const touchSide = useRef<'left' | 'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    // Detect swipes starting near the left edge (< 60px) or right edge (> window.innerWidth - 60px)
    if (clientX < 60) {
      touchStartX.current = clientX;
      touchCurrentX.current = clientX;
      touchSide.current = 'left';
      setSwipeProgress(0);
    } else if (clientX > window.innerWidth - 60) {
      touchStartX.current = clientX;
      touchCurrentX.current = clientX;
      touchSide.current = 'right';
      setSwipeProgress(0);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null || touchSide.current === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchCurrentX.current = clientX;
    
    if (touchSide.current === 'left') {
      const diff = clientX - touchStartX.current;
      if (diff > 0) setSwipeProgress(Math.min(diff / 100, 1));
    } else {
      const diff = touchStartX.current - clientX;
      if (diff > 0) setSwipeProgress(Math.min(diff / 100, 1));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current !== null && touchCurrentX.current !== null && touchSide.current !== null) {
      const diff = touchSide.current === 'left' 
        ? touchCurrentX.current - touchStartX.current
        : touchStartX.current - touchCurrentX.current;
      if (diff > 60) {
        setHasStarted(false);
      }
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
    touchSide.current = null;
    setSwipeProgress(0);
  }, []);

  const handleBlink = useCallback(() => {
    // Only trigger blinks if we are awake
    if (!isDrowsy) {
      setBlinkTrigger(prev => prev + 1);
    }
  }, [isDrowsy]);

  const handleDrowsy = useCallback(() => {
    setIsDrowsy(true);
  }, []);

  const handleAwake = useCallback(() => {
    setIsDrowsy(false);
  }, []);

  return (
    <div className="w-full h-screen bg-[#F8F7F2] text-[#1A1A1A] font-sans flex flex-col overflow-hidden select-none">
      {!hasStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#EAE8E3] relative overflow-hidden group">
          {/* CAFA-inspired dynamic fluid background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
             <motion.div 
               animate={{ 
                 x: ['-20%', '20%', '-20%'], 
                 y: ['-10%', '10%', '-10%'], 
                 rotate: [0, 10, -10, 0] 
               }} 
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-[#1A1A1A]/40 to-transparent blur-[120px]" 
             />
             <motion.div 
               animate={{ 
                 x: ['20%', '-20%', '20%'], 
                 y: ['10%', '-10%', '10%'],
                 scale: [1, 1.2, 1] 
               }} 
               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
               className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-[#4A4A4A]/30 to-transparent blur-[100px]" 
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
              <div className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black text-[#1A1A1A]/50 font-sans">
                Aether Project <br />
                Vision & Reality
              </div>
              <div className="text-right text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]/50 font-sans">
                2026. / Central <br />
                Mindfulness
              </div>
            </div>

            {/* Kinetic Typography Centerpiece */}
            <div className="text-center relative my-auto py-20 flex flex-col items-center">
              <div className="relative w-full max-w-4xl mx-auto flex justify-center">
                <motion.h1 
                  className="text-[22vw] md:text-[16vw] leading-[0.7] tracking-tighter text-[#1A1A1A] font-serif uppercase relative z-10"
                >
                  AETHER
                </motion.h1>
                <h1 className="text-[22vw] md:text-[16vw] leading-[0.7] tracking-tighter text-transparent font-serif uppercase absolute top-2 md:top-4 left-[2%] md:left-[4%] w-full z-0 opacity-30 select-none" style={{ WebkitTextStroke: '2px #1A1A1A' }}>
                  AETHER
                </h1>
              </div>
              <div className="mt-12 md:mt-16 flex flex-col items-center gap-6">
                <span className="font-serif italic text-4xl md:text-6xl text-[#1A1A1A]">历 历 在 目</span>
                <span className="text-[9px] md:text-[11px] uppercase tracking-[0.6em] font-black text-[#1A1A1A]/50 block text-center max-w-md mix-blend-color-burn">
                  Ocular Interaction System // 空间与念头的感知边界
                </span>
              </div>
            </div>

            {/* Bottom info and interaction */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-10 mt-auto">
              <div className="text-center md:text-left flex flex-col gap-2 relative">
                <div className="hidden md:block w-8 h-[1px] bg-[#1A1A1A]/30 absolute -top-4 left-0"></div>
                <p className="text-[11px] md:text-xs font-serif italic text-[#1A1A1A]/80 max-w-[280px] leading-relaxed">
                  The interface reacts to your ocular frequency. 
                  <br/><br/>
                  <span className="opacity-70">此体验捕获您的眼部特征，眨眼以过滤环境噪音；闭合长于两秒，坠入平静。</span>
                </p>
              </div>

              <button 
                onClick={() => setHasStarted(true)}
                className="group relative px-12 py-5 bg-[#1A1A1A] text-[#F8F7F2] overflow-hidden rounded-none transition-transform active:scale-[0.98]"
              >
                <div className="absolute inset-0 w-full h-full bg-[#333] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]"></div>
                <span className="relative z-10 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black whitespace-nowrap">
                  [ 唤醒感知 / Initialize ]
                </span>
              </button>
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
          {/* 左侧返回提示 */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center h-48">
            <motion.div 
              animate={{ 
                x: swipeProgress > 0 && touchSide.current === 'left' ? swipeProgress * 30 : [0, 4, 0], 
                opacity: swipeProgress > 0 && touchSide.current === 'left' ? 0.8 : (touchSide.current === 'right' ? 0 : [0.1, 0.4, 0.1])
              }}
              transition={swipeProgress > 0 ? { duration: 0 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center ml-1"
            >
              <div className="w-[3px] h-12 bg-[#1A1A1A] rounded-full drop-shadow-md"></div>
              {swipeProgress > 0 && touchSide.current === 'left' && (
                <div className="bg-[#1A1A1A] text-white p-1.5 rounded-full ml-3 drop-shadow-lg" style={{ scale: Math.min(1, 0.5 + swipeProgress) }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </div>
              )}
              {(!swipeProgress || touchSide.current !== 'left') && (
                <span className="text-[8px] font-black tracking-[0.3em] text-[#1A1A1A] ml-2 opacity-60" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  滑动返回
                </span>
              )}
            </motion.div>
          </div>

          {/* 右侧返回提示 */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center h-48">
            <motion.div 
              animate={{ 
                x: swipeProgress > 0 && touchSide.current === 'right' ? -swipeProgress * 30 : [0, -4, 0], 
                opacity: swipeProgress > 0 && touchSide.current === 'right' ? 0.8 : (touchSide.current === 'left' ? 0 : [0.1, 0.4, 0.1])
              }}
              transition={swipeProgress > 0 ? { duration: 0 } : { duration: 2.5, right: 0, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="flex items-center mr-1 flex-row-reverse"
            >
              <div className="w-[3px] h-12 bg-[#1A1A1A] rounded-full drop-shadow-md"></div>
              {swipeProgress > 0 && touchSide.current === 'right' && (
                <div className="bg-[#1A1A1A] text-white p-1.5 rounded-full mr-3 drop-shadow-lg" style={{ scale: Math.min(1, 0.5 + swipeProgress) }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              )}
              {(!swipeProgress || touchSide.current !== 'right') && (
                <span className="text-[8px] font-black tracking-[0.3em] text-[#1A1A1A] mr-2 opacity-60" style={{ writingMode: "vertical-rl" }}>
                  滑动返回
                </span>
              )}
            </motion.div>
          </div>

          <CameraManager 
            onBlink={handleBlink} 
            onDrowsy={handleDrowsy} 
            onAwake={handleAwake} 
            onReady={() => setIsAiReady(true)}
            onError={(err) => setCameraError(err)}
          />

          {/* 品牌定位：左上角 */}
          <div className="absolute top-10 left-10 md:top-14 md:left-14 z-30 pointer-events-none">
            <h1 className="font-serif text-2xl md:text-4xl italic tracking-tighter text-[#1A1A1A] opacity-80">
              Aether
            </h1>
            <div className="flex items-center gap-2 mt-2 opacity-20">
              <div className={`w-1.5 h-1.5 rounded-full ${isDrowsy ? "bg-amber-400" : "bg-emerald-500"}`}></div>
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black">{isDrowsy ? "Calm Protocol" : "Active Observation"}</span>
            </div>
          </div>

          {/* 实时数据：右上角 */}
          <div className="absolute top-10 right-10 md:top-14 md:right-14 z-30 text-right pointer-events-none">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black opacity-20 block mb-1">Clarity Cycles</span>
            <span className="text-2xl md:text-5xl font-serif italic text-[#1A1A1A]/30 tracking-tighter">{blinkTrigger}</span>
          </div>

          {/* 观察记录：左下角 */}
          <div className="absolute bottom-10 left-10 md:bottom-14 md:left-14 z-30 max-w-[160px] md:max-w-[240px] pointer-events-none">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black opacity-10 block mb-2">Observer Note</span>
            <p className="text-[10px] md:text-[12px] font-serif italic text-[#1A1A1A]/30 leading-relaxed">
              {isDrowsy 
                ? "Respiration and biological state being normalized." 
                : "Active processing based on ocular frequency."}
            </p>
          </div>

          {/* 模式信息：右下角 */}
          <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-30 text-right pointer-events-none">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.5em] font-black opacity-10 block mb-1">Status</span>
            <span className="text-[10px] md:text-[12px] font-serif italic opacity-30 tracking-tight">
              {isDrowsy ? "Resting" : "Sensing"}
            </span>
          </div>

          <main className="flex-1 relative flex w-full h-full overflow-hidden">
            {!isAiReady && !cameraError && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F3F2EC]">
                <div className="w-10 h-10 border-2 border-[#1A1A1A]/20 border-t-[#1A1A1A]/80 rounded-full animate-spin mb-8"></div>
                <p className="font-serif italic text-xl text-[#1A1A1A]/80">正在唤醒模型...</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40 mt-4 text-center max-w-xs leading-relaxed">
                  初始化光学传感器<br/>这可能需要几秒钟
                </p>
              </div>
            )}
            
            {cameraError && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F3F2EC] px-8 text-center">
                <p className="font-serif italic text-xl text-[#1A1A1A]/80 mb-4">传感器初始化失败</p>
                <p className="text-[10px] tracking-[0.1em] font-bold opacity-60 mb-8 max-w-sm whitespace-pre-wrap text-left bg-black/5 p-4 rounded-md">{cameraError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-black transition-colors"
                >
                  重 新 加 载 体验
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {isDrowsy ? (
                <CalmMode key="calm" />
              ) : (
                <ActiveMode key="active" blinkTrigger={blinkTrigger} />
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
}
