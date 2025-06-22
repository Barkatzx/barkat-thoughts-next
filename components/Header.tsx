"use client";

import logo from "@/public/logo.png";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Animation variants
  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  return (
    <header className="bg-[#f9f6f3] flex items-center justify-between px-5 md:px-20 py-10 rounded-t-2xl">
      {/* Logo */}
      <motion.div
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="text-xl font-bold">
          <Image
            src={logo}
            alt="logo"
            width={160}
            height={40}
            priority
            style={{
              width: "auto",
              height: "auto",
            }}
            className="max-w-full"
          />
        </Link>
      </motion.div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-1 justify-center backdrop-blur-sm px-6 py-2">
        <motion.div
          className="flex space-x-6"
          initial="hidden"
          animate="visible"
        >
          {["হোমপেইজ", "ক্যাটাগরী", "Services"].map((item, i) => (
            <motion.div
              key={item}
              variants={navItemVariants}
              custom={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/${item.toLowerCase()}`}
                className="hover:text-sky-400 transition-colors font-semibold text-xl"
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </nav>

      {/* Mobile Menu Button */}
      <motion.div
        className="md:hidden flex-1 flex justify-end"
        whileTap={{ scale: 0.9 }}
      >
        <button
          onClick={toggleMenu}
          className="text-white hover:text-black focus:outline-none bg-sky-400 p-2 rounded-md"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <FiX size={24} className="text-black" />
          ) : (
            <FiMenu size={24} />
          )}
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden absolute top-25 left-3 right-3 bg-[#f9f6f3] shadow-lg z-50 font-bold text-lg"
          >
            <nav className="flex flex-col items-center py-4">
              {["About", "Statistics", "Services"].map((item, i) => (
                <motion.div
                  key={item}
                  variants={navItemVariants}
                  custom={i}
                  className="w-full text-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="block py-3 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className=" justify-center flex items-center mb-4">
              <Link href={`/contact`}>
                <button className="bg-sky-400 px-8 py-1 rounded-full text-lg font-semibold text-black hover:bg-amber-500 transition-colors">
                  Contact Me
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right spacer for desktop */}
      <div className="hidden md:block flex-1">
        <Link href={`/contact`}>
          <button className="bg-sky-400 px-8 py-1 rounded-full text-lg font-semibold text-black hover:bg-amber-500 transition-colors cursor-pointer">
            Contact Me
          </button>
        </Link>
      </div>
    </header>
  );
}
