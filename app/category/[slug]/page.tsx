import { client } from "@/sanity/Client";
import imageUrlBuilder from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const CATEGORY_POSTS_QUERY = `*[_type == "post" && references(*[_type == "category" && title == $slug]._id)] {
  _id,
  title,
  slug,
  publishedAt,
  mainImage {
    asset->{
      url
    }
  },
  excerpt,
  body,
  categories[]->{
    title,
    subCategories[] {
      title,
      slug {
        current
      }
    }
  },
  author->{
    name,
    image {
      asset->{
        url
      }
    }
  }
} | order(publishedAt desc)`;

const ALL_CATEGORIES_QUERY = `*[_type == "category"] {
  title,
  description,
  "image": image.asset->,
  "postCount": count(*[_type == "post" && references(^._id)]),
  "subCategories": *[_type == "subCategory" && references(^._id)] {
    title,
    slug,
    "postCount": count(*[_type == "post" && references(^._id)])
  }
}`;

const CURRENT_CATEGORY_QUERY = `*[_type == "category" && title == $slug][0] {
  description,
  "subCategories": *[_type == "subCategory" && references(^._id)] {
    title,
    slug,
    description
  }
}`;

// Convert English numerals to Bangla
const toBanglaNumeral = (num: number): string => {
  const banglaNumerals = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (digit) => banglaNumerals[parseInt(digit)]);
};

// Format date in Bangla
const formatBanglaDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("bn-BD", options);
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
  return toBanglaNumeral(minutes);
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

export default async function CategoryPage({ params }: PageProps) {
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
        <h1 className="font-[Akhand-bold] text-3xl md:text-6xl leading-tight mb-2 z-5">
          {decodedSlug} এর সকল পোস্টগুলো
        </h1>
        {currentCategory?.description && (
          <p className="md:text-2xl text-lg z-5">
            {currentCategory.description}
          </p>
        )}

        {/* Show subcategories if they exist */}
        {currentCategory?.subCategories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 z-5">
            {currentCategory.subCategories.map((subCat: any) => (
              <Link
                key={subCat.slug.current}
                href={`/category/${decodedSlug}/${subCat.slug.current}`}
                className="bg-white hover:bg-gray-100 px-4 py-2 rounded-full text-sm shadow-sm border border-gray-200 transition-colors"
              >
                {subCat.title}
              </Link>
            ))}
          </div>
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
                  key={post._id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Post Image */}
                  {post.mainImage && (
                    <Link
                      href={`/blogs/${post.slug.current}`}
                      className="block relative h-48 w-full"
                    >
                      <Image
                        src={post.mainImage.asset.url}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Link>
                  )}

                  <div className="p-4">
                    {/* Categories, Subcategories and Date */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                      {/* Left side - Categories and Subcategories */}
                      <div className="flex-1 min-w-0">
                        {post.categories && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.categories.map((cat: any) => (
                              <div
                                key={cat.title}
                                className="flex flex-wrap gap-1"
                              >
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded font-[Akhand-bold]">
                                  {cat.title}
                                </span>
                                {cat.subCategories?.map((subCat: any) => (
                                  <span
                                    key={subCat.slug.current}
                                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded font-[Akhand-bold]"
                                  >
                                    {subCat.title}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right side - Date */}
                      {post.publishedAt && (
                        <div className="text-xs whitespace-nowrap font-[Akhand-bold] ml-2">
                          {formatBanglaDate(post.publishedAt)}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-[Akhand-bold] text-xl md:text-2xl mb-2 hover:text-blue-600 transition-colors duration-200">
                      <Link href={`/blogs/${post.slug.current}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2 text-base md:text-lg">
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
                          <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
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
                          {post.author?.name || "বরকত উল্লাহ"}
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
          <h2 className="font-[Akhand-bold] text-2xl font-semibold mb-2 px-2">
            সকল ক্যাটাগরি
          </h2>
          <hr className="mb-4 border-gray-200" />

          {/* Categories List */}
          <div className="space-y-1">
            {categories.map((category: any) => (
              <div key={category.title} className="group">
                <div className="flex items-center gap-3 p-1 hover:bg-gray-100 rounded-xl  transition-colors">
                  <Link
                    href={`/category/${category.title}`}
                    className={`flex items-center gap-3 w-full ${
                      decodedSlug === category.title
                        ? "bg-gray-100 p-1 rounded-xl shadow-sm"
                        : ""
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
                        width={32}
                        height={32}
                        className="rounded-full w-8 h-8 object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium">
                        {category.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 rounded-full px-2.5 py-0.5">
                        <span className="text-sm font-[Akhand-bold] text-gray-600">
                          {toBanglaNumeral(category.postCount || 0)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Dropdown toggle button */}
                  {category.subCategories?.length > 0 && (
                    <button
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const subMenu = document.getElementById(
                          `submenu-${category.title}`
                        );
                        subMenu?.classList.toggle("hidden");
                        const arrow = document.getElementById(
                          `arrow-${category.title}`
                        );
                        arrow?.classList.toggle("rotate-180");
                      }}
                    >
                      <svg
                        id={`arrow-${category.title}`}
                        className="w-4 h-4 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Subcategories Dropdown */}
                {category.subCategories?.length > 0 && (
                  <div
                    id={`submenu-${category.title}`}
                    className="ml-10 mt-1 space-y-1 pl-2 border-l-2 border-gray-200 hidden"
                  >
                    {category.subCategories.map((subCat: any) => (
                      <Link
                        key={subCat.slug.current}
                        href={`/category/${category.title}/${subCat.slug.current}`}
                        className="flex items-center justify-between p-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span className="truncate">{subCat.title}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {toBanglaNumeral(subCat.postCount || 0)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
