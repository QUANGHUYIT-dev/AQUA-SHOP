"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, X } from "lucide-react";
import type { Category } from "@/types/product";
import { ROUTES } from "@/constants/routes";
import { getNavParentCategories } from "@/lib/api";
import CategoryMegaMenu, {
  getCategoryIcon,
} from "@/components/layout/CategoryMegaMenu";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function CategoryNavBar() {
  const pathname = usePathname();
  const megaMenuButtonRef = useRef<HTMLButtonElement>(null);
  const [navParents, setNavParents] = useState<Category[]>([]);
  const [megaRoots, setMegaRoots] = useState<Category[]>([]);
  const [mobileMegaOpen, setMobileMegaOpen] = useState(false);

  useEffect(() => {
    megaMenuButtonRef.current?.setAttribute(
      "aria-expanded",
      mobileMegaOpen ? "true" : "false",
    );
  }, [mobileMegaOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const parents = await getNavParentCategories();

        if (cancelled) return;

        setNavParents(parents);
        setMegaRoots(parents);
      } catch {
        if (!cancelled) {
          setNavParents([]);
          setMegaRoots([]);
        }
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav
      aria-label="Danh mục sản phẩm"
      className="relative bg-[#9b1c31] text-white"
    >
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="group/mega relative shrink-0">
          <button
            ref={megaMenuButtonRef}
            type="button"
            onClick={() => setMobileMegaOpen((open) => !open)}
            className="flex h-full items-center gap-2.5 bg-[#001a33] px-4 py-3 text-left sm:px-5 lg:py-3.5"
            aria-expanded="false"
            aria-controls="category-mega-menu"
          >
            {mobileMegaOpen ? (
              <X className="h-5 w-5 shrink-0 lg:hidden" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            <span className="text-xs font-bold uppercase tracking-wide sm:text-sm">
              Danh mục sản phẩm
            </span>
          </button>

          <div id="category-mega-menu" className="hidden lg:contents">
            <CategoryMegaMenu roots={megaRoots} />
          </div>

          {mobileMegaOpen && (
            <div className="absolute left-0 right-0 top-full z-50 border-t border-[#7a1528] lg:hidden">
              <CategoryMegaMenu
                roots={megaRoots}
                variant="mobile"
                onNavigate={() => setMobileMegaOpen(false)}
              />
            </div>
          )}
        </div>

        <ul className="hidden flex-1 items-stretch lg:flex">
          <li className="flex flex-1">
            <Link
              href={ROUTES.HOME}
              className={`flex flex-1 items-center justify-center gap-2 px-3 py-3.5 text-xs font-semibold uppercase tracking-wide transition-colors xl:px-5 xl:text-sm ${
                pathname === ROUTES.HOME
                  ? "bg-[#7a1528] text-white"
                  : "text-white hover:bg-[#7a1528]/80"
              }`}
            >
              <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
              Trang chủ
            </Link>
          </li>

          {navParents.map((parent) => {
            const href = `/${parent.slug}`;
            const active = isActivePath(pathname, href);
            const Icon = getCategoryIcon(parent.slug);

            return (
              <li key={parent.id} className="flex flex-1">
                <Link
                  href={href}
                  className={`flex flex-1 items-center justify-center gap-2 px-3 py-3.5 text-xs font-semibold uppercase tracking-wide transition-colors xl:px-5 xl:text-sm ${
                    active
                      ? "bg-[#7a1528] text-white"
                      : "text-white hover:bg-[#7a1528]/80"
                  }`}
                >
                  {Icon && (
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  {parent.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
