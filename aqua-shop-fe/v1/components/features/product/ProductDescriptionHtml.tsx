"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const COLLAPSED_MAX_HEIGHT_PX = 320;

interface ProductDescriptionHtmlProps {
  html: string;
  className?: string;
  /** Bật nút "Xem thêm" khi nội dung dài. Mặc định: true */
  collapsible?: boolean;
}

export default function ProductDescriptionHtml({
  html,
  className = "",
  collapsible = true,
}: ProductDescriptionHtmlProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canCollapse, setCanCollapse] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [html]);

  useEffect(() => {
    if (!collapsible) {
      setCanCollapse(false);
      return;
    }

    const element = contentRef.current;
    if (!element) return;

    const update = () => {
      setCanCollapse(element.scrollHeight > COLLAPSED_MAX_HEIGHT_PX);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [html, collapsible]);

  const isCollapsed = collapsible && canCollapse && !expanded;

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={contentRef}
          className={`product-description-html text-left text-slate-600 transition-[max-height] duration-300 ease-in-out ${
            isCollapsed ? "overflow-hidden" : ""
          }`}
          style={
            isCollapsed
              ? { maxHeight: COLLAPSED_MAX_HEIGHT_PX }
              : undefined
          }
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {isCollapsed && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent"
            aria-hidden="true"
          />
        )}
      </div>

      {collapsible && canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
}
