"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaBookOpen, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Post } from "./Blog";

const categoryColors: Record<string, string> = {
  technology: "bg-blue-100 text-blue-800",
  design: "bg-purple-100 text-purple-800",
  business: "bg-green-100 text-green-800",
  lifestyle: "bg-pink-100 text-pink-800",
  default: "bg-gray-100 text-gray-800",
};

export default function PostsGrid({ posts }: { posts: Post[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const postsPerPage = 9;

  // Filter posts based on search query
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.categories?.some((cat) =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handlePrevPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Function to extract first paragraph as excerpt if no excerpt exists
  const getExcerpt = (post: Post) => {
    if (post.excerpt) return post.excerpt;
    if (post.body) {
      const firstBlock = post.body.find(
        (block: any) => block._type === "block"
      );
      if (firstBlock) {
        return (
          firstBlock.children[0]?.text || "Read this interesting article..."
        );
      }
    }
    return "Read this interesting article...";
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <section className="container mx-auto px-6 py-12">
        {/* Featured Post */}
        {posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <FaBookOpen className="text-blue-400" />
              <span className="font-[Akhand-bold] text-3xl">
                ফিচার্ড আর্টিকেল
              </span>
            </h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
              <Link href={`/blogs/${posts[0].slug.current}`}>
                <div className="md:flex">
                  {posts[0].mainImage?.asset?.url && (
                    <div className="md:w-1/2 h-64 md:h-auto relative">
                      <Image
                        src={posts[0].mainImage.asset.url}
                        alt={posts[0].title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  )}
                  <div className="p-8 md:w-1/2 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {posts[0].categories?.map((cat, i) => (
                        <div key={i} className="flex flex-wrap gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              categoryColors[cat.title.toLowerCase()] ||
                              categoryColors.blue
                            }`}
                          >
                            {cat.title}
                          </span>
                          {cat.subCategories?.map((subCat, j) => (
                            <span
                              key={j}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                categoryColors[cat.title.toLowerCase()] ||
                                categoryColors.blue
                              } bg-opacity-50`}
                            >
                              {subCat.title}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                    <h3 className="font-[Akhand-bold] text-2xl md:text-3xl font-bold mb-4">
                      {posts[0].title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {getExcerpt(posts[0])}
                    </p>
                    <button className="self-start bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-[Akhand-bold]">
                      পুরো লেখা পড়ুন...
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {/* All Posts Grid */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>Latest Articles</span>
          </h2>
          {filteredPosts.length > postsPerPage && (
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        {currentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPosts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <Link
                  href={`/blogs/${post.slug.current}`}
                  className="block h-full"
                >
                  <div className="h-full flex flex-col">
                    {post.mainImage?.asset?.url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={post.mainImage.asset.url}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.categories?.map((cat, i) => (
                          <div key={i} className="flex flex-wrap gap-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                categoryColors[cat.title.toLowerCase()] ||
                                categoryColors.default
                              }`}
                            >
                              {cat.title}
                            </span>
                            {cat.subCategories?.map((subCat, j) => (
                              <span
                                key={j}
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                  categoryColors[cat.title.toLowerCase()] ||
                                  categoryColors.default
                                } bg-opacity-50`}
                              >
                                {subCat.title}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {getExcerpt(post)}
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString(
                            "bn-BD",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          5 min read
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-500">
              No articles found
            </h3>
            <p className="text-gray-400 mt-2">
              Try adjusting your search query
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
