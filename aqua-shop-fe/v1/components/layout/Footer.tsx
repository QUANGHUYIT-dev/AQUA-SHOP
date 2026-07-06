import Link from "next/link";
import { Fish, Mail, MapPin, Phone } from "lucide-react";
import { FOOTER_QUICK_LINKS, ROUTES } from "@/constants/routes";
import { CONTACT_INFO } from "@/constants/socialLinks";

export default function Footer() {
  return (
    <footer className="bg-ocean-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500">
                <Fish className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Aqua Shop</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Aqua Shop chuyên cung cấp cá cảnh, cây thủy sinh và phụ kiện bể
              cá chất lượng cao. Mang vẻ đẹp thiên nhiên đến từng không gian
              sống của bạn.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2">
              {FOOTER_QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 transition-colors hover:text-teal-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Liên hệ
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                <span>{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-teal-500" />
                <a href={CONTACT_INFO.phone.href} className="hover:text-teal-400">
                  {CONTACT_INFO.phone.label}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-teal-500" />
                <a
                  href={CONTACT_INFO.email.href}
                  className="hover:text-teal-400"
                >
                  {CONTACT_INFO.email.label}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p suppressHydrationWarning>
            &copy; {new Date().getFullYear()}{" "}
            <Link href={ROUTES.HOME} className="hover:text-teal-400">
              Aqua Shop
            </Link>
            . Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
}
