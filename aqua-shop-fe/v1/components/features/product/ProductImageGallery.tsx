"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { ProductImage } from "@/types/product";
import { isValidImageUrl } from "@/lib/image-utils";

const AUTO_PLAY_MS = 4500;

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef(0);

  const validImages = useMemo(
    () => images.filter((image) => isValidImageUrl(image.imageUrl)),
    [images],
  );

  const imageCount = validImages.length;
  const hasMultiple = imageCount > 1;
  const safeActiveIndex = imageCount ? Math.min(activeIndex, imageCount - 1) : 0;
  const activeImage = validImages[safeActiveIndex];

  const goTo = useCallback(
    (index: number) => {
      if (!imageCount) return;
      setActiveIndex((index + imageCount) % imageCount);
    },
    [imageCount],
  );

  const goNext = useCallback(
    () => goTo(safeActiveIndex + 1),
    [goTo, safeActiveIndex],
  );
  const goPrev = useCallback(
    () => goTo(safeActiveIndex - 1),
    [goTo, safeActiveIndex],
  );

  useEffect(() => {
    if (!hasMultiple || isPaused || lightboxOpen) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % imageCount);
    }, AUTO_PLAY_MS);

    return () => clearInterval(timer);
  }, [hasMultiple, imageCount, isPaused, lightboxOpen]);

  useEffect(() => {
    const activeThumb = thumbRefs.current[safeActiveIndex];
    activeThumb?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [safeActiveIndex]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, lightboxOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple) return;

    const endX = e.changedTouches[0]?.clientX ?? 0;
    const delta = endX - touchStartX.current;

    if (delta > 48) goPrev();
    else if (delta < -48) goNext();
  };

  if (!imageCount) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-slate-100 bg-white text-sm text-slate-400 shadow-sm">
        Chưa có hình ảnh
      </div>
    );
  }

  return (
    <>
      <div
        className="grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsPaused(false);
          }
        }}
      >
        {hasMultiple && (
          <div className="order-2 lg:order-1 lg:sticky lg:top-4">
            <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:max-h-[560px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1 [&::-webkit-scrollbar]:hidden">
              {validImages.map((image, index) => {
                const isActive = index === safeActiveIndex;

                return (
                  <button
                    key={image.imageId || `${image.imageUrl}-thumb-${index}`}
                    ref={(el) => {
                      thumbRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Xem ảnh ${index + 1}`}
                    aria-pressed={isActive ? "true" : "false"}
                    className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border bg-white p-1.5 transition-all duration-300 sm:h-20 sm:w-20 lg:h-[84px] lg:w-[84px] ${
                      isActive
                        ? "border-teal-500 shadow-md ring-2 ring-teal-100"
                        : "border-slate-100 opacity-75 hover:border-teal-200 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText ?? `${productName} ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="84px"
                    />
                    {image.isPrimary && (
                      <span className="absolute bottom-1 left-1 right-1 rounded-full bg-ocean-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        Chính
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="order-1 lg:order-2">
          <div
            className="group relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f8fafc_0,#ffffff_62%,#f1f5f9_100%)]" />

            {validImages.map((image, index) => (
              <div
                key={image.imageId || `${image.imageUrl}-${index}`}
                className={`absolute inset-0 transition-all duration-500 ease-out ${
                  index === safeActiveIndex
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-[0.98] opacity-0"
                }`}
              >
                <div className="absolute inset-4 sm:inset-8">
                  <Image
                    src={image.imageUrl}
                    alt={image.altText ?? `${productName} ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white hover:text-ocean-900"
              aria-label="Phóng to ảnh"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md backdrop-blur transition-all hover:bg-white group-hover:opacity-100 focus:opacity-100 sm:left-4 sm:h-10 sm:w-10"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md backdrop-blur transition-all hover:bg-white group-hover:opacity-100 focus:opacity-100 sm:right-4 sm:h-10 sm:w-10"
                  aria-label="Ảnh tiếp"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1.5 shadow-sm backdrop-blur">
                  {validImages.map((image, index) => (
                    <button
                      key={image.imageId || `${image.imageUrl}-dot-${index}`}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === safeActiveIndex
                          ? "w-5 bg-teal-500"
                          : "w-1.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Xem ảnh ${index + 1}`}
                    />
                  ))}
                </div>

                <span className="absolute bottom-3 right-3 rounded-full bg-ocean-900/80 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
                  {safeActiveIndex + 1}/{imageCount}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-[80] bg-ocean-950/95"
          role="dialog"
          aria-modal="true"
          aria-label={productName}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Ảnh tiếp"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="flex h-full flex-col">
            <div className="relative min-h-0 flex-1">
              <div className="absolute inset-4 sm:inset-8 lg:inset-12">
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.altText ?? `${productName} ${safeActiveIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 text-white sm:px-6">
              <p className="min-w-0 truncate text-sm font-medium">
                {activeImage.altText ?? productName}
              </p>
              {hasMultiple && (
                <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                  {safeActiveIndex + 1}/{imageCount}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
