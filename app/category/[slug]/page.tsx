import { client } from "@/sanity/Client";
import imageUrlBuilder from "@sanity/image-url";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";

const CATEGORY_POSTS_QUERY = `*[_type == "post" && references(*[_type == "category" && title == $slug]._id)] {
  title,
  slug,
  publishedAt,
  mainImage,
  excerpt,
  categories[]->{title}
} | order(publishedAt desc)`;

const ALL_CATEGORIES_QUERY = `*[_type == "category"] {
  title,
  "postCount": count(*[_type == "post" && references(^._id)])
}`;

const builder = imageUrlBuilder(client);

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const decodedSlug = decodeURIComponent(params.slug);
  const [posts, categories] = await Promise.all([
    client.fetch(CATEGORY_POSTS_QUERY, { slug: decodedSlug }),
    client.fetch(ALL_CATEGORIES_QUERY),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-[Akhand-bold] text-3xl font-bold mb-8">
        {decodedSlug} এর সকল পোস্ট
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Posts List */}
        <div className="md:col-span-2 space-y-6">
          {posts.length === 0 ? (
            <p>No posts found in this category.</p>
          ) : (
            posts.map((post: any) => (
              <article key={post.slug.current} className="border-b pb-6">
                <Link href={`/post/${post.slug.current}`}>
                  {post.mainImage && (
                    <Image
                      src={builder
                        .image(post.mainImage)
                        .width(800)
                        .height(450)
                        .url()}
                      alt={post.title}
                      width={800}
                      height={450}
                      className="rounded-lg mb-4"
                    />
                  )}
                  <h2 className="text-2xl font-bold hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex gap-2 my-2">
                    {post.categories?.map((cat: any) => (
                      <span
                        key={cat.title}
                        className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                      >
                        {cat.title}
                      </span>
                    ))}
                  </div>
                  {post.excerpt && <PortableText value={post.excerpt} />}
                </Link>
              </article>
            ))
          )}
        </div>

        {/* Categories Sidebar */}
        <div className="bg-white shadow-sm rounded-2xl p-5 h-fit sticky top-20 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 px-2">সকল ক্যাটাগরি</h2>
          <div className="space-y-1">
            {categories.map((category: any) => (
              <Link
                key={category.title}
                href={`/category/${category.title}`}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors ${
                  decodedSlug === category.title ? "bg-gray-100" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium truncate">
                    {category.title}
                  </h3>
                </div>
                <div className="bg-gray-200 rounded-full px-2.5 py-0.5">
                  <span className="text-sm font-medium text-gray-600">
                    {category.postCount}
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
