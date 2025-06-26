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
      <div
        className="absolute inset-0 bg-[url('../public/wave.png')] bg-cover opacity-10"
        aria-hidden="true"
      />

      <div className="container mx-auto px-5 md:px-20 relative z-10">
        <div className="text-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-[Recoleta] text-3xl md:text-6xl leading-tight">
                Insights & Stories <br />
                From The Digital World ✍️
              </h1>
              <p className="md:text-xl text-lg mt-6 max-w-3xl mx-auto">
                Explore articles on web development, design trends, business
                growth, and technology insights to stay ahead in the digital
                landscape.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats Section - Modified for blog metrics */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid md:grid-cols-4 grid-cols-2 md:gap-5 gap-2 bg-white md:p-5 p-2 rounded-xl mt-12"
        >
          {/* Categories */}
          <motion.div
            variants={itemVariants}
            className="bg-[#f9f6f3] rounded-xl p-4 flex flex-col justify-center items-center py-8 px-5"
          >
            <motion.h2
              className="font-[Recoleta] text-2xl md:text-3xl text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 150,
              }}
            >
              Categories
            </motion.h2>
          </motion.div>

          {/* Articles Published */}
          <motion.div
            variants={itemVariants}
            className="font-[Recoleta] bg-[#f9f6f3] rounded-xl p-4 flex flex-col justify-center items-center py-8 px-5"
          >
            <Counter target={50} duration={1} delay={0.4}>
              {(value) => (
                <motion.h1
                  className="text-3xl md:text-4xl font-bold"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.4,
                    type: "spring",
                  }}
                >
                  {value}+
                </motion.h1>
              )}
            </Counter>
            <motion.h3
              className="text-lg md:text-xl text-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Articles Published
            </motion.h3>
          </motion.div>

          {/* Monthly Readers */}
          <motion.div
            variants={itemVariants}
            className="font-[Recoleta] bg-[#f9f6f3] rounded-xl p-4 flex flex-col justify-center items-center py-8 px-5"
          >
            <Counter target={5000} duration={1.2} delay={0.6}>
              {(value) => (
                <motion.h1
                  className="text-3xl md:text-4xl"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.6,
                    type: "spring",
                  }}
                >
                  {value.toLocaleString()}+
                </motion.h1>
              )}
            </Counter>
            <motion.h3
              className="text-lg md:text-xl mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Monthly Readers
            </motion.h3>
          </motion.div>

          {/* Years Writing */}
          <motion.div
            variants={itemVariants}
            className="font-[Recoleta] bg-[#f9f6f3] rounded-xl p-4 flex flex-col justify-center items-center py-8 px-5"
          >
            <Counter target={4} duration={1.5} delay={0.8}>
              {(value) => (
                <motion.h1
                  className="text-3xl md:text-4xl"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.8,
                    type: "spring",
                  }}
                >
                  {value}+
                </motion.h1>
              )}
            </Counter>
            <motion.h3
              className="text-lg md:text-xl mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              Years Writing
            </motion.h3>
          </motion.div>
        </motion.div>
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
