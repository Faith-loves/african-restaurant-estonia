import {
  Bike,
  ShoppingBag,
  ChefHat,
  Sparkles,
} from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-[#321B29] text-[#FFF8EC]">
      <div className="announcement-track flex w-max items-center py-2 text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm">
        <AnnouncementItems />
        <AnnouncementItems />
      </div>
    </div>
  );
}

function AnnouncementItems() {
  return (
    <div className="flex shrink-0 items-center gap-10 px-6 sm:gap-14">
      <span className="flex items-center gap-2">
        <Bike size={16} className="text-[#D89A27]" />
        Delivery Available
      </span>

      <span className="text-[#D89A27]">•</span>

      <span className="flex items-center gap-2">
        <ShoppingBag size={16} className="text-[#D89A27]" />
        Pickup Available
      </span>

      <span className="text-[#D89A27]">•</span>

      <span className="flex items-center gap-2">
        <ChefHat size={16} className="text-[#D89A27]" />
        We Cook Fresh Daily
      </span>

      <span className="text-[#D89A27]">•</span>

      <span className="flex items-center gap-2">
        <Sparkles size={16} className="text-[#D89A27]" />
        A Taste of West Africa, Right Here
      </span>

      <span className="text-[#D89A27]">•</span>
    </div>
  );
}
