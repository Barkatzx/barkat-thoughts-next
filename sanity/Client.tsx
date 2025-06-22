import imageUrlBuilder from "@sanity/image-url";
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
});

console.log("Sanity Project ID:", process.env.SANITY_PROJECT_ID);
console.log("Sanity Dataset:", process.env.SANITY_DATASET);
interface SanityImageSource {
  asset: {
    _ref: string;
    _type: string;
  };
  [key: string]: unknown;
}

export const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder(client).image(source);
