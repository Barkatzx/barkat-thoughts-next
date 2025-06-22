import { client } from "@/sanity/Client";
import { components } from "@/sanity/Portabletext";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { PortableText, type SanityDocument } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaYoutube } from "react-icons/fa";

// Updated GROQ query to include author details
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title,
  body,
  author->{
    name,
    image,
    bio
  },
  publishedAt,
  categories[]->{ title },
  mainImage
}`;

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

  const post = await client.fetch<SanityDocument>(POST_QUERY, {
    slug: decodedSlug,
  });
  if (!post) return notFound();

  const mainImageUrl = post.mainImage
    ? urlFor(post.mainImage)?.width(800).height(450).url()
    : null;

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
              className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
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
        <div className="text-xl font-bold mb-5 z-10">
          <span>{formattedDate}</span>
        </div>

        {/* Featured Image */}
        {mainImageUrl && (
          <Image
            src={mainImageUrl}
            alt={post.title}
            width={1200}
            height={630}
            className="rounded-xl z-10"
            unoptimized
          />
        )}
      </div>

      {/* Post Body */}
      <div className="px-5 md:px-20 py-10 flex gap-10 items-start lg:flex-row flex-col">
        {/* Post Body - 70% on large screens */}
        <div className="mt-6 text-xl lg:w-[70%] w-full">
          {Array.isArray(post.body) && (
            <PortableText value={post.body} components={components} />
          )}

          {/* Author Info Section - Added below post content */}
          {post.author && (
            <div className="mt-16 p-6 bg-[#f9f6f3] rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                {post.author.image && (
                  <Image
                    src={urlFor(post.author.image)?.url() || ""}
                    alt={post.author.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                    unoptimized
                  />
                )}
                <h2 className="text-2xl font-bold">{post.author.name}</h2>
              </div>
              {post.author.bio && (
                <div className="prose max-w-none">
                  <PortableText value={post.author.bio} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barkat Div - 30% on large screens */}
        <div className="bg-[#f9f6f3] shadow-xl rounded-xl p-5 lg:w-[30%] w-full lg:sticky lg:top-20">
          <h1 className="font-[Recoleta] text-4xl font-bold">Barkat Ullah</h1>
          <p className="text-xl mt-2">
            Join me on YouTube as I explore the worlds of productivity,
            business, creativity, and lifelong learning. I share insights from
            the books I'm reading, lessons I've picked up along the way, and
            practical tips to help you grow. Every journey starts somewhere —
            let's grow together, one video at a time. 🌱📚
          </p>
          <Link
            target="_blank"
            href="https://www.youtube.com/@BarkatUllahzx"
            rel="noopener noreferrer"
          >
            <button className="bg-white p-5 rounded-full hover:bg-blue-400 hover:text-white transition duration-300 ease-in-out text-black mt-4 flex items-center gap-2 text-lg">
              <FaYoutube className="text-red-700" />
              Subscribe On Youtube
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
