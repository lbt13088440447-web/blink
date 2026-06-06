import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audioService } from "../lib/audio";
import { THOUGHTS } from "../data";

interface CalmModeProps {
  key?: any;
  quoteIndex: number;
  theme?: 'cream' | 'midnight';
}

const BREATH_PHASES = [
  { text: "慢慢吸气...", sub: "将智言引入心海" },
  { text: "静静屏息...", sub: "让力量在深处积蓄" },
  { text: "缓缓呼气...", sub: "呼出所有的杂念与压力" },
  { text: "默念此句...", sub: "字句生辉，融于行止" }
];

export function CalmMode({ quoteIndex, theme = 'cream' }: CalmModeProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const thought = THOUGHTS[quoteIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % BREATH_PHASES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Start deep calming hum as they sink into darkness (close eyes)
    audioService.startCalmDrone();
    return () => {
      // Fade out slowly upon waking up
      audioService.stopCalmDrone();
    };
  }, []);

  const isMidnight = theme === 'midnight';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.8 }}
      className={`flex-1 w-full h-full relative flex flex-col items-center justify-between p-10 md:p-16 overflow-hidden transition-colors duration-1000 ${
        isMidnight ? "bg-[#02050f]" : "bg-[#121210]"
      }`}
    >
      {/* Dynamic breathing background pulse */}
      <motion.div 
        animate={{ 
          scale: [1, 1.25, 1], 
          opacity: [0.15, 0.35, 0.15] 
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors duration-1000 ${
          isMidnight ? "bg-sky-500/5" : "bg-amber-500/5"
        }`}
      />

      {/* Top indicator */}
      <div className="z-10 text-center mt-4">
        <span className={`text-[10px] md:text-xs font-serif tracking-[0.6em] uppercase block mb-1 transition-colors duration-1000 ${
          isMidnight ? "text-sky-200/30" : "text-amber-100/30"
        }`}>
          Inward Contemplation
        </span>
        <div className={`text-[12px] md:text-sm font-serif tracking-widest italic transition-colors duration-1000 ${
          isMidnight ? "text-sky-300/50" : "text-amber-200/50"
        }`}>
          — 铭记于心 · 意念合一 —
        </div>
      </div>

      {/* Core quote display with dynamic warm glow */}
      <div className="relative z-10 text-center max-w-3xl px-6 my-auto flex flex-col items-center gap-10">
        <motion.div
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.5, duration: 2.5 }}
          className="flex flex-col items-center"
        >
          {/* Engraving Visual Glow Effect container */}
          <div className={`relative group p-8 rounded-2xl transition-all duration-1000 border ${
            isMidnight 
              ? "bg-sky-500/[0.01] border-sky-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]" 
              : "bg-amber-500/[0.01] border-amber-500/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
          }`}>
            <div className={`absolute -inset-0.5 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-1000 ${
              isMidnight ? "bg-sky-500/10" : "bg-amber-500/5"
            }`}></div>
            
            <p className="relative text-2xl md:text-4xl font-serif text-[#F8F7F2] leading-relaxed tracking-wide text-shadow-md">
              “ {thought?.clear || "于此静心"} ”
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.8, duration: 2 }}
            className={`mt-6 flex items-center gap-3 text-[10px] uppercase tracking-widest transition-colors duration-1000 ${
              isMidnight ? "text-sky-300" : "text-amber-200"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-1000 ${
              isMidnight ? "bg-sky-400" : "bg-amber-500"
            }`}></div>
            已归于心海收藏夹
          </motion.div>
        </motion.div>

        {/* Breathing directive loop */}
        <div className="min-h-[5rem] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="text-center"
            >
              <h3 className={`text-lg md:text-xl font-serif italic tracking-wide transition-colors duration-1000 ${
                isMidnight ? "text-sky-100/70" : "text-amber-100/70"
              }`}>
                {BREATH_PHASES[phaseIndex].text}
              </h3>
              <p className={`text-[10px] uppercase tracking-[0.2em] font-black mt-2 font-sans transition-colors duration-1000 ${
                isMidnight ? "text-sky-100/30" : "text-amber-100/30"
              }`}>
                {BREATH_PHASES[phaseIndex].sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Wake Instruction */}
      <div className="z-10 text-center mb-4 space-y-3">
        <div className={`w-12 h-[1px] mx-auto transition-colors duration-1000 ${
          isMidnight ? "bg-sky-500/15" : "bg-amber-500/15"
        }`} />
        <p className={`text-[9px] uppercase tracking-[0.4em] font-bold transition-colors duration-1000 ${
          isMidnight ? "text-sky-200/40" : "text-amber-100/40"
        }`}>
          Open eyes to return / 睁开双眼以回归理性
        </p>
      </div>
    </motion.div>
  );
}
