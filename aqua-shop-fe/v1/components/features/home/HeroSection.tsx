import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ocean-950 via-ocean-900 to-teal-900">
      <div className="mx-auto flex min-h-[320px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8 lg:min-h-[380px]">
        <div className="max-w-xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-teal-300">
            Aqua Shop
          </p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Mang thiên nhiên vào không gian của bạn
          </h1>
          <p className="mb-8 text-base text-slate-200 sm:text-lg">
            Khám phá cá cảnh, cây thủy sinh và phụ kiện cao cấp
          </p>
          <Link
            href="#san-pham"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
          >
            Mua ngay
          </Link>
        </div>
      </div>
    </section>
  );
}
