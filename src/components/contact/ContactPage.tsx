"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AtSign,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

type PublicSettings = {
  restaurantName: string;
  tagline: string;
  publicEmail: string;
  phone: string;
  instagram: string;
  address: string;
};

const defaultSettings: PublicSettings = {
  restaurantName:
    "African Restaurant Estonia",

  tagline:
    "A Taste of West Africa, Right Here.",

  publicEmail:
    "africanrestaurantestonia@gmail.com",

  phone:
    "53078208",

  instagram:
    "@AFRICANRESTAURANTESTONIA",

  address:
    "NELGI 30, 11213, TALLINN",
};

export default function ContactPage() {
  const [
    settings,
    setSettings,
  ] =
    useState<PublicSettings>(
      defaultSettings
    );

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        doc(
          db,
          "settings",
          "public"
        ),
        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            return;
          }

          const data =
            snapshot.data();

          setSettings({
            restaurantName:
              typeof data.restaurantName ===
              "string"
                ? data.restaurantName
                : defaultSettings.restaurantName,

            tagline:
              typeof data.tagline ===
              "string"
                ? data.tagline
                : defaultSettings.tagline,

            publicEmail:
              typeof data.publicEmail ===
              "string"
                ? data.publicEmail
                : defaultSettings.publicEmail,

            phone:
              typeof data.phone ===
              "string"
                ? data.phone
                : defaultSettings.phone,

            instagram:
              typeof data.instagram ===
              "string"
                ? data.instagram
                : defaultSettings.instagram,

            address:
              typeof data.address ===
              "string"
                ? data.address
                : defaultSettings.address,
          });
        },
        (error) => {
          console.error(
            "Contact settings error:",
            error
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const name =
      formData
        .get("name")
        ?.toString()
        .trim() || "";

    const customerEmail =
      formData
        .get("email")
        ?.toString()
        .trim() || "";

    const subject =
      formData
        .get("subject")
        ?.toString()
        .trim() ||
      "Website Enquiry";

    const message =
      formData
        .get("message")
        ?.toString()
        .trim() || "";

    const emailSubject =
      `${subject} - ${name}`;

    const emailBody = [
      `Hello ${settings.restaurantName},`,
      "",
      message,
      "",
      "Customer details:",
      `Name: ${name}`,
      `Email: ${customerEmail}`,
      "",
      "Sent from the African Restaurant Estonia website.",
    ].join("\n");

    const mailto =
      `mailto:${settings.publicEmail}` +
      `?subject=${encodeURIComponent(
        emailSubject
      )}` +
      `&body=${encodeURIComponent(
        emailBody
      )}`;

    window.location.href =
      mailto;
  }

  return (
    <main className="min-h-screen bg-[#FFF8EC]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#321B29] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-24">

        <div className="absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full bg-[#D89A27]/10" />

        <div className="absolute -bottom-32 left-20 h-[300px] w-[300px] rounded-full bg-[#294B73]/35" />

        <div className="relative z-10 mx-auto max-w-[1312px]">

          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#D89A27]">
            Contact Us
          </p>

          <h1 className="mt-4 max-w-[760px] font-[var(--font-cormorant)] text-5xl font-bold leading-[0.9] sm:text-7xl lg:text-[88px]">
            We&apos;d Love to Hear From You.
          </h1>

          <p className="mt-6 max-w-[650px] text-sm font-semibold leading-7 text-white/65 sm:text-base">
            Questions about the menu, catering, special requests or anything else? Send African Restaurant Estonia a message.
          </p>

        </div>

      </section>

      {/* CONTACT CONTENT */}
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">

        <div className="mx-auto grid max-w-[1312px] gap-8 lg:grid-cols-[0.8fr_1.2fr]">

          {/* CONTACT INFORMATION */}
          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">
              Get in Touch
            </p>

            <h2 className="mt-3 font-[var(--font-cormorant)] text-4xl font-bold leading-none text-[#321B29] sm:text-5xl">
              Let&apos;s Talk.
            </h2>

            <p className="mt-4 max-w-[480px] text-sm font-semibold leading-7 text-[#151313]/55">
              Reach out directly or send a message using the form. We&apos;ll make it easy for you to get the information you need.
            </p>

            <div className="mt-8 space-y-3">

              <ContactCard
                icon={Mail}
                label="Email"
                value={
                  settings.publicEmail
                }
                href={`mailto:${settings.publicEmail}`}
              />

              <ContactCard
                icon={Phone}
                label="Phone"
                value={
                  settings.phone
                }
                href={`tel:${settings.phone}`}
              />

              <ContactCard
                icon={MapPin}
                label="Location"
                value={
                  settings.address
                }
              />

              <ContactCard
                icon={AtSign}
                label="Instagram"
                value={
                  settings.instagram
                }
                href={`https://www.instagram.com/${settings.instagram.replace(/^@/, "")}/`}
                external
              />

            </div>

            <div className="mt-6 rounded-[22px] bg-[#D89A27]/15 p-5">

              <div className="flex items-start gap-3">

                <Clock3
                  size={18}
                  className="mt-1 shrink-0 text-[#B9472E]"
                />

                <div>

                  <p className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                    Planning ahead?
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-6 text-[#151313]/55">
                    For corporate catering, events and Food Gift Box requests, use our dedicated catering request page.
                  </p>

                  <a
                    href="/catering"
                    className="mt-4 inline-flex rounded-lg bg-[#321B29] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
                  >
                    Catering Requests
                  </a>

                </div>

              </div>

            </div>

          </div>

          {/* MESSAGE FORM */}
          <div className="rounded-[30px] border border-[#321B29]/10 bg-white p-6 shadow-[0_18px_50px_rgba(50,27,41,0.08)] sm:p-8 lg:p-10">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#294B73] text-[#FFF8EC]">
                <MessageCircle
                  size={20}
                />
              </div>

              <div>

                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#B9472E]">
                  Direct Message
                </p>

                <h2 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                  Send Us a Message
                </h2>

              </div>

            </div>

            <p className="mt-5 text-sm font-semibold leading-7 text-[#151313]/50">
              Fill in your message below. When you click send, your email app will open with everything ready to send directly to the restaurant.
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <ContactField
                  label="Your Name"
                  name="name"
                  placeholder="Full name"
                  required
                />

                <ContactField
                  label="Your Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />

              </div>

              <div className="mt-5">

                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-bold text-[#321B29]"
                >
                  What is this about?
                </label>

                <select
                  id="subject"
                  name="subject"
                  className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3.5 text-sm font-semibold text-[#321B29] outline-none transition focus:border-[#D89A27]"
                >
                  <option>
                    General Enquiry
                  </option>

                  <option>
                    Menu Question
                  </option>

                  <option>
                    Order Question
                  </option>

                  <option>
                    Catering Enquiry
                  </option>

                  <option>
                    Food Gift Box
                  </option>

                  <option>
                    Other
                  </option>
                </select>

              </div>

              <div className="mt-5">

                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-bold text-[#321B29]"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={7}
                  required
                  placeholder="Tell us how we can help..."
                  className="no-scrollbar w-full resize-none rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3.5 text-sm font-semibold leading-7 text-[#321B29] outline-none transition placeholder:text-[#321B29]/30 focus:border-[#D89A27]"
                />

              </div>

              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#321B29] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
              >
                <Send
                  size={17}
                />

                Send Message by Email
              </button>

            </form>

          </div>

        </div>

      </section>

    </main>
  );
}

type ContactCardProps = {
  icon:
    React.ComponentType<{
      size?: number;
    }>;

  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  external = false,
}: ContactCardProps) {
  const content = (
    <div className="group flex items-center gap-4 rounded-[18px] border border-[#321B29]/10 bg-white p-4 transition hover:border-[#D89A27]">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#321B29] text-[#D89A27]">
        <Icon
          size={18}
        />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-bold text-[#321B29]">
          {value}
        </p>

      </div>

    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block"
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }

  return content;
}

type ContactFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
};

function ContactField({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: ContactFieldProps) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-[#321B29]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3.5 text-sm font-semibold text-[#321B29] outline-none transition placeholder:text-[#321B29]/30 focus:border-[#D89A27]"
      />

    </div>
  );
}
