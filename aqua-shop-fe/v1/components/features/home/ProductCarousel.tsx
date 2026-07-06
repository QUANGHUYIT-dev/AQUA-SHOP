"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DRAG_THRESHOLD_PX = 6;

interface ProductCarouselProps {
  children: ReactNode;
}

export default function ProductCarousel({ children }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const pointerId = useRef<number | null>(null);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [children, updateScrollState]);

  const markSuppressClick = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.setAttribute("data-suppress-click", "true");
    window.setTimeout(() => {
      el.removeAttribute("data-suppress-click");
    }, 300);
  }, []);

  const endPointerSession = useCallback(
    (event: PointerEvent) => {
      if (pointerId.current === null || event.pointerId !== pointerId.current) {
        return;
      }

      const el = scrollRef.current;
      const wasDragging = isDragging.current;

      if (wasDragging) {
        markSuppressClick();
        event.preventDefault();
      }

      pointerId.current = null;
      isDragging.current = false;
      el?.classList.remove("cursor-grabbing");
      updateScrollState();
    },
    [markSuppressClick, updateScrollState],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (pointerId.current === null || event.pointerId !== pointerId.current) {
        return;
      }

      const el = scrollRef.current;
      if (!el) return;

      const delta = event.clientX - startX.current;

      if (!isDragging.current) {
        if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
        isDragging.current = true;
        el.classList.add("cursor-grabbing");
      }

      event.preventDefault();
      el.scrollLeft = startScrollLeft.current - delta;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", endPointerSession);
    window.addEventListener("pointercancel", endPointerSession);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endPointerSession);
      window.removeEventListener("pointercancel", endPointerSession);
    };
  }, [endPointerSession]);

  const scrollByPage = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = Math.max(el.clientWidth * 0.75, 240);
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const el = scrollRef.current;
    if (!el) return;

    pointerId.current = event.pointerId;
    startX.current = event.clientX;
    startScrollLeft.current = el.scrollLeft;
    isDragging.current = false;
  };

  return (
    <div className="group/carousel relative">
      {canScrollLeft ? (
        <button
          type="button"
          aria-label="Xem sản phẩm trước"
          onClick={() => scrollByPage("left")}
          className="absolute -left-2 top-[38%] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#c82229]/15 bg-white text-[#c82229] shadow-[0_4px_14px_rgba(200,34,41,0.18)] transition hover:bg-[#c82229] hover:text-white sm:flex lg:-left-4"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
      ) : null}

      {canScrollRight ? (
        <button
          type="button"
          aria-label="Xem sản phẩm tiếp"
          onClick={() => scrollByPage("right")}
          className="absolute -right-2 top-[38%] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#c82229]/15 bg-white text-[#c82229] shadow-[0_4px_14px_rgba(200,34,41,0.18)] transition hover:bg-[#c82229] hover:text-white sm:flex lg:-right-4"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      ) : null}

      <div
        ref={scrollRef}
        data-product-carousel=""
        onScroll={updateScrollState}
        onPointerDown={handlePointerDown}
        className="flex cursor-grab gap-3 overflow-x-auto pb-2 select-none sm:gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
