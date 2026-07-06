"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { deleteAdminCustomer, filterAdminCustomers } from "@/lib/api";
import { getRoleLabel } from "@/lib/admin-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import { formatPrice } from "@/utils/product-utils";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";

const PAGE_SIZE = 10;

export default function AdminCustomersClient() {
  const { toast, confirm } = useFeedback();
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [page, setPage] = useState(0);
  const [customers, setCustomers] = useState<
    Awaited<ReturnType<typeof filterAdminCustomers>>["content"]
  >([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await filterAdminCustomers({
        search: search.trim() || undefined,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        page,
        size: PAGE_SIZE,
        sort: "fullName,asc",
      });
      setCustomers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setError(null);
    } catch (err) {
      setCustomers([]);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, email, phoneNumber, page]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadCustomers();
  };

  const handleDelete = async (customerId: string, customerName: string) => {
    const ok = await confirm({
      title: "Xóa khách hàng",
      message: `Xóa khách hàng "${customerName}"?`,
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;

    setDeletingId(customerId);
    try {
      await deleteAdminCustomer(customerId);
      await loadCustomers();
      toast.success(SYSTEM_MESSAGES.DELETE_SUCCESS);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setEmail("");
    setPhoneNumber("");
    setPage(0);
  };

  const hasActiveFilters =
    search.trim().length > 0 ||
    email.trim().length > 0 ||
    phoneNumber.trim().length > 0;

  return (
    <>
      <AdminPageHeader
        title="Khách hàng"
        description={`${totalElements} khách hàng trong hệ thống`}
      />

      <form
        onSubmit={handleSearch}
        className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tên khách hàng
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0901234567"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-ocean-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-800"
          >
            Lọc
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Khách hàng
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Liên hệ
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Vai trò
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">Ví</th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Không có khách hàng
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ocean-900">
                        {customer.fullName}
                      </p>
                      <p className="text-xs text-slate-500">{customer.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{customer.email}</p>
                      <p className="text-xs text-slate-500">
                        {customer.phoneNumber ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {getRoleLabel(customer.role)}
                    </td>
                    <td className="px-4 py-3 font-medium text-ocean-800">
                      {formatPrice(customer.walletBalance)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={deletingId === customer.id}
                        onClick={() =>
                          handleDelete(customer.id, customer.fullName)
                        }
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-500">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Trang trước"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Trang sau"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
