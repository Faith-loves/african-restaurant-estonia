import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFF8EC] px-5 py-16 text-center">
      <div className="max-w-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">African Restaurant Estonia</p>
        <h1 className="mt-3 font-[var(--font-cormorant)] text-6xl font-bold text-[#321B29]">Page Not Found</h1>
        <p className="mt-4 text-sm font-semibold leading-7 text-[#151313]/65">That page does not seem to be available. Let&apos;s get you back to something delicious.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="min-h-11 rounded-xl bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white">Back Home</Link>
          <Link href="/menu" className="min-h-11 rounded-xl border border-[#321B29]/20 px-5 py-3 text-sm font-extrabold text-[#321B29]">View Menu</Link>
        </div>
      </div>
    </main>
  );
}
