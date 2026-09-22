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
        <img
          key={`${src}-${index}`}
          src={src}
          alt={index === 0 ? name : ""}
          aria-hidden={index > 0 ? true : undefined}
          loading="lazy"
          decoding="async"
          className={`h-full min-h-0 w-full object-cover ${index === 0 && images.length > 1 ? "col-span-2" : ""}`}
        />
      ))}
    </div>
  );
}
