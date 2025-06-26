import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Barkat's Thoughts",
  description: "A place for thoughts and insights by Barkat Bhai",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
