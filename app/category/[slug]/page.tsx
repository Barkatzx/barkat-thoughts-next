import { client } from "@/sanity/Client";
import imageUrlBuilder from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";

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
  "image": image.asset->,
  "postCount": count(*[_type == "post" && references(^._id)])
}`;

const builder = imageUrlBuilder(client);

// Function to calculate reading time in Bangla
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
        {/* Posts List - 2 columns on desktop, 1 on mobile */}
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
                          {cat.image && (
                            <Image
                              src={builder
                                .image(cat.image)
                                .width(30)
                                .height(30)
                                .url()}
                              alt={cat.title}
                              width={16}
                              height={16}
                              className="rounded-full w-4 h-4 object-cover"
                            />
                          )}
                          {cat.title}
                        </Link>
                      ))}
                    </div>

                    {/* Post Title */}
                    <h2 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">
                      <Link href={`/post/${post.slug.current}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {/* Horizontal line above author info */}
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
                        <span className="text-sm font-medium">
                          {post.author?.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
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
          <h2 className="text-xl font-semibold mb-4 px-2">সকল ক্যাটাগরি</h2>
          <div className="space-y-2">
            {categories.map((category: any) => (
              <Link
                key={category.title}
                href={`/category/${category.title}`}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors ${
                  decodedSlug === category.title ? "bg-gray-50" : ""
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
                    className="rounded-lg w-10 h-10 object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium truncate">
                    {category.title}
                  </h3>
                </div>
                <div className="bg-gray-100 rounded-full px-2.5 py-0.5">
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
