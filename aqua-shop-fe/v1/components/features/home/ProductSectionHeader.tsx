import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface ProductSectionHeaderProps {
  title: string;
  icon: LucideIcon;
  viewAllHref?: string;
}

export default function ProductSectionHeader({
  title,
  icon: Icon,
  viewAllHref,
}: ProductSectionHeaderProps) {
  return (
    <div className="mb-5 flex min-h-[42px]">
      <div
        className="relative flex shrink-0 items-center gap-2.5 bg-[#c82229] py-3 pl-4 pr-6 text-white shadow-[0_3px_10px_rgba(200,34,41,0.28)] sm:gap-3 sm:pl-5 sm:pr-7"
        style={{
          clipPath: "polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)",
        }}
      >
        <Icon className="h-[18px] w-[18px] shrink-0 sm:h-5 sm:w-5" strokeWidth={2.2} />
        <h2 className="whitespace-nowrap text-[12px] font-extrabold uppercase leading-none tracking-[0.14em] sm:text-[13px]">
          {title}
        </h2>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-end">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-px flex-1 bg-neutral-300" aria-hidden />
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="group flex shrink-0 items-center gap-1 pb-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-600 transition-colors hover:text-teal-700 sm:text-xs"
            >
              Xem tất cả
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
