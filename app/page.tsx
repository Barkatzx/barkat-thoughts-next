import PostsPage from "@/components/Blog";
import BlogHero from "@/components/Hero";
import "./globals.css";

export default function Home() {
  return (
    <div>
      <BlogHero />
      <PostsPage />
    </div>
  );
}
