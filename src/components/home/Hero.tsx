import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
} from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-114px)] overflow-hidden"
    >
      <Image
        src="/images/hero/hero-food.png"
        alt="West African food from African Restaurant Estonia"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#151313]/90 via-[#321B29]/70 to-[#151313]/20" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#151313]/55 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-114px)] max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-[760px]">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.24em] text-[#D89A27]">
            Authentic Flavours. Real Culture.
          </p>

          <h1 className="font-[var(--font-cormorant)] text-[48px] font-bold leading-[0.9] text-[#FFF8EC] sm:text-[68px] md:text-[82px] lg:text-[92px]">
            A Taste of
            <br />
            West Africa,
            <br />
            <span className="text-[#D89A27]">Right Here.</span>
          </h1>

          <p className="mt-7 max-w-[620px] text-base leading-8 text-[#FFF8EC]/85 sm:text-lg">
            Authentic Nigerian & West African food in Tallinn.
            Freshly prepared with bold flavours, familiar tastes,
            and the warmth of home.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#D89A27] px-6 py-4 font-bold text-[#321B29] transition hover:bg-[#FFF8EC]"
            >
              Start Order
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#FFF8EC]/50 bg-[#FFF8EC]/10 px-6 py-4 font-semibold text-[#FFF8EC] transition hover:bg-[#FFF8EC] hover:text-[#321B29]"
            >
              View Today&apos;s Menu
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-5 text-sm font-semibold text-[#FFF8EC]/90">
            <span className="flex items-center gap-2">
              <Truck size={18} className="text-[#D89A27]" />
              Delivery Available
            </span>

            <span className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#D89A27]" />
              Pickup Available
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
