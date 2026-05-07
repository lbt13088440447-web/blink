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
          <header className="w-full h-24 border-b border-[#1A1A1A]/10 px-8 md:px-12 flex flex-shrink-0 items-center justify-between bg-[#F8F7F2]">
            <div className="flex items-center gap-16">
              <h1 className="font-serif text-4xl italic tracking-tighter group cursor-default">
                Aether <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-black not-italic opacity-20 ml-2">Mindfulness</span>
              </h1>
              <nav className="hidden lg:flex gap-10 text-[9px] uppercase tracking-[0.5em] font-black opacity-30">
                <a href="#" className="hover:opacity-100 transition-opacity">Journal</a>
                <a href="#" className="hover:opacity-100 transition-opacity">Insights</a>
                <a href="#" className="hover:opacity-100 transition-opacity">Archive</a>
              </nav>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-[0.4em] font-black opacity-20 mb-1">Status Report</span>
                <span className="text-sm font-serif italic text-[#1A1A1A]/80">{isDrowsy ? "Calm Protocol Active" : "Awake & Observing"}</span>
              </div>
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${isDrowsy ? "bg-amber-400" : "bg-emerald-500"}`}></div>
                <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${isDrowsy ? "bg-amber-400" : "bg-emerald-500"} opacity-20`}></div>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            <aside className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-[#1A1A1A]/10 p-10 flex flex-col gap-14 bg-[#F8F7F2] overflow-y-auto hidden sm:flex">
              <section>
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[9px] uppercase tracking-[0.5em] font-black opacity-30">Biometrics</span>
                  <span className="text-[9px] font-serif italic opacity-40">Live Feed</span>
                </div>
                <CameraManager 
                  onBlink={handleBlink} 
                  onDrowsy={handleDrowsy} 
                  onAwake={handleAwake} 
                />
              </section>

              <section className="flex flex-col gap-10">
                <div>
                  <h3 className="text-[9px] uppercase tracking-[0.5em] font-black opacity-30 mb-3">Clarity Cycles</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-serif tracking-tighter">{blinkTrigger}</p>
                    <span className="text-xs font-serif italic text-[#1A1A1A]/30">Completed</span>
                  </div>
                  <div className="w-full h-px bg-[#1A1A1A]/5 mt-6"></div>
                </div>

                <div className="p-6 border border-[#1A1A1A]/10 rounded-sm">
                  <h4 className="text-[9px] uppercase tracking-[0.3em] font-black opacity-40 mb-4 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#1A1A1A]/40"></span>
                    Observer Note
                  </h4>
                  <p className="text-[12px] leading-relaxed font-serif italic text-[#1A1A1A]/60">
                    {isDrowsy 
                      ? "System has transitioned. Please allow the physiological state to normalize before return."
                      : "The interface reacts to ocular frequency. Focus on the words, then blink to process."}
                  </p>
                </div>
              </section>
            </aside>

            <div className="flex-1 overflow-hidden relative flex">
              <AnimatePresence mode="wait">
                {isDrowsy ? (
                  <CalmMode key="calm" />
                ) : (
                  <ActiveMode key="active" blinkTrigger={blinkTrigger} />
                )}
              </AnimatePresence>
            </div>
          </main>

          <footer className="h-16 border-t border-[#1A1A1A]/10 px-8 md:px-12 flex flex-shrink-0 items-center justify-between bg-[#F8F7F2]">
            <div className="flex gap-12 text-[10px] uppercase tracking-widest opacity-60 font-bold">
              <span>会话进行中</span>
              <span className="hidden sm:inline">模式: 正念</span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
