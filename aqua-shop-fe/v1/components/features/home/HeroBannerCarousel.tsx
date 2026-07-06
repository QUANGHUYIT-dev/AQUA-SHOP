"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Banner } from "@/types/banner";
import { getActiveBanners } from "@/lib/api";
import { getBannerProductHref } from "@/lib/banner-utils";
import {
  BANNER_HERO_FRAME_CLASS,
  BANNER_IMAGE_CLASS,
  resolveBannerDisplayUrl,
} from "@/lib/banner-image";
import { isValidImageUrl } from "@/lib/image-utils";

const AUTO_PLAY_MS = 5500;
/** Bắt đầu coi là kéo (không còn là click) */
const DRAG_START_THRESHOLD_PX = 10;
/** Vuốt đủ xa để chuyển slide */
const SWIPE_THRESHOLD_PX = 50;

export default function HeroBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const activePointerId = useRef<number | null>(null);
  const isDragging = useRef(false);
  const suppressClick = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getActiveBanners();
        if (!cancelled) setBanners(data);
      } catch {
        if (!cancelled) setBanners([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (!banners.length) return;
      const normalized =
        ((index % banners.length) + banners.length) % banners.length;
      setActiveIndex(normalized);
    },
    [banners.length],
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (banners.length <= 1) return;
    if (event.button !== 0) return;

    activePointerId.current = event.pointerId;
    dragStartX.current = event.clientX;
    dragStartY.current = event.clientY;
    isDragging.current = false;
    suppressClick.current = false;
    setIsPaused(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;

    const deltaX = event.clientX - dragStartX.current;
    const deltaY = event.clientY - dragStartY.current;

    if (isDragging.current) return;

    if (
      Math.abs(deltaX) > DRAG_START_THRESHOLD_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      isDragging.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;

    const deltaX = event.clientX - dragStartX.current;
    const deltaY = event.clientY - dragStartY.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (isDragging.current) {
      if (absDeltaX >= SWIPE_THRESHOLD_PX && absDeltaX > absDeltaY) {
        if (deltaX < 0) {
          goNext();
        } else {
          goPrev();
        }
        suppressClick.current = true;
      } else if (absDeltaX > DRAG_START_THRESHOLD_PX) {
        suppressClick.current = true;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }

    isDragging.current = false;
    activePointerId.current = null;
  };

  const handleBannerClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!suppressClick.current) return;

    event.preventDefault();
    suppressClick.current = false;
  };

  const handleControlPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
  };

  useEffect(() => {
    if (!banners.length || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timer);
  }, [banners.length, isPaused]);

  if (loading || !banners.length) {
    return null;
  }

  return (
    <section
      className="relative bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Banner thương hiệu"
    >
      <div
        className={`${BANNER_HERO_FRAME_CLASS} cursor-grab touch-pan-y select-none active:cursor-grabbing`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {banners.map((banner, index) => {
          const isActive = index === activeIndex;
          const href = getBannerProductHref(banner);
          const label = banner.brandName || "Thương hiệu";

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 flex items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <Link
                href={href}
                className="flex h-full w-full items-center justify-center"
                draggable={false}
                onClick={handleBannerClick}
                aria-label={`Xem sản phẩm ${label}`}
              >
                {isValidImageUrl(banner.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveBannerDisplayUrl(banner.imageUrl)}
                    alt={label}
                    className={BANNER_IMAGE_CLASS}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                ) : (
                  <div className="h-40 w-full bg-slate-100" />
                )}
              </Link>
            </div>
          );
        })}

        {banners.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Banner ${index + 1}`}
                onPointerDown={handleControlPointerDown}
                onClick={() => goTo(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-[#c82229]"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div
        className="banner-red-line relative h-[3px] w-full overflow-hidden bg-[#c82229]"
        aria-hidden
      >
        <span className="banner-red-line-shine" />
      </div>
    </section>
  );
}
