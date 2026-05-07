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
      <div className="max-w-3xl w-full flex flex-col items-center justify-center">
        {/* 背景大标题：更淡的配色，作为背景节奏 */}
        <h2 className="text-6xl md:text-[10rem] font-serif mb-12 leading-[0.8] tracking-tighter text-[#1A1A1A]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
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
      </div>
    </section>
  );
}
