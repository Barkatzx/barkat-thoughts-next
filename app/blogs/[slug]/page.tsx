import { client } from "@/sanity/Client";
import { components } from "@/sanity/Portabletext";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { PortableText, type SanityDocument } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaBookReader } from "react-icons/fa";
import { IoIosTime } from "react-icons/io";
import { MdDateRange } from "react-icons/md";

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
  return toBanglaNumeral(minutes);
};

// Updated GROQ query to include author details and separate query for all categories
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title,
  body,
  author->{
    name,
    image,
    bio
  },
  publishedAt,
  categories[]->{
    title,
    "image": image.asset->
  },
  mainImage
}`;

// Query to fetch all categories with post count
const CATEGORIES_QUERY = `*[_type == "category"] {
  title,
  "image": image.asset->,
  "postCount": count(*[_type == "post" && references(^._id)])
} | order(title asc)`;

// Function to convert English numerals to Bangla
const toBanglaNumeral = (num: number): string => {
  const banglaNumerals = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => banglaNumerals[parseInt(digit)]);
};

// Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// ISR (revalidation time in seconds)
export const revalidate = 30;

// Generate static paths
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(`*[_type == "post"].slug.current`);
  return slugs.map((slug) => ({ slug }));
}

// TypeScript type for params
type tParams = Promise<{ slug: string }>;

export default async function PostPage(props: { params: tParams }) {
  const { slug } = await props.params;
  const decodedSlug = decodeURIComponent(slug);
  if (!decodedSlug) return notFound();

  const [post, categories] = await Promise.all([
    client.fetch<SanityDocument>(POST_QUERY, {
      slug: decodedSlug,
    }),
    client.fetch(CATEGORIES_QUERY),
  ]);

  if (!post) return notFound();

  const mainImageUrl = post.mainImage
    ? urlFor(post.mainImage)?.width(800).height(450).url()
    : null;

  const date = new Date(post.publishedAt);

  const formattedDate = date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const fullDateTime = `${formattedDate}, ${formattedTime}`;

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#f9f6f3] flex flex-col gap-4 px-5 md:px-20 py-10">
        <div
          className="absolute inset-0 bg-[url('/wave.png')] bg-cover opacity-60 z-0"
          aria-hidden="true"
        />

        {/* Categories */}
        <div className="flex flex-wrap gap-2 z-10">
          {post.categories?.map((cat: { title: string }, idx: number) => (
            <span
              key={idx}
              className="font-[Akhand-bold] bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
            >
              {cat.title}
            </span>
          ))}
        </div>

        {/* Post Title */}
        <h1 className="md:text-7xl text-3xl font-[Akhand-bold] z-10">
          {post.title}
        </h1>

        {/* Date only in header */}
        <div className="font-[Akhand-bold] flex items-center gap-6 text-sm mb-5 z-10">
          <div className="flex items-center gap-2">
            <MdDateRange className="text-blue-600" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <IoIosTime className="text-blue-600" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaBookReader className="text-blue-600" />{" "}
            <span>পড়তে {calculateReadingTime(post.body)} মিনিট লাগবে</span>
          </div>
        </div>

        {/* Featured Image */}
        {mainImageUrl && (
          <Image
            src={mainImageUrl}
            alt={post.title}
            width={1200}
            height={630}
            className="rounded-2xl z-10"
            unoptimized
          />
        )}
      </div>

      {/* Post Body */}
      <div className="px-5 md:px-10 py-10 flex gap-10 items-start lg:flex-row flex-col">
        {/* Post Body - 70% on large screens */}
        <div className="mt-6 text-xl">
          {Array.isArray(post.body) && (
            <PortableText value={post.body} components={components} />
          )}

          {/* Author Info Section - Added below post content */}
          {post.author && (
            <div className="mt-16 p-6 bg-[#f9f6f3] rounded-xl">
              <div className="flex items-center gap-4 mb-4 ">
                {post.author.image && (
                  <Image
                    src={urlFor(post.author.image)?.url() || ""}
                    alt={post.author.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                    unoptimized
                  />
                )}
                <h2 className="text-2xl font-[Akhand-bold]">
                  {post.author.name}
                </h2>
              </div>
              {post.author.bio && (
                <div className="prose max-w-none">
                  <PortableText value={post.author.bio} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* All Categories Section - 30% on large screens */}
        <div className="bg-white shadow-sm rounded-2xl p-5 h-fit sticky top-20 border border-gray-100">
          <h2 className="font-[Akhand-bold] text-2xl mb-2 px-2">
            সকল ক্যাটাগরি
          </h2>
          <hr className="mb-4 border-gray-200" />
          <div className="space-y-1">
            {categories?.map((category: any, idx: any) => {
              // Generate a unique key (prefer _id, fallback to idx)
              const key = category._id || idx;

              // Build image URL safely
              const imageBuilder = category.image
                ? urlFor(category.image)
                : null;
              const imageUrl = imageBuilder
                ? imageBuilder.width(100).height(100).url()
                : "";

              // Generate slug
              const slug =
                category.slug?.current ||
                (category.title
                  ? category.title.toLowerCase().replace(/\s+/g, "-")
                  : "unknown");

              return (
                <Link
                  key={key}
                  href={`/category/${slug}`}
                  className="flex items-center gap-3 p-1 hover:bg-gray-200 active:bg-gray-400 rounded-xl transition-colors duration-100"
                >
                  {category.image && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      <Image
                        src={imageUrl}
                        alt={category.title}
                        width={40}
                        height={40}
                        className="object-cover rounded-full"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg truncate">{category.title}</h3>
                  </div>
                  <div className="bg-gray-100 rounded-full px-2.5 py-0.5">
                    <span className="text-lg font-[Akhand-bold] text-gray-600">
                      {toBanglaNumeral(category.postCount || 0)}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
