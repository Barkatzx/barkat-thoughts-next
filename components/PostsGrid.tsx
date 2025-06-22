"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Post } from "./Blog";

// Pastel colors
const pastelColors = [
  "#cdb4db",
  "#bdb2ff",
  "#ffafcc",
  "#e4c1f9",
  "#a2d2ff",
  "#ccd5ae",
];

function getRandomColor() {
  const index = Math.floor(Math.random() * pastelColors.length);
  return pastelColors[index];
}

interface PostGridProps {
  posts: Post[];
}

export default function PostsGrid({ posts }: PostGridProps) {
  const postsPerPage = 6; // Number of posts per page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the index of the first and last post based on the current page
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  // Slice the posts array to get the current page's posts
  const currentPosts = posts.slice(startIndex, endIndex);

  // Handle Next and Previous page navigation
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(posts.length / postsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <main className="px-5 md:px-20 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentPosts.map((post, index) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [hoverColor, setHoverColor] = useState<string | null>(null);

          return (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="h-full"
            >
              <Link
                href={`/blogs/${post.slug.current}`}
                className="h-full block"
              >
                <div
                  className="group relative rounded-xl overflow-hidden shadow-md transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-[#f9f6f3] h-full flex flex-col"
                  onMouseEnter={() => setHoverColor(getRandomColor())}
                >
                  {/* Random hover color */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                      backgroundColor: hoverColor ?? "#fff",
                      zIndex: 0,
                    }}
                  ></div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    {/* Image */}
                    {post.mainImage?.asset?.url && (
                      <div className="aspect-video w-full relative">
                        <Image
                          src={post.mainImage.asset.url}
                          alt={post.title}
                          fill
                          priority // 👈 Preloads the image early for better LCP
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 flex-1 flex flex-col">
                      {/* Categories */}
                      {post.categories && post.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {post.categories.map((cat, i) => (
                            <span
                              key={i}
                              className=" inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {cat.title || "Uncategorized"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-block bg-gray-200 text-sm px-3 py-1 rounded-full text-gray-800 mb-2">
                          Uncategorized
                        </span>
                      )}

                      {/* Title */}
                      <h2 className="font-[Akhand-bold] text-xl">
                        {post.title}
                      </h2>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex gap-5 justify-center mt-8 items-center">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
        >
          <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <span className="text-sm text-gray-700">Page {currentPage}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage * postsPerPage >= posts.length}
          className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
        >
          <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </main>
  );
}
