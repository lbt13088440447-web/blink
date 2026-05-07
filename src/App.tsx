import { useState, useCallback } from "react";
import { CameraManager } from "./components/CameraManager";
import { ActiveMode } from "./components/ActiveMode";
import { CalmMode } from "./components/CalmMode";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [blinkTrigger, setBlinkTrigger] = useState(0);

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
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F3F2EC]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-center space-y-8"
          >
            <h1 className="text-5xl font-serif italic tracking-tight text-[#1A1A1A]">正念眨眼</h1>
            <p className="text-sm font-serif italic opacity-60 leading-relaxed text-[#1A1A1A]">
              此体验使用您的网络摄像头在您眨眼时帮助您理清思绪。
              <br/><br/>
              闭上眼睛超过2秒系统将过渡到平静的休息状态。
            </p>
            <button 
              onClick={() => setHasStarted(true)}
              className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-black transition-colors"
            >
              允许使用相机并开始
            </button>
          </motion.div>
        </div>
      ) : (
        <>
          <CameraManager 
            onBlink={handleBlink} 
            onDrowsy={handleDrowsy} 
            onAwake={handleAwake} 
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
            <AnimatePresence mode="wait">
              {isDrowsy ? (
                <CalmMode key="calm" />
              ) : (
                <ActiveMode key="active" blinkTrigger={blinkTrigger} />
              )}
            </AnimatePresence>
          </main>
        </>
      )}
    </div>
  );
}
