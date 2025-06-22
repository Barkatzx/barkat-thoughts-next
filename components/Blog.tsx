import { client } from "@/sanity/Client";
import PostsGrid from "./PostsGrid";

export interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  mainImage: {
    asset: {
      url: string;
    };
  };
  excerpt?: string; // Make it optional
  body?: any[]; // PortableText content (array of blocks)
  categories?: {
    title: string;
  }[];
}

const POSTS_QUERY = `*[
  _type == "post" && defined(slug.current)
]|order(publishedAt desc)[0...12]{
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
    title
  }
}`;

const options: { next: { revalidate: number } } = { next: { revalidate: 30 } };

export default async function PostsPage() {
  try {
    const posts = await client.fetch<Post[]>(POSTS_QUERY, {}, options);
    return <PostsGrid posts={posts} />;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return <div>Error loading posts</div>;
  }
}
