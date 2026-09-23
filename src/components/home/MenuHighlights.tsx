import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const menuOptions = [
  {
    title: "Today's Menu",
    description: "Freshly prepared dishes available to order today.",
    href: "/menu?filter=today",
    image: "/images/menu-highlights/todays-menu.jpg",
  },
  {
    title: "Chef's Special",
    description: "Special dishes selected from our kitchen.",
    href: "/menu?filter=chef",
    image: "/images/menu-highlights/chef-special.jpg",
  },
  {
    title: "Vegan Options",
    description: "Flavourful plant-based West African meals.",
    href: "/menu?filter=vegan",
    image: "/images/menu-highlights/vegan-options.jpg",
  },
  {
    title: "Combo Options",
    description: "Complete meal combos with sides and drinks.",
    href: "/menu?filter=combo",
    image: "/images/menu-highlights/combo-options.jpg",
  },
];

export default function MenuHighlights() {
  return (
    <section
      id="menu-preview"
      className="bg-[#FFF8EC] px-5 py-14 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.22em] text-[#B9472E]">
              Order Takeaway or Pickup
            </p>
            <h2 className="font-[var(--font-cormorant)] text-5xl font-bold leading-none text-[#321B29] md:text-6xl">
              Explore the Menu
            </h2>
            <p className="mt-3 max-w-[620px] text-base font-semibold leading-7 text-[#151313]/75">
              Discover what is available today, our chef&apos;s selections,
              vegan dishes and meal combos.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-[#321B29] px-5 py-3 text-sm font-bold text-white transition duration-300 hover:bg-[#D89A27] hover:text-[#321B29]"
          >
            View Full Menu
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {menuOptions.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group overflow-hidden rounded-[18px] border border-b-4 bg-white shadow-[0_6px_20px_rgba(50,27,41,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(50,27,41,0.14)] ${
                index === 0
                  ? "border-[#D89A27]/20 border-b-[#D89A27]"
                  : index === 1
                    ? "border-[#B9472E]/20 border-b-[#B9472E]"
                    : index === 2
                      ? "border-[#294B73]/20 border-b-[#294B73]"
                      : "border-[#321B29]/10 border-b-[#321B29]"
              }`}
            >
              <div className="relative h-[145px] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#321B29]/35 via-transparent to-transparent" />
              </div>

              <div className="p-5">
                <h3 className="font-[var(--font-cormorant)] text-[28px] font-bold leading-none text-[#321B29]">
                  {item.title}
                </h3>
                <p className="mt-2 min-h-[48px] text-sm font-semibold leading-6 text-[#151313]/70">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-extrabold text-[#B9472E]">
                  Explore
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
