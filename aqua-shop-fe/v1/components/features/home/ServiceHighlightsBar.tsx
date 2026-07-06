"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Headphones, Truck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceHighlight {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SERVICE_HIGHLIGHTS: ServiceHighlight[] = [
  {
    icon: Truck,
    title: "Giao hàng toàn quốc",
    description:
      "Liên kết với các đơn vị vận chuyển uy tín, đảm bảo giao hàng nhanh và an toàn",
  },
  {
    icon: Wallet,
    title: "Thanh toán tiện lợi",
    description: "Hỗ trợ thanh toán tiền mặt hoặc thẻ từ các ngân hàng",
  },
  {
    icon: Headphones,
    title: "Chăm sóc 24/7",
    description: "Chăm sóc khách hàng 24/7. Giải đáp mọi thắc mắc",
  },
  {
    icon: BadgeCheck,
    title: "Sản phẩm chính hãng",
    description: "Sản phẩm chính hãng đến từ các thương hiệu uy tín",
  },
];

export default function ServiceHighlightsBar() {
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const snapBack = useCallback(() => {
    setIsDragging(false);
    setIsSnapping(true);
    setOffset(0);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    setIsSnapping(false);
    setIsDragging(true);
    dragStartX.current = event.clientX;
    dragStartOffset.current = offsetRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = event.clientX - dragStartX.current;
    setOffset(dragStartOffset.current + delta);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    snapBack();
  };

  return (
    <section
      aria-label="Cam kết dịch vụ"
      className="border-y border-slate-200 bg-white"
    >
      <div
        className={`touch-pan-y overflow-hidden select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="mx-auto flex max-w-7xl"
          style={{
            transform: `translate3d(${offset}px, 0, 0)`,
            transition: isSnapping
              ? "transform 450ms cubic-bezier(0.34, 1.25, 0.64, 1)"
              : "none",
          }}
          onTransitionEnd={() => setIsSnapping(false)}
        >
          {SERVICE_HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="flex min-w-[240px] flex-1 items-center gap-3 border-slate-100 px-4 py-4 sm:min-w-0 sm:gap-4 sm:px-6 sm:py-5 lg:px-8 [&:not(:last-child)]:border-r"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center sm:h-12 sm:w-12">
                <item.icon
                  className="h-9 w-9 text-red-500 sm:h-10 sm:w-10"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-800 sm:text-[13px]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500 sm:text-xs">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
