import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const CALM_MESSAGES = [
  "慢慢吸气...",
  "屏住呼吸...",
  "轻轻呼气...",
  "让思绪沉淀...",
  "闭眼休息...",
];

export function CalmMode() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % CALM_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
      className="flex-1 w-full h-full relative bg-[#1A1A1A] flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden"
    >
      <div className="relative z-10 text-center text-[#F8F7F2] max-w-2xl px-6">
        <AnimatePresence mode="wait">
          <motion.h2
            key={messageIndex}
            initial={{ opacity: 0, filter: "blur(12px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(12px)", scale: 1.05 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-7xl font-serif italic tracking-tighter leading-tight"
          >
            {CALM_MESSAGES[messageIndex]}
          </motion.h2>
        </AnimatePresence>
        
        <div className="mt-24 space-y-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "60px" }}
            transition={{ delay: 1, duration: 2 }}
            className="h-px bg-white/20 mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
            className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold"
          >
            Wake when ready / 睁眼以回归
          </motion.p>
        </div>
      </div>

      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] rounded-full bg-emerald-900/10 blur-[100px] pointer-events-none"
      />
    </motion.div>
  );
}
