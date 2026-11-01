import Image from "next/image";
import { ImageIcon } from "lucide-react";

type MenuItemImageProps = {
  name: string;
  image?: string;
  className?: string;
  sizes?: string;
};

export default function MenuItemImage({ name, image, className = "h-full w-full", sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" }: MenuItemImageProps) {
  if (!image) {
    return (
      <div className={`flex items-center justify-center bg-white ${className}`}>
        <ImageIcon size={22} className="text-[#321B29]/25" aria-hidden="true" />
      </div>
    );
  }

  // Keep existing external images working even outside the configured host.
  const optimizable = image.startsWith("/") || image.startsWith("https://res.cloudinary.com/");
  return (
    <div className={`relative ${className}`}>
      <Image src={image} alt={name} fill unoptimized={!optimizable}
        sizes={sizes}
        className="object-cover" />
    </div>
  );
}
