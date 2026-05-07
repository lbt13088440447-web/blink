import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

const THOUGHTS = [
  { unclear: "我有很多事情要做，我永远做不完。", clear: "我将专注于一次只做一件小事。" },
  { unclear: "我做不好这件事。", clear: "我每天都在学习和成长。" },
  { unclear: "其他人都已经想明白了。", clear: "每个人都在自己独特的旅程中。" },
  { unclear: "我在浪费时间。", clear: "休息和反思也是富有成效的。" },
  { unclear: "如果我失败了怎么办？", clear: "失败只是帮助我改进的信息。" },
  { unclear: "我现在本应该走得更远。", clear: "我正好在我现在处在的位置。" },
  { unclear: "一切都让人不知所措。", clear: "我可以吸入平静，呼出紧张。" }
];

interface ActiveModeProps {
  blinkTrigger: number;
  key?: string;
}

export function ActiveMode({ blinkTrigger }: ActiveModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClarified, setIsClarified] = useState(false);

  useEffect(() => {
    if (blinkTrigger > 0) {
      if (!isClarified) {
        setIsClarified(true);
        confetti({
          particleCount: 20,
          spread: 40,
          colors: ['#1A1A1A', '#555555', '#DDDDDD'],
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      } else {
        setIsClarified(false);
        setCurrentIndex((prev) => (prev + 1) % THOUGHTS.length);
      }
    }
  }, [blinkTrigger]);

  const currentThought = THOUGHTS[currentIndex];

  return (
    <section className="flex-1 relative bg-[#F3F2EC] flex flex-col items-center justify-center p-8 md:p-16 h-full w-full overflow-hidden">
      {/* 顶部元数据：极小字号 + 宽间距 */}
      <div className="absolute top-12 left-12 flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-[#1A1A1A]/30">Location</span>
        <span className="text-[11px] font-serif italic text-[#1A1A1A]/60">The Clearing / 清空区</span>
      </div>

      <div className="max-w-3xl w-full flex flex-col items-center">
        {/* 主标题：大字号 + 紧凑字间距 */}
        <h2 className="text-5xl md:text-8xl font-serif mb-20 leading-[0.9] tracking-tighter text-[#1A1A1A]">
          Filter your <br/>
          <span className="italic pl-12 md:pl-24 block mt-2">ambient <span className="font-sans font-extralight opacity-20 NOT-italic tracking-normal text-4xl ml-4">noise</span></span>
        </h2>

        {/* 核心交互区：深思熟虑的留白 */}
        <div className="relative min-h-[22rem] w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isClarified ? (
              <motion.div
                key={`unclear-${currentIndex}`}
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl"
              >
                <div className="mb-6 flex justify-center">
                   <div className="w-px h-12 bg-[#1A1A1A]/10"></div>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif italic text-[#1A1A1A] leading-normal px-4">
                  “{currentThought.unclear}”
                </h1>
                <div className="mt-10">
                  <p className="text-[#1A1A1A]/40 animate-pulse text-[9px] uppercase tracking-[0.4em] font-black">
                    Blink to Clarify / 眨眼以澄清
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
                className="max-w-xl"
              >
                <h1 className="text-3xl md:text-5xl font-serif text-[#1A1A1A] leading-normal px-4">
                  “{currentThought.clear}”
                </h1>
                <div className="mt-10 flex flex-col items-center">
                  <div className="w-8 h-px bg-emerald-500/40 mb-4"></div>
                  <p className="text-emerald-600/60 animate-pulse text-[9px] uppercase tracking-[0.4em] font-black">
                    Blink to Release / 眨眼以释放
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部引导：古典排版风格 */}
        <div className="mt-16 w-full max-w-sm border-t border-[#1A1A1A]/5 pt-8 text-center">
          <p className="text-[12px] leading-relaxed font-serif italic text-[#1A1A1A]/50">
            Let the weight of uncertainty drift into the expanse. 
            <span className="block mt-1 opacity-60">将沉重的思绪飘向远方，在这里找回平静。</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 text-right hidden md:block">
        <div className="text-[9px] uppercase tracking-[0.6em] text-[#1A1A1A]/20 font-bold mb-2">Phase Mode</div>
        <div className="text-2xl font-serif italic tracking-tighter text-[#1A1A1A]/40">Internal Clarity</div>
      </div>
    </section>
  );
}
