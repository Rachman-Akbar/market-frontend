import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCategoryHref,
  useCategoryNavigation,
} from "@/features/catalog/category/services/categoryService";
import {
  VOUCHER_GROUP,
  VOUCHER_GROUP_KEY,
} from "@/features/order/voucher/constants/voucherNavigation";
import { useActiveVouchers } from "@/features/order/voucher/services/voucherService";
import VoucherDropdownPage from "@/features/order/voucher/components/VoucherDropdown";

function sameCategory(a, b) {
  if (!a || !b) return false;
  return String(a.key ?? a.id ?? a.slug) === String(b.key ?? b.id ?? b.slug);
}

export function CategoryDropdown({
  open,
  onClose = () => {},
  selectedGroupKey = "",
}) {
  const dropdownRef = useRef(null);
  const [rendered, setRendered] = useState(open);
  const [activeGroup, setActiveGroup] = useState("");
  const [activeL1, setActiveL1] = useState(null);
  const navigationQuery = useCategoryNavigation({ enabled: open || rendered });
  const groups = navigationQuery.data?.groups || [];
  const categoriesByGroup = navigationQuery.data?.categoriesByGroup || {};
  const activeGroupKey = String(activeGroup || "");
  const isVoucherActive = activeGroupKey === VOUCHER_GROUP_KEY;
  const vouchersQuery = useActiveVouchers({ enabled: open && isVoucherActive });
  const vouchers = vouchersQuery.data || [];
  const loading = navigationQuery.isLoading;
  const error = navigationQuery.error?.message || "";
  const voucherLoading = vouchersQuery.isLoading;
  const voucherError = vouchersQuery.error?.message || "";

  const navGroups = useMemo(() => [...groups, VOUCHER_GROUP], [groups]);
  const l1List = useMemo(() => {
    if (isVoucherActive) return [];
    const list =
      categoriesByGroup[activeGroupKey] ??
      categoriesByGroup[Number(activeGroupKey)] ??
      [];
    return Array.isArray(list) ? list : [];
  }, [activeGroupKey, categoriesByGroup, isVoucherActive]);
  const current = useMemo(() => {
    if (isVoucherActive) return null;
    if (activeL1 && l1List.some((item) => sameCategory(item, activeL1)))
      return activeL1;
    return l1List[0] ?? null;
  }, [activeL1, isVoucherActive, l1List]);

  const handleSetActiveGroup = useCallback(
    (groupKey) => {
      const nextKey = String(groupKey || "");
      if (!nextKey || nextKey === activeGroupKey) return;
      setActiveGroup(nextKey);
    },
    [activeGroupKey],
  );
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (open) {
      setRendered(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setRendered(false), 720);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !groups.length) return;
    const requested = String(selectedGroupKey || "");
    const requestedExists =
      requested &&
      groups.some(
        (group) => String(group.key ?? group.id ?? group.slug) === requested,
      );
    const nextGroup = requestedExists
      ? requested
      : String(groups[0]?.key || groups[0]?.id || "");
    if (!activeGroupKey || (requestedExists && requested !== activeGroupKey))
      setActiveGroup(nextGroup);
  }, [activeGroupKey, groups, open, selectedGroupKey]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, open]);

  useEffect(() => {
    if (!open || isVoucherActive || !activeGroupKey) return;
    setActiveL1(l1List[0] ?? null);
  }, [activeGroupKey, isVoucherActive, l1List, open]);

  if (!rendered) return null;

  return (
    <>
      <div
        className={`absolute left-0 right-0 top-full z-40 h-screen bg-black/45 backdrop-blur-[1px] transition-opacity duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleClose();
        }}
      />

      <div
        ref={dropdownRef}
        className={`absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-gray-200 bg-white font-sans transition-[max-height,opacity,transform,filter] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu ${
          open
            ? "max-h-[560px] translate-y-0 opacity-100 blur-0 delay-[80ms]"
            : "pointer-events-none max-h-0 -translate-y-6 opacity-0 blur-[1px] delay-0"
        }`}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="border-b border-gray-200 bg-white px-4">
          <div className="mx-auto flex max-w-[1200px] items-center gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navGroups.map((group) => {
              const groupKey = String(group.key ?? group.id ?? group.slug);
              const isActive = activeGroupKey === groupKey;

              return (
                <button
                  key={groupKey}
                  type="button"
                  onMouseEnter={() => handleSetActiveGroup(groupKey)}
                  onClick={() => handleSetActiveGroup(groupKey)}
                  className={`whitespace-nowrap border-b-4 px-5 py-3 text-sm font-bold transition-[border-color,color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? "border-[#10B981] bg-white text-[#10B981]"
                      : "border-transparent bg-white text-gray-500 hover:text-[#10B981]"
                  }`}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </div>

        {isVoucherActive ? (
          <VoucherDropdownPage
            vouchers={vouchers}
            loading={voucherLoading}
            error={voucherError}
          />
        ) : (
          <div className="mx-auto flex h-[460px] max-w-[1200px]">
            <div className="w-56 flex-shrink-0 overflow-y-auto overscroll-contain border-r border-gray-200 bg-white py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {loading && (
                <div className="px-4 py-2 text-xs text-gray-400">Memuat...</div>
              )}

              {error && (
                <div className="px-4 py-2 text-xs text-red-500">{error}</div>
              )}

              {!loading && !error && !l1List.length && (
                <div className="px-4 py-2 text-xs text-gray-400">
                  Kategori belum tersedia
                </div>
              )}

              {l1List.map((category) => {
                const isActive = sameCategory(current, category);

                return (
                  <button
                    key={category.key || category.id || category.slug}
                    type="button"
                    onMouseEnter={() => setActiveL1(category)}
                    onClick={() => setActiveL1(category)}
                    className={`w-full border-l-4 bg-white px-5 py-2.5 text-left text-sm transition-[border-color,color,background-color,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? "border-[#10B981] font-bold text-[#10B981]"
                        : "border-transparent font-medium text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain bg-white p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {current ? (
                <>
                  <div className="mb-5 border-b border-gray-100 pb-3">
                    <Link
                      to={getCategoryHref(current)}
                      onClick={handleClose}
                      className="block text-xl font-bold tracking-tight text-gray-900 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#10B981]"
                    >
                      {current.name}
                    </Link>
                  </div>

                  {Array.isArray(current.children) &&
                  current.children.length ? (
                    <div className="columns-3 gap-8 space-y-6">
                      {current.children.map((levelTwo) => (
                        <div
                          key={levelTwo.key || levelTwo.id || levelTwo.slug}
                          className="break-inside-avoid"
                        >
                          <Link
                            to={getCategoryHref(levelTwo)}
                            onClick={handleClose}
                            className="mb-2 block text-sm font-bold text-gray-900 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#10B981]"
                          >
                            {levelTwo.name}
                          </Link>

                          {Array.isArray(levelTwo.children) &&
                          levelTwo.children.length ? (
                            <ul className="space-y-1.5">
                              {levelTwo.children.map((levelThree) => (
                                <li
                                  key={
                                    levelThree.key ||
                                    levelThree.id ||
                                    levelThree.slug
                                  }
                                >
                                  <Link
                                    to={getCategoryHref(levelThree)}
                                    onClick={handleClose}
                                    className="block text-xs text-gray-500 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#10B981]"
                                  >
                                    {levelThree.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Sub kategori belum tersedia
                    </div>
                  )}
                </>
              ) : (
                !loading && (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    Pilih kategori di sebelah kiri untuk melihat detail
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
