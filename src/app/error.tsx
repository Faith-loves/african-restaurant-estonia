"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF8EC] px-5 py-16 text-center">
      <div className="max-w-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">African Restaurant Estonia</p>
        <h1 className="mt-3 font-[var(--font-cormorant)] text-5xl font-bold text-[#321B29]">Something went wrong</h1>
        <p className="mt-4 text-sm font-semibold leading-7 text-[#151313]/65">Please try again, or return to the restaurant homepage.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="min-h-11 rounded-xl bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white">Try Again</button>
          <Link href="/" className="min-h-11 rounded-xl border border-[#321B29]/20 px-5 py-3 text-sm font-extrabold text-[#321B29]">Back Home</Link>
        </div>
      </div>
    </main>
  );
}
