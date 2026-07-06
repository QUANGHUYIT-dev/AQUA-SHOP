import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "teal" | "blue" | "amber" | "violet";
}

const ACCENT_STYLES = {
  teal: "bg-teal-50 text-teal-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
};

export default function AdminStatCard({
  label,
  value,
  icon: Icon,
  accent = "teal",
}: AdminStatCardProps) {
  return (
    <div className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ocean-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center ${ACCENT_STYLES[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
