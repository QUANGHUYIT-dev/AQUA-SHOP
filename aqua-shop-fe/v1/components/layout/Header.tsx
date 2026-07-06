"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fish, Loader2, Search, ShoppingCart } from "lucide-react";
import { getProductDetailPath, ROUTES } from "@/constants/routes";
import { filterProducts } from "@/lib/api";
import { isValidImageUrl, resolveProductThumbnailUrl } from "@/lib/image-utils";
import type { Product } from "@/types/product";
import { formatPrice, getProductPriceDisplay } from "@/utils/product-utils";

const SEARCH_DEBOUNCE_MS = 500;
const SEARCH_SUGGESTION_LIMIT = 5;
const MIN_SEARCH_QUERY_LENGTH = 2;

interface HeaderProps {
  cartCount?: number;
  initialSearchQuery?: string;
}

export default function Header({
  cartCount = 0,
  initialSearchQuery = "",
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const trimmedSearchQuery = searchQuery.trim();
  const shouldShowSuggestions =
    isSearchFocused &&
    (trimmedSearchQuery.length >= MIN_SEARCH_QUERY_LENGTH || isSuggesting);

  const submitSearch = useCallback(() => {
    const trimmedUrlQuery = urlSearchQuery.trim();

    if (!trimmedSearchQuery) {
      if (pathname === ROUTES.SEARCH && trimmedUrlQuery) {
        router.push(ROUTES.SEARCH);
      }
      return;
    }

    if (pathname === ROUTES.SEARCH && trimmedSearchQuery === trimmedUrlQuery) return;

    setIsSearchFocused(false);
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmedSearchQuery)}`);
  }, [pathname, router, trimmedSearchQuery, urlSearchQuery]);

  useEffect(() => {
    if (trimmedSearchQuery.length < MIN_SEARCH_QUERY_LENGTH) return;

    let cancelled = false;

    const loadSuggestions = async () => {
      setIsSuggesting(true);
      try {
        const page = await filterProducts({
          search: trimmedSearchQuery,
          status: "ACTIVE",
          page: 0,
          size: SEARCH_SUGGESTION_LIMIT,
          sort: "name,asc",
        });

        if (!cancelled) {
          setSuggestions(page.content.slice(0, SEARCH_SUGGESTION_LIMIT));
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setIsSuggesting(false);
      }
    };

    const timer = window.setTimeout(loadSuggestions, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch();
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);

    if (value.trim().length < MIN_SEARCH_QUERY_LENGTH) {
      setSuggestions([]);
      setIsSuggesting(false);
    }
  };

  const handleSearchBlur = () => {
    window.setTimeout(() => setIsSearchFocused(false), 120);
  };

  const renderSuggestions = () => {
    if (!shouldShowSuggestions) return null;

    const renderHighlightedName = (name: string) => {
      const matchIndex = name
        .toLocaleLowerCase("vi-VN")
        .indexOf(trimmedSearchQuery.toLocaleLowerCase("vi-VN"));

      if (matchIndex < 0) return name;

      const before = name.slice(0, matchIndex);
      const match = name.slice(
        matchIndex,
        matchIndex + trimmedSearchQuery.length,
      );
      const after = name.slice(matchIndex + trimmedSearchQuery.length);

      return (
        <>
          {before}
          <mark className="rounded bg-yellow-100 px-0.5 font-semibold text-ocean-900">
            {match}
          </mark>
          {after}
        </>
      );
    };

    return (
      <div
        className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
        onMouseDown={(event) => event.preventDefault()}
      >
        {isSuggesting ? (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tìm sản phẩm...
          </div>
        ) : suggestions.length > 0 ? (
          <>
            <ul className="max-h-80 overflow-y-auto py-1">
              {suggestions.map((product) => {
                const detailHref = product.slug
                  ? getProductDetailPath(product.slug)
                  : `${ROUTES.SEARCH}?q=${encodeURIComponent(product.name)}`;
                const imageSrc = resolveProductThumbnailUrl(
                  product.thumbnailUrl,
                  product.productType,
                );
                const priceInfo = getProductPriceDisplay(product);

                return (
                  <li key={product.id}>
                    <Link
                      href={detailHref}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-teal-50"
                      onClick={() => setIsSearchFocused(false)}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        {isValidImageUrl(imageSrc) ? (
                          <Image
                            src={imageSrc}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-ocean-900">
                          {renderHighlightedName(product.name)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {product.categoryName || "Sản phẩm"}
                        </p>
                      </div>
                      {priceInfo && (
                        <span className="shrink-0 text-sm font-semibold text-teal-700">
                          {formatPrice(priceInfo.displayPrice)}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              type="submit"
              className="flex w-full items-center justify-center border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-[#ee4d2d] hover:bg-slate-50"
            >
              Xem tất cả kết quả cho &quot;{trimmedSearchQuery}&quot;
            </button>
          </>
        ) : (
          <div className="px-4 py-3 text-sm text-slate-500">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="border-b border-teal-100/80 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            href={ROUTES.HOME}
            className="group flex w-10 shrink-0 items-center gap-2 sm:w-[200px]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-600 to-teal-500 shadow-md transition-transform group-hover:scale-105">
              <Fish className="h-5 w-5 text-white" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <span className="text-xl font-bold tracking-tight text-ocean-900">
                Aqua Shop
              </span>
              <p className="text-[10px] font-medium uppercase tracking-widest text-teal-600">
                Thủy sinh cao cấp
              </p>
            </div>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden flex-1 max-w-xl md:flex"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="search"
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={handleSearchBlur}
                placeholder="Tìm kiếm cá, cây thủy sinh, phụ kiện..."
                autoComplete="off"
                spellCheck={false}
                suppressHydrationWarning
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
              {renderSuggestions()}
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.CART}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-teal-50 hover:text-ocean-800"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="mobile-search"
              value={searchQuery}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={handleSearchBlur}
              placeholder="Tìm kiếm sản phẩm..."
              autoComplete="off"
              spellCheck={false}
              suppressHydrationWarning
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            {renderSuggestions()}
          </div>
        </form>
      </div>
    </header>
  );
}
