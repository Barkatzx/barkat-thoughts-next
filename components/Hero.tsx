"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function BlogHero() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  return (
    <section className="relative bg-[#f8f5f2] py-12 md:py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-10 bg-[url('/wave.png')] bg-cover bg-no-repeat bg-center opacity-10" />

      <div className="container mx-auto px-5 md:px-20 relative z-10">
        <div className="text-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-[Akhand-bold] text-3xl md:text-6xl leading-tight">
                কোড, ক্যারিয়ার ও কনসিস্টেন্সি — প্রতিদিন এগিয়ে যাওয়ার গল্প ✍️
              </h1>
              <p className="md:text-2xl text-lg mt-6 max-w-3xl mx-auto">
                ফুল স্ট্যাক ডেভেলপমেন্ট থেকে শুরু করে প্রোডাক্টিভিটি হ্যাক, টাইম
                ম্যানেজমেন্ট — প্রতিটি লেখায় আছে বাস্তব অভিজ্ঞতা, শেখার উপকরণ
                এবং ক্যারিয়ার গড়ার পথনির্দেশনা।
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Counter component (unchanged)
function Counter({
  target,
  duration,
  delay = 0,
  children,
}: {
  target: number;
  duration: number;
  delay?: number;
  children: (value: number) => React.ReactNode;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 60); // 60fps

    const timer = setTimeout(() => {
      const animation = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(animation);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60); // 60fps

      return () => clearInterval(animation);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return children(count);
}
