import {
  Heart,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";

const highlights = [
  {
    icon: Heart,
    title: "Food With Roots",
    text: "Bold spices, hearty soups, flavourful rice dishes, snacks and traditional drinks inspired by the foods we grew up with.",
  },
  {
    icon: UtensilsCrossed,
    title: "More Than a Meal",
    text: "Food carries stories, brings people together and gives everyone a chance to experience something familiar or discover something new.",
  },
  {
    icon: MapPin,
    title: "From West Africa to Estonia",
    text: "Starting in Tallinn, our goal is to make authentic African food easier to find, understand and enjoy across Estonia.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#321B29] px-5 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

          <div>
            <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.22em] text-[#D89A27]">
              Our Story
            </p>

            <h2 className="font-[var(--font-cormorant)] text-5xl font-bold leading-[1] text-[#FFF8EC] md:text-6xl">
              Familiar to Some.
              <br />
              <span className="text-[#D89A27]">
                A Discovery for Others.
              </span>
            </h2>

            <div className="mt-7 max-w-[660px] space-y-5 text-base font-medium leading-8 text-[#FFF8EC]/80">
              <p>
                At African Restaurant Estonia, we believe food can do more
                than satisfy hunger. It can bring back memories, introduce
                you to something new and bring people together.
              </p>

              <p>
                We were created to make the rich flavours of West African
                cuisine more accessible in Estonia, with a special focus on
                the Nigerian dishes we love and are proud to share.
              </p>

              <p>
                For some, a plate of jollof rice, egusi soup, fried plantain
                or a chilled bottle of zobo is a familiar taste of home.
                For others, it may be their first introduction to West
                African food.
              </p>
            </div>

            <p className="mt-7 font-[var(--font-cormorant)] text-2xl font-bold italic text-[#D89A27]">
              Both are welcome at our table.
            </p>
          </div>

          <div className="grid gap-5">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              const isBlueAccent = index === 1;

              return (
                <div
                  key={item.title}
                  className={`rounded-[24px] border p-6 backdrop-blur-sm sm:p-7 ${
                    isBlueAccent
                      ? "border-[#294B73]/70 bg-[#294B73]/35"
                      : "border-white/10 bg-white/[0.06]"
                  }`}
                >
                  <div className="flex gap-5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isBlueAccent ? "bg-[#294B73] text-[#FFF8EC]" : "bg-[#D89A27] text-[#321B29]"}`}>
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#FFF8EC]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm font-medium leading-7 text-[#FFF8EC]/70">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
