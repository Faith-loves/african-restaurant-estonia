import Image from "next/image";
import { ImageIcon } from "lucide-react";

type MenuItemImageProps = {
  name: string;
  image?: string;
  className?: string;
};

export default function MenuItemImage({ name, image, className = "h-full w-full" }: MenuItemImageProps) {
  const images = image ? [image] : [];

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-white ${className}`}>
        <ImageIcon size={22} className="text-[#321B29]/25" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={`grid h-full w-full ${images.length > 1 ? "grid-cols-3 gap-0.5" : "grid-cols-1"}`}>
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={`relative min-h-0 ${index === 0 && images.length > 1 ? "col-span-2" : ""}`}
        >
          <Image
            src={src}
            alt={index === 0 ? name : ""}
            aria-hidden={index > 0 ? true : undefined}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
