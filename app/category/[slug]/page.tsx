// app/category/[slug]/page.tsx

import { client } from "@/sanity/Client";
import imageUrlBuilder from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const CATEGORY_POSTS_QUERY = `*[_type == "post" && references(*[_type == "category" && title == $slug]._id)] {
  title,
  slug,
  publishedAt,
  mainImage,
  excerpt,
  body,
  categories[]->{
    title,
    "image": image.asset->
  },
  author->{
    name,
    image
  }
} | order(publishedAt desc)`;

const ALL_CATEGORIES_QUERY = `*[_type == "category"] {
  title,
  description,
  "image": image.asset->,
  "postCount": count(*[_type == "post" && references(^._id)])
}`;

const CURRENT_CATEGORY_QUERY = `*[_type == "category" && title == $slug][0] {
  description
}`;

// Convert English numerals to Bangla
const toBanglaNumeral = (num: number): string => {
  const banglaNumerals = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => banglaNumerals[parseInt(digit)]);
};

const builder = imageUrlBuilder(client);

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

// Type definition for the page props
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  const currentCategory = await client.fetch(CURRENT_CATEGORY_QUERY, {
    slug: decodedSlug,
  });

  return {
    title: `${decodedSlug} এর সকল পোস্ট`,
    description:
      currentCategory?.description ||
      `${decodedSlug} ক্যাটাগরির সকল পোস্ট দেখুন`,
  };
}

// Next.js 15: Page component with proper async params handling
export default async function CategoryPage({ params }: PageProps) {
  // Await the params promise first
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  if (!decodedSlug) {
    return notFound();
  }

  const [posts, categories, currentCategory] = await Promise.all([
    client.fetch(CATEGORY_POSTS_QUERY, { slug: decodedSlug }),
    client.fetch(ALL_CATEGORIES_QUERY),
    client.fetch(CURRENT_CATEGORY_QUERY, { slug: decodedSlug }),
  ]);

  return (
    <div className="">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#f9f6f3] flex flex-col gap-4 px-5 md:px-20 py-10">
        <div
          className="absolute inset-0 bg-[url('/wave.png')] bg-cover opacity-60 z-0"
          aria-hidden="true"
        />
        <h1 className="font-[Akhand-bold] text-5xl mb-2 z-5">
          {decodedSlug} এর সকল পোস্টগুলো
        </h1>
        {currentCategory?.description && (
          <p className="text-xl text-gray-700 z-5">
            {currentCategory.description}
          </p>
        )}
      </div>

      {/* Posts and Sidebar */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl px-5 md:px-20 py-10">
        {/* Posts List */}
        <div className="md:col-span-2">
          <div className="grid md:grid-cols-2 gap-6">
            {posts.length === 0 ? (
              <div className="col-span-2 text-gray-500">
                এই ক্যাটাগরিতে কোনো পোস্ট পাওয়া যায়নি
              </div>
            ) : (
              posts.map((post: any) => (
                <article
                  key={post.slug.current}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Post Image */}
                  {post.mainImage && (
                    <Link
                      href={`/post/${post.slug.current}`}
                      className="block aspect-video overflow-hidden"
                    >
                      <Image
                        src={builder
                          .image(post.mainImage)
                          .width(800)
                          .height(450)
                          .url()}
                        alt={post.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  )}

                  <div className="p-4">
                    {/* Categories Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.categories?.map((cat: any) => (
                        <Link
                          key={cat.title}
                          href={`/category/${cat.title}`}
                          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-800 transition-colors"
                        >
                          {cat.title}
                        </Link>
                      ))}
                    </div>

                    {/* Post Title */}
                    <h2 className="font-[Akhand-bold] text-2xl mb-2 hover:text-blue-600 transition-colors">
                      <Link href={`/post/${post.slug.current}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-800 mb-4 line-clamp-3 text-lg">
                        {post.excerpt}
                      </p>
                    )}

                    <hr className="my-4 border-gray-100" />

                    {/* Author and Reading Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.author?.image && (
                          <Image
                            src={builder
                              .image(post.author.image)
                              .width(40)
                              .height(40)
                              .url()}
                            alt={post.author.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        )}
                        <span className="text-lg text-gray-600">
                          {post.author?.name}
                        </span>
                      </div>
                      <div className="text-lg text-gray-600">
                        পড়ার সময়: {calculateReadingTime(post.body)} মিনিট
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* Categories Sidebar */}
        <div className="bg-white shadow-sm rounded-2xl p-5 h-fit sticky top-20 border border-gray-100">
          <h2 className="font-[Akhand-bold] text-2xl font-semibold mb-2 px-2">
            সকল ক্যাটাগরি
          </h2>
          <hr className="mb-4 border-gray-200" />

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map((category: any) => (
              <Link
                key={category.title}
                href={`/category/${category.title}`}
                className={`flex items-center gap-3 p-1 hover:bg-gray-200 rounded-xl font-[Akhand-bold] transition-colors ${
                  decodedSlug === category.title ? "bg-gray-200" : ""
                }`}
              >
                {category.image && (
                  <Image
                    src={builder
                      .image(category.image)
                      .width(100)
                      .height(100)
                      .url()}
                    alt={category.title}
                    width={40}
                    height={40}
                    className="rounded-full w-7 h-7 object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium truncate">
                    {category.title}
                  </h3>
                </div>
                <div className="bg-gray-100 rounded-full px-2.5 py-0.5">
                  <span className="text-lg font-[Akhand-bold] text-gray-600">
                    {toBanglaNumeral(category.postCount || 0)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
