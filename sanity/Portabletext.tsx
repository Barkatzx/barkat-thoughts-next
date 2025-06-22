import { urlFor } from "@/sanity/Client";
import { PortableTextComponents } from "@portabletext/react";
import Image from "next/image";

export const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="font-[Akhand-bold] text-5xl mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-[Akhand-bold] text-4xl mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-[Akhand-bold] text-3xl mb-4">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-[Akhand-bold] text-2xl mb-4">{children}</h4>
    ),
    normal: ({ children }) => <p className="text-xl">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc ml-6 mb-4 space-y-2 text-xl">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal ml-6 space-y-2 text-xl">{children}</ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => <li className="text-xl">{children}</li>,
    number: ({ children }) => <li className="text-xl">{children}</li>,
  },
  types: {
    image: ({ value }) => {
      const imageUrl = urlFor(value)
        .width(1200)
        .height(630)
        .fit("max")
        .auto("format")
        .url();

      if (!imageUrl) return null;

      return (
        <div className="my-6">
          <Image
            src={imageUrl}
            alt={value.alt || "Sanity Image"}
            width={1200}
            height={630}
            className="rounded-lg shadow"
          />
        </div>
      );
    },
  },
};
