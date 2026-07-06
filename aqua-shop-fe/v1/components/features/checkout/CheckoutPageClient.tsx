"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import type { PaymentMethod } from "@/types/order";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useOrders";
import { useFeedback } from "@/hooks/useFeedback";
import { ROUTES, getOrderDetailPath } from "@/constants/routes";
import { formatPrice } from "@/utils/product-utils";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; desc: string }[] =
  [
    {
      value: "COD",
      label: "Thanh toán khi nhận hàng",
      desc: "Thanh toán bằng tiền mặt khi nhận hàng",
    },
    {
      value: "BANK_TRANSFER",
      label: "Chuyển khoản ngân hàng",
      desc: "Chuyển khoản trước khi giao hàng",
    },
    {
      value: "WALLET",
      label: "Ví AquaShop",
      desc: "Trừ tiền từ ví AquaShop ngay lập tức",
    },
  ];

const DEFAULT_SHIPPING_FEE = 30000;

export default function CheckoutPageClient() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const {
    serverCart,
    itemCount,
    isLoading: cartLoading,
    isServerCart,
    refreshCart,
  } = useCart();
  const { submitCheckout, isSubmitting, error: checkoutError } = useCheckout();
  const { toast } = useFeedback();

  const [shippingAddress, setShippingAddress] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`,
      );
    }
  }, [isHydrated, isAuthenticated, router]);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!shippingAddress.trim())
      errors.shippingAddress = "Vui lòng nhập địa chỉ giao hàng";
    if (!receiverName.trim())
      errors.receiverName = "Vui lòng nhập tên người nhận";
    if (!receiverPhone.trim())
      errors.receiverPhone = "Vui lòng nhập số điện thoại";
    else if (!/^(0|\+84)\d{9}$/.test(receiverPhone.replace(/\s/g, "")))
      errors.receiverPhone = "Số điện thoại không hợp lệ";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [shippingAddress, receiverName, receiverPhone]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      if (itemCount === 0) {
        toast.error("Giỏ hàng của bạn đang trống.");
        return;
      }

      const order = await submitCheckout({
        shippingAddress: shippingAddress.trim(),
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        note: note.trim() || undefined,
        paymentMethod,
        shippingFee: DEFAULT_SHIPPING_FEE,
      });

      if (order) {
        await refreshCart();
        toast.success("Đặt hàng thành công!");
        router.push(getOrderDetailPath(order.orderId));
      }
    },
    [
      validate,
      itemCount,
      submitCheckout,
      shippingAddress,
      receiverName,
      receiverPhone,
      note,
      paymentMethod,
      refreshCart,
      toast,
      router,
    ],
  );

  const subtotal = serverCart?.totalPrice ?? 0;
  const total = subtotal + DEFAULT_SHIPPING_FEE;

  const showLoading = !isHydrated || cartLoading;

  if (showLoading) {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen flex-1 items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) return null;

  if (!isServerCart || itemCount === 0) {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen flex-1 items-center justify-center bg-slate-50">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-ocean-900">
              Giỏ hàng trống
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Thêm sản phẩm vào giỏ hàng trước khi thanh toán.
            </p>
            <Link
              href={ROUTES.HOME}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          <h1 className="mb-8 text-2xl font-bold text-ocean-900 sm:text-3xl">
            Thanh toán
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
          >
            {/* Left: form */}
            <div className="space-y-6">
              {/* Shipping info */}
              <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-ocean-900">
                  Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <Field
                    label="Tên người nhận"
                    required
                    error={fieldErrors.receiverName}
                  >
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="input"
                    />
                  </Field>
                  <Field
                    label="Số điện thoại"
                    required
                    error={fieldErrors.receiverPhone}
                  >
                    <input
                      type="tel"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      placeholder="0901234567"
                      className="input"
                    />
                  </Field>
                  <Field
                    label="Địa chỉ giao hàng"
                    required
                    error={fieldErrors.shippingAddress}
                  >
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="123 Nguyễn Văn Linh, Q7, TP.HCM"
                      rows={3}
                      className="input resize-none"
                    />
                  </Field>
                  <Field label="Ghi chú">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Giao giờ hành chính, gọi trước khi giao..."
                      rows={2}
                      className="input resize-none"
                    />
                  </Field>
                </div>
              </section>

              {/* Payment method */}
              <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-ocean-900">
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                        paymentMethod === pm.value
                          ? "border-teal-500 bg-teal-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                        className="mt-0.5 accent-teal-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-ocean-900">
                          {pm.label}
                        </p>
                        <p className="text-xs text-slate-500">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {paymentMethod === "WALLET" && (
                  <p className="mt-3 text-xs text-amber-700">
                    ⚠ Số dư ví sẽ bị trừ ngay khi đặt hàng. Đảm bảo ví có đủ số
                    dư trước khi thanh toán.
                  </p>
                )}
              </section>
            </div>

            {/* Right: order summary */}
            <aside className="h-fit rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-ocean-900">
                Tóm tắt đơn hàng
              </h2>

              {/* Cart items preview */}
              {serverCart?.items && serverCart.items.length > 0 && (
                <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto text-sm">
                  {serverCart.items.map((item) => (
                    <li
                      key={item.cartItemId}
                      className="flex items-center justify-between gap-2 text-slate-700"
                    >
                      <span className="line-clamp-1 flex-1 text-xs">
                        {item.productName}
                        {item.variantLabel && (
                          <span className="text-slate-400">
                            {" "}
                            · {item.variantLabel}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs font-medium">
                        {item.quantity} ×{" "}
                        {formatPrice(item.salePrice ?? item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <dt>Tạm tính ({itemCount} sản phẩm)</dt>
                  <dd className="font-medium">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <dt>Phí vận chuyển</dt>
                  <dd className="font-medium">
                    {formatPrice(DEFAULT_SHIPPING_FEE)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ocean-900">
                    Tổng cộng
                  </span>
                  <span className="text-xl font-bold text-teal-700">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {checkoutError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
              </button>

              <Link
                href={ROUTES.CART}
                className="mt-3 block text-center text-xs text-slate-500 hover:text-teal-700"
              >
                ← Quay lại giỏ hàng
              </Link>
            </aside>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
