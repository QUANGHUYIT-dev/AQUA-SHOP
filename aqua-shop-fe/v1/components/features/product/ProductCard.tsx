"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import type { MouseEvent } from "react";
import type { Product } from "@/types/product";
import { getProductDetailPath } from "@/constants/routes";
import {
  formatPrice,
  formatSoldCount,
  getProductPriceDisplay,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_STYLES,
} from "@/utils/product-utils";
import { isValidImageUrl, resolveProductThumbnailUrl } from "@/lib/image-utils";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

function handleCardClick(event: MouseEvent<HTMLAnchorElement>) {
  const carousel = event.currentTarget.closest("[data-product-carousel]");
  if (carousel?.getAttribute("data-suppress-click") === "true") {
    event.preventDefault();
  }
}

export default function ProductCard({
  product,
  categoryName,
}: ProductCardProps) {
  const priceInfo = getProductPriceDisplay(product);
  const typeStyle = PRODUCT_TYPE_STYLES[product.productType];
  const displayCategory = product.categoryName ?? categoryName;
  const detailHref = product.slug ? getProductDetailPath(product.slug) : null;

  const content = (
    <ProductCardMedia
      product={product}
      typeStyle={typeStyle}
      displayCategory={displayCategory}
      priceInfo={priceInfo}
    />
  );

  return (
    <article className="group transition-transform duration-300 hover:-translate-y-1">
      {detailHref ? (
        <Link href={detailHref} className="block" onClick={handleCardClick}>
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}

interface ProductCardMediaProps {
  product: Product;
  typeStyle: (typeof PRODUCT_TYPE_STYLES)[Product["productType"]];
  displayCategory?: string;
  priceInfo: ReturnType<typeof getProductPriceDisplay>;
}

function ProductCardMedia({
  product,
  typeStyle,
  displayCategory,
  priceInfo,
}: ProductCardMediaProps) {
  const imageSrc = resolveProductThumbnailUrl(
    product.thumbnailUrl,
    product.productType,
  );

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 shadow-[0_2px_12px_rgba(15,41,66,0.06)] transition-shadow duration-300 group-hover:shadow-[0_8px_24px_rgba(15,41,66,0.1)]">
        <div className="relative aspect-[4/5] w-full">
          <div className="absolute inset-4 sm:inset-5">
            {isValidImageUrl(imageSrc) ? (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
                draggable={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Chưa có ảnh
              </div>
            )}
          </div>
        </div>
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${typeStyle.bg} ${typeStyle.text}`}
        >
          {PRODUCT_TYPE_LABELS[product.productType]}
        </span>

        {(product.totalSold ?? 0) > 0 ? (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-bold text-[#c82229] shadow-[0_2px_8px_rgba(15,41,66,0.12)] backdrop-blur-sm sm:text-sm">
            <Flame
              className="animate-flame-flicker h-4.5 w-4.5 fill-orange-500 text-orange-500 sm:h-5 sm:w-5"
              aria-hidden
            />
            <span>x {formatSoldCount(product.totalSold!)}</span>
          </span>
        ) : null}
      </div>

      <div className="pt-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ocean-900 transition-colors group-hover:text-teal-700 sm:min-h-11 sm:text-[15px]">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 min-h-4 text-xs leading-4 text-slate-400">
          {displayCategory || "Chưa phân loại"}
        </p>

        <div className="mt-2 flex min-h-7 flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:gap-x-3">
          {priceInfo ? (
            <>
              {priceInfo.salePrice != null && (
                <span className="text-xs text-slate-400 line-through sm:text-sm">
                  {formatPrice(priceInfo.price)}
                </span>
              )}
              <span className="text-base font-bold text-ocean-800 sm:text-lg">
                {priceInfo.priceFrom
                  ? `Từ ${formatPrice(priceInfo.displayPrice)}`
                  : formatPrice(priceInfo.displayPrice)}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-400">Liên hệ</span>
          )}
        </div>
      </div>
    </>
  );
}
