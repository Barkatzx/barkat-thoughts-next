import Image from "next/image";
import Link from "next/link";
import { Post } from "./Blog";

// Convert English numerals to Bangla
const toBanglaNumeral = (num: number): string => {
  const banglaNumerals = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => banglaNumerals[parseInt(digit)]);
};

// Calculate reading time in Bangla
const calculateReadingTime = (content: any) => {
  const banglaNumerals = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const wordCount =
    content?.reduce((acc: number, block: any) => {
      if (block._type !== "block" || !block.children) return acc;
      return (
        acc +
        block.children
          .map((child: any) => child.text?.split(" ").length || 0)
          .reduce((a: number, b: number) => a + b, 0)
      );
    }, 0) || 0;

  const minutes = Math.ceil(wordCount / 200);
  return minutes
    .toString()
    .split("")
    .map((digit) => banglaNumerals[parseInt(digit)])
    .join("");
};

interface PostsGridProps {
  posts: Post[];
}

export default function PostsGrid({ posts }: PostsGridProps) {
  if (!posts || posts.length === 0) {
    return <div>No posts found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            {/* Post Image */}
            {post.mainImage && (
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

            <div className="p-4">
              {/* Category and Subcategory */}
              {post.categories && post.categories.length > 0 && (
                <div className="mb-3">
                  {post.categories.map((category) => (
                    <div key={category.title} className="flex flex-wrap gap-1">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {category.title}
                      </span>
                      {category.subCategories?.map((subCat) => (
                        <span
                          key={subCat.slug.current}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {subCat.title}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="font-[Akhand-bold] text-2xl mb-2 hover:text-blue-600 transition-colors duration-200">
                <Link href={`/blogs/${post.slug.current}`}>{post.title}</Link>
              </h2>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-gray-600 mb-3 line-clamp-2 text-lg">
                  {post.excerpt}
                </p>
              )}

              {/* Horizontal Line */}
              <hr className="my-3 border-gray-200" />

              {/* Footer - Author and Reading Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Author Image */}
                  {post.author?.image ? (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 ">
                      <Image
                        src={post.author.image.asset.url}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-xs">
                      {post.author?.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <span className="text-sm text-gray-600">
                    {post.author?.name || "Unknown Author"}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  পড়ার সময়: {calculateReadingTime(post.body)} মিনিট
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
