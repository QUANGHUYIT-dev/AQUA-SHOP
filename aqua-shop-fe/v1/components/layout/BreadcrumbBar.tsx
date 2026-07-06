"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbBar({ items }: BreadcrumbBarProps) {
  const visibleItems = items.filter((item) => item.label.trim().length > 0);

  if (visibleItems.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="bg-[#eeeeee] text-ocean-900">
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex min-h-10 items-center gap-2 whitespace-nowrap text-xs sm:text-sm">
          <li className="flex items-center">
            <Link
              href={ROUTES.HOME}
              className="text-slate-700 transition-colors hover:text-[#9b1c31]"
            >
              Trang chủ
            </Link>
          </li>

          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center gap-2"
              >
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-slate-500"
                  aria-hidden="true"
                />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-slate-700 transition-colors hover:text-[#9b1c31]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast
                        ? "font-semibold text-ocean-900"
                        : "text-slate-700"
                    }
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
