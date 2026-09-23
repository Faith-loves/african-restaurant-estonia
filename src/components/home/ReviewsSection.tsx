"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Quote,
  Star,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

const reviews = [
  {
    name: "Amara O.",
    source: "Customer Review",
    text: "The jollof rice was so flavourful, and the chicken was perfectly seasoned. Definitely coming back again!",
  },
  {
    name: "Kadri M.",
    source: "Customer Review",
    text: "My first time trying Nigerian food and I really enjoyed it. The food was fresh, filling and full of flavour.",
  },
  {
    name: "Daniel K.",
    source: "Customer Review",
    text: "Finally found a place in Tallinn where I can enjoy proper West African food. The egusi and swallow were amazing.",
  },
  {
    name: "Laura T.",
    source: "Customer Review",
    text: "Ordered jollof rice, plantain and chicken and everything tasted great. The portions were good too.",
  },
  {
    name: "Samuel A.",
    source: "Customer Review",
    text: "The food reminded me of home. I especially loved the pepper soup. Will definitely order again.",
  },
  {
    name: "Maarja P.",
    source: "Customer Review",
    text: "Really delicious food and a lovely introduction to Nigerian cuisine. The fried plantain was my favourite.",
  },
  {
    name: "David E.",
    source: "Customer Review",
    text: "Good portions, great taste and the order was nicely packed. The jollof and turkey combination was excellent.",
  },
  {
    name: "Anna L.",
    source: "Customer Review",
    text: "We ordered different dishes for the family and everyone enjoyed their meal. Lots of flavour and good variety.",
  },
  {
    name: "Michael O.",
    source: "Customer Review",
    text: "One of the best African meals I've had in Estonia. The food tasted authentic and everything was well seasoned.",
  },
  {
    name: "Sofia R.",
    source: "Customer Review",
    text: "I tried African Restaurant Estonia after a friend recommended it and I'm glad I did. Delicious food and I'll definitely be trying more from the menu.",
  },
];

const faqs = [
  {
    question:
      "Are all meals available every day?",
    answer:
      "The full menu stays visible, but only meals selected for Today's Menu, currently available and fully priced can be ordered immediately.",
  },
  {
    question:
      "Can I request food for an event or corporate catering?",
    answer:
      "Yes. Corporate catering, events and special food requests can be submitted in advance through the catering request page.",
  },
  {
    question:
      "Can I request a meal that is not on Today's Menu?",
    answer:
      "Yes. For catering, events and Food Gift Box requests, you can choose from the wider menu and the restaurant will confirm availability for your requested date.",
  },
  {
    question:
      "Where is African Restaurant Estonia located?",
    answer:
      "African Restaurant Estonia is located at NELGI 30, 11213, Tallinn.",
  },
];

export default function ReviewsSection() {
  const { t } = useLanguage();
  const [
    activeReview,
    setActiveReview,
  ] = useState(0);

  const [
    openFaq,
    setOpenFaq,
  ] = useState<number | null>(0);

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setActiveReview(
            (current) =>
              (current + 1) %
              reviews.length
          );
        },
        5000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  function previousReview() {
    setActiveReview(
      (current) =>
        current === 0
          ? reviews.length - 1
          : current - 1
    );
  }

  function nextReview() {
    setActiveReview(
      (current) =>
        (current + 1) %
        reviews.length
    );
  }

  const review =
    reviews[activeReview];

  return (
    <section
      id="reviews"
      className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-[1312px]">

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">

          {/* LEFT - REVIEWS */}
          <div className="flex flex-col">

            <div className="lg:min-h-[210px]">

              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#B9472E]">
                {t("home.reviewsEyebrow")}
              </p>

              <h2 className="mt-3 font-[var(--font-cormorant)] text-5xl font-bold leading-[0.95] text-[#321B29] sm:text-6xl">
                {t("home.reviewsTitle")}
              </h2>

              <p className="mt-5 max-w-[520px] text-sm font-semibold leading-7 text-[#151313]/55">
                Real customer experiences and feedback from African Restaurant Estonia.
              </p>

            </div>

            <div className="relative min-h-[410px] overflow-hidden rounded-[28px] bg-[#321B29] p-7 text-white shadow-[0_18px_45px_rgba(50,27,41,0.14)] sm:p-8">

              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#D89A27]/10" />

              <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-[#B9472E]/10" />

              <div className="relative z-10 flex h-full min-h-[350px] flex-col">

                <div className="flex items-center justify-between">

                  <div className="flex gap-1 text-[#D89A27]">

                    {Array.from({
                      length: 5,
                    }).map(
                      (_, index) => (
                        <Star
                          key={index}
                          size={16}
                          fill="currentColor"
                        />
                      )
                    )}

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#D89A27]">

                    <Quote
                      size={20}
                    />

                  </div>

                </div>

                <div
                  key={activeReview}
                  className="flex flex-1 flex-col"
                >

                  <p className="mt-8 flex-1 font-[var(--font-cormorant)] text-[29px] font-semibold leading-[1.25] text-white sm:text-[33px]">
                    “{review.text}”
                  </p>

                  <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D89A27] font-[var(--font-cormorant)] text-xl font-bold text-[#321B29]">
                      {review.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <div className="flex items-center gap-2">

                        <p className="font-bold text-white">
                          {review.name}
                        </p>

                        <CheckCircle2
                          size={14}
                          className="text-[#D89A27]"
                        />

                      </div>

                      <p className="mt-0.5 text-xs font-semibold text-white/45">
                        {review.source}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="mt-7 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    {reviews.map(
                      (_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            setActiveReview(
                              index
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          aria-label={`View review ${
                            index + 1
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-2 rounded-full transition-all duration-300 ${
                              activeReview === index
                                ? "w-8 bg-[#D89A27]"
                                : "w-2 bg-white/20"
                            }`}
                          />
                        </button>
                      )
                    )}

                  </div>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={
                        previousReview
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
                      aria-label={t("home.previousReview")}
                    >
                      <ChevronLeft
                        size={18}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={
                        nextReview
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
                      aria-label={t("home.nextReview")}
                    >
                      <ChevronRight
                        size={18}
                      />
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT - FAQ */}
          <div className="flex flex-col">

            <div className="lg:min-h-[210px]">

              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#B9472E]">
                {t("home.faqTitle")}
              </p>

              <h2 className="mt-3 font-[var(--font-cormorant)] text-5xl font-bold leading-[0.95] text-[#321B29] sm:text-6xl">
                Questions? We&apos;ve Got Answers.
              </h2>

              <p className="mt-5 max-w-[560px] text-sm font-semibold leading-7 text-[#151313]/55">
                Everything you need to know about ordering, Today&apos;s Menu, catering and special requests.
              </p>

            </div>

            <div className="min-h-[410px] overflow-hidden rounded-[28px] border border-[#321B29]/10 bg-[#FFF8EC] shadow-[0_12px_35px_rgba(50,27,41,0.06)]">

              {faqs.map(
                (faq, index) => {
                  const isOpen =
                    openFaq === index;

                  return (
                    <div
                      key={
                        faq.question
                      }
                      className={`border-b border-[#321B29]/10 last:border-b-0 ${
                        isOpen
                          ? "bg-white"
                          : "bg-transparent"
                      }`}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaq(
                            isOpen
                              ? null
                              : index
                          )
                        }
                        className="flex w-full items-center justify-between gap-5 px-5 py-6 text-left sm:px-6"
                      >

                        <span className="font-[var(--font-cormorant)] text-[24px] font-bold leading-tight text-[#321B29]">
                          {faq.question}
                        </span>

                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                            isOpen
                              ? "bg-[#321B29] text-[#D89A27]"
                              : "bg-white text-[#321B29]"
                          }`}
                        >

                          {isOpen ? (
                            <Minus
                              size={16}
                            />
                          ) : (
                            <Plus
                              size={16}
                            />
                          )}

                        </span>

                      </button>

                      <div
                        className={`grid transition-all duration-300 ${
                          isOpen
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }`}
                      >

                        <div className="overflow-hidden">

                          <p className="px-5 pb-6 pr-12 text-sm font-semibold leading-7 text-[#151313]/55 sm:px-6 sm:pr-16">
                            {faq.answer}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
