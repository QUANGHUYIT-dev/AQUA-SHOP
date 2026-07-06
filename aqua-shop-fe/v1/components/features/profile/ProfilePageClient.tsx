"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Crown,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
  Wallet,
} from "lucide-react";
import type { MembershipTier } from "@/types/auth";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatPrice } from "@/utils/product-utils";
import { ROUTES } from "@/constants/routes";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";

const MEMBERSHIP_TIER_LABELS: Record<MembershipTier, string> = {
  BRONZE: "Đồng",
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch kim",
  DIAMOND: "Kim cương",
};

const MEMBERSHIP_TIER_STYLES: Record<MembershipTier, string> = {
  BRONZE: "bg-amber-100 text-amber-800",
  SILVER: "bg-slate-200 text-slate-700",
  GOLD: "bg-yellow-100 text-yellow-800",
  PLATINUM: "bg-indigo-100 text-indigo-800",
  DIAMOND: "bg-teal-100 text-teal-800",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatPoints(points: number): string {
  return new Intl.NumberFormat("vi-VN").format(points);
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-4 last:border-b-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-teal-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium text-ocean-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePageClient() {
  const { isReady } = useRequireAuth(ROUTES.PROFILE);
  const { profile, loading, error } = useCurrentProfile({ enabled: isReady });
  const [avatarError, setAvatarError] = useState(false);

  const showLoading = !isReady || (loading && !profile);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ocean-900 sm:text-3xl">
              Tài khoản của tôi
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Thông tin cá nhân và hạng thành viên
            </p>
          </div>

          {showLoading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-100 bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
              <p>{error}</p>
              <Link
                href={ROUTES.HOME}
                className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:underline"
              >
                Về trang chủ
              </Link>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-ocean-600 to-teal-500 text-white">
                    {profile.imageUrl && !avatarError ? (
                      <img
                        src={profile.imageUrl}
                        alt={profile.fullName}
                        className="h-full w-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <User className="h-10 w-10" />
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-ocean-900">
                      {profile.fullName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {profile.email}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${MEMBERSHIP_TIER_STYLES[profile.membershipTier] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        <Crown className="h-3.5 w-3.5" />
                        {MEMBERSHIP_TIER_LABELS[profile.membershipTier] ??
                          profile.membershipTier}
                      </span>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                        {profile.role === "CUSTOMER"
                          ? "Khách hàng"
                          : profile.role}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <Link
                href={ROUTES.ORDERS}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ocean-900">
                      Đơn hàng của tôi
                    </p>
                    <p className="text-xs text-slate-500">
                      Xem lịch sử và trạng thái đơn hàng
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Link>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Điểm tích lũy
                  </p>
                  <p className="mt-2 text-2xl font-bold text-ocean-900">
                    {formatPoints(profile.points)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">điểm thưởng</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <Wallet className="h-3.5 w-3.5" />
                    Ví Aqua
                  </p>
                  <p className="mt-2 text-2xl font-bold text-teal-700">
                    {formatPrice(profile.walletBalance)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">số dư khả dụng</p>
                </div>
              </div>

              <section className="rounded-xl border border-slate-100 bg-white px-6 shadow-sm sm:px-8">
                <h3 className="border-b border-slate-100 py-4 text-base font-semibold text-ocean-900">
                  Thông tin liên hệ
                </h3>
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={profile.email}
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Số điện thoại"
                  value={profile.phoneNumber || "—"}
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Địa chỉ"
                  value={profile.address || "—"}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Ngày sinh"
                  value={formatDate(profile.dateOfBirth)}
                />
              </section>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
