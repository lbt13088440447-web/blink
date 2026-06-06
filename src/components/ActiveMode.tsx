import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { audioService } from "../lib/audio";
import { THOUGHTS } from "../data";
import { Heart, X, Trash2, Sparkles } from "lucide-react";

interface ActiveModeProps {
  key?: any;
  blinkTrigger: number;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  isClarified: boolean;
  setIsClarified: React.Dispatch<React.SetStateAction<boolean>>;
  savedIndices: number[];
  setSavedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  theme?: 'cream' | 'midnight';
}

export function ActiveMode({ 
  blinkTrigger, 
  currentIndex, 
  setCurrentIndex, 
  isClarified, 
  setIsClarified, 
  savedIndices, 
  setSavedIndices,
  theme = 'cream'
}: ActiveModeProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const lastBlinkTriggerRef = useRef(blinkTrigger);

  useEffect(() => {
    if (blinkTrigger !== lastBlinkTriggerRef.current) {
      lastBlinkTriggerRef.current = blinkTrigger;

      if (blinkTrigger > 0) {
        setIsClarified((prevClarified) => {
          if (!prevClarified) {
            audioService.playShatter();
            confetti({
              particleCount: 20,
              spread: 40,
              colors: ['#1A1A1A', '#555555', '#DDDDDD'],
              origin: { y: 0.6 },
              disableForReducedMotion: true
            });
            return true;
          } else {
            audioService.playShatter();
            setCurrentIndex((prev) => {
              let next = Math.floor(Math.random() * THOUGHTS.length);
              while (next === prev) {
                next = Math.floor(Math.random() * THOUGHTS.length);
              }
              return next;
            });
            return false;
          }
        });
      }
    }
  }, [blinkTrigger, setCurrentIndex, setIsClarified]);

  const removeSaved = (idxToRemove: number) => {
    setSavedIndices((prev) => {
      const next = prev.filter(i => i !== idxToRemove);
      try {
        localStorage.setItem("aether_saved_thoughts", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const currentThought = THOUGHTS[currentIndex];

  return (
    <section className={`flex-1 relative flex flex-col items-center justify-center p-8 md:p-16 h-full w-full overflow-hidden transition-colors duration-1000 ${
      theme === "midnight" ? "bg-[#060C1B]" : "bg-[#F3F2EC]"
    }`}>
      <div className="max-w-3xl w-full flex flex-col items-center justify-center">
        {/* 背景大标题：更淡的配色，作为背景节奏 */}
        <h2 className={`text-6xl md:text-[10rem] font-serif mb-12 leading-[0.8] tracking-tighter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none transition-colors duration-1000 ${
          theme === "midnight" ? "text-blue-500/5 animate-pulse" : "text-[#1A1A1A]/5"
        }`}>
          Aether <br/>
          <span className="italic pl-12 md:pl-24 block">Ambient</span>
        </h2>

        {/* 核心交互区 */}
        <div className="relative min-h-[22rem] w-full flex items-center justify-center z-10">
          <AnimatePresence mode="wait">
            {!isClarified ? (
              <motion.div
                key={`unclear-${currentIndex}`}
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl text-center"
              >
                <div className="mb-6 flex justify-center">
                   <div className={`w-px h-12 transition-colors duration-1000 ${
                     theme === "midnight" ? "bg-blue-300/15" : "bg-[#1A1A1A]/10"
                   }`}></div>
                </div>
                <h1 className={`text-3xl md:text-5xl font-serif italic leading-normal px-4 transition-colors duration-1000 ${
                  theme === "midnight" ? "text-blue-100" : "text-[#1A1A1A]"
                }`}>
                  “{currentThought?.unclear}”
                </h1>
                <div className="mt-10">
                  <p className={`animate-pulse text-[9px] uppercase tracking-[0.4em] font-black transition-colors duration-1000 ${
                    theme === "midnight" ? "text-cyan-400/50" : "text-[#1A1A1A]/40"
                  }`}>
                    Double Blink to Clarify / 快速眨眼两次以澄清
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`clear-${currentIndex}`}
                initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl text-center"
              >
                <h1 className={`text-3xl md:text-5xl font-serif leading-normal px-4 transition-colors duration-1000 ${
                  theme === "midnight" ? "text-[#F8F7F2]" : "text-[#1A1A1A]"
                }`}>
                  “{currentThought?.clear}”
                </h1>
                <div className="mt-10 flex flex-col items-center">
                  <div className={`w-8 h-px mb-4 transition-colors duration-1000 ${
                    theme === "midnight" ? "bg-cyan-500/45" : "bg-emerald-500/40"
                  }`}></div>
                  <p className={`animate-pulse text-[9px] uppercase tracking-[0.4em] font-black transition-colors duration-1000 ${
                    theme === "midnight" ? "text-[#38BDF8]" : "text-emerald-600/60"
                  }`}>
                    Double Blink to Release / 快速眨眼两次以释放
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle Favorites Drawer (Circular Button under the Theme Switch) */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={`fixed top-20 right-4 md:top-[6.25rem] md:right-6 z-50 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all duration-500 shadow-xl border ${
          theme === "midnight"
            ? "bg-[#0B1528]/95 border-[#38BDF8]/25 text-rose-300/65 hover:text-rose-200/90 hover:scale-105 hover:bg-[#0E1B35] shadow-[0_0_20px_rgba(244,63,94,0.08)]"
            : "bg-white/95 border-[#1A1A1A]/10 text-rose-400/80 hover:bg-white hover:scale-105 shadow-[0_4px_15px_rgba(0,0,0,0.04)]"
        } active:scale-95`}
        title={`名句收藏夹 (${savedIndices.length})`}
      >
        <div className="relative">
          <Heart 
            className={`w-4 h-4 transition-all duration-300 ${
              savedIndices.length > 0 
                ? theme === "midnight"
                  ? 'fill-rose-400/35 text-rose-400/60 scale-105' 
                  : 'fill-rose-300/70 text-rose-400/80 scale-105'
                : 'text-current fill-none scale-100'
            }`} 
          />
          {savedIndices.length > 0 && (
            <span className={`absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 text-white text-[7.5px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse ${
              theme === "midnight" ? "bg-rose-400/50" : "bg-rose-300/85 text-rose-900"
            }`}>
              {savedIndices.length}
            </span>
          )}
        </div>
      </button>

      {/* Favorites Drawer Panel */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-end"
            onClick={() => setIsDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className={`w-full max-w-md h-full shadow-2xl flex flex-col p-8 md:p-10 transition-colors duration-1000 ${
                theme === "midnight" 
                  ? "bg-[#090E20]/95 text-slate-100 border-l border-blue-950/40" 
                  : "bg-[#EAE8E3] text-[#1A1A1A]"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex justify-between items-center mb-8 border-b pb-4 transition-colors duration-1000 ${
                theme === "midnight" ? "border-blue-950/60" : "border-[#1A1A1A]/10"
              }`}>
                <div>
                  <h3 className="font-serif text-xl italic tracking-tight font-black">
                    心海 · 智言收藏
                  </h3>
                  <p className={`text-[9px] uppercase tracking-widest font-sans mt-1 transition-colors duration-1000 ${
                    theme === "midnight" ? "text-indigo-300" : "text-[#1A1A1A]/50"
                  }`}>
                    INWARD REPOSITORY ({savedIndices.length})
                  </p>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className={`p-2 transition-colors cursor-pointer rounded-full ${
                    theme === "midnight" ? "hover:bg-blue-900/40 text-blue-300" : "hover:bg-[#1A1A1A]/5 text-[#1A1A1A]"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Saved Quotes List */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-2 -mr-2 select-text scrollbar-thin">
                {savedIndices.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-20 px-4 animate-fade-in">
                    <Heart className={`w-8 h-8 mb-4 stroke-[1.5] ${
                      theme === "midnight" ? "text-indigo-400/40" : "text-[#1A1A1A]/20"
                    }`} />
                    <p className="font-serif italic text-base">心海空明，尚无铭刻</p>
                    <p className="text-[10px] leading-relaxed max-w-xs mt-3 opacity-75">
                      提示：当看到引起共鸣的句子时（例如澄清后的智言），只需闭合双眼长于两秒（进入平静模式），即可将其自动收藏、铭记于胸中。
                    </p>
                  </div>
                ) : (
                  savedIndices.map((idx) => {
                    const thought = THOUGHTS[idx];
                    if (!thought) return null;
                    return (
                      <div 
                        key={idx}
                        className={`group relative p-5 border transition-all flex flex-col gap-3 rounded-none ${
                          theme === "midnight" 
                            ? "bg-[#0F172A] border-blue-950 hover:border-sky-500/30 text-slate-100" 
                            : "bg-[#F3F2EC] border-[#1A1A1A]/5 hover:border-[#1A1A1A]/15 text-[#1A1A1A]"
                        }`}
                      >
                        <p className="font-serif text-[15px] leading-relaxed text-left">
                          “{thought.clear}”
                        </p>
                        
                        <div className={`flex justify-between items-center mt-2 border-t pt-3 transition-colors duration-1000 ${
                          theme === "midnight" ? "border-blue-950" : "border-[#1A1A1A]/5"
                        }`}>
                          <button
                            onClick={() => {
                              setCurrentIndex(idx);
                              setIsClarified(true);
                              setIsDrawerOpen(false);
                            }}
                            className={`text-[9px] uppercase tracking-widest font-black transition-colors flex items-center gap-1.5 cursor-pointer ${
                              theme === "midnight" ? "text-sky-450 hover:text-sky-300" : "text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            当前默默体悟
                          </button>
                          
                          <button
                            onClick={() => removeSaved(idx)}
                            className={`transition-colors cursor-pointer p-1 rounded ${
                              theme === "midnight" ? "text-slate-500 hover:text-rose-450" : "text-[#1A1A1A]/30 hover:text-red-600"
                            }`}
                            title="从收藏移除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={`mt-8 pt-4 border-t text-center text-[9px] uppercase tracking-[0.2em] opacity-40 leading-relaxed font-black transition-colors duration-1000 ${
                theme === "midnight" ? "border-blue-950 text-indigo-400" : "border-[#1A1A1A]/10 text-[#1A1A1A]"
              }`}>
                闭阖双眸，涤荡尘埃<br/>
                将智者高论化作今日行动之锚
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
