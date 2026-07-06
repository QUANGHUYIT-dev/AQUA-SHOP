"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Package, Search } from "lucide-react";
import { useInventoryList } from "@/hooks/useInventory";
import { getAdminInventorySkuPath } from "@/constants/routes";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";
import InventoryHistoryModal from "@/components/features/inventory/InventoryHistoryModal";

interface HistoryTarget {
  sku: string;
  productName: string;
}

export default function InventoryListPageClient() {
  const { page, isLoading, error, goToPage, search } = useInventoryList();
  const [searchQuery, setSearchQuery] = useState("");
  const [historyTarget, setHistoryTarget] = useState<HistoryTarget | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(searchQuery);
  };

  const items = page?.content || [];
  const totalPages = page?.totalPages || 0;
  const currentPage = page?.number || 0;
  const totalElements = page?.totalElements || 0;

  return (
    <>
      <AdminPageHeader
        title="Tồn kho"
        description={`${totalElements} SKU — tồn thực, đang giữ (HOLD) và có thể bán`}
      />

      <form onSubmit={handleSearch} className="mb-4 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm SKU hoặc tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-ocean-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-800"
        >
          Tìm
        </button>
      </form>

      {isLoading && !page ? (
        <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Không tìm thấy tồn kho</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">SKU</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Sản phẩm</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Tồn thực
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Đang giữ
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Có thể bán
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-ocean-900">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.productName}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {item.quantityOnHand ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-700">
                    {item.quantityOnHold ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-teal-700">
                    {item.quantityAvailable ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <Link
                        href={getAdminInventorySkuPath(item.sku)}
                        className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        Kiểm kho
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setHistoryTarget({
                            sku: item.sku,
                            productName: item.productName,
                          })
                        }
                        className="text-left text-sm text-slate-600 hover:text-teal-700 hover:underline"
                      >
                        Xem lịch sử biến động
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-500">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 0}
                  onClick={() => goToPage(currentPage - 1)}
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage + 1 >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <InventoryHistoryModal
        sku={historyTarget?.sku ?? null}
        productName={historyTarget?.productName}
        onClose={() => setHistoryTarget(null)}
      />
    </>
  );
}
