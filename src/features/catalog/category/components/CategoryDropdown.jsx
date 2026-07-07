import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCategoryHref,
  getCategoryNavigation,
} from "@/features/catalog/category/services/categoryService";

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
  const [groups, setGroups] = useState([]);
  const [categoriesByGroup, setCategoriesByGroup] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeGroupKey = String(activeGroup || "");

  const l1List = useMemo(() => {
    const list =
      categoriesByGroup[activeGroupKey] ??
      categoriesByGroup[Number(activeGroupKey)] ??
      [];

    return Array.isArray(list) ? list : [];
  }, [categoriesByGroup, activeGroupKey]);

  const current = useMemo(() => {
    if (activeL1 && l1List.some((item) => sameCategory(item, activeL1))) {
      return activeL1;
    }

    return l1List[0] ?? null;
  }, [activeL1, l1List]);

  const handleSetActiveGroup = useCallback(
    (groupKey) => {
      const nextKey = String(groupKey || "");

      if (!nextKey || nextKey === activeGroupKey) return;

      setActiveGroup(nextKey);
    },
    [activeGroupKey]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setRendered(true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRendered(false);
    }, 320);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || groups.length) return undefined;

    let mounted = true;

    setLoading(true);
    setError("");

    getCategoryNavigation()
      .then((result) => {
        if (!mounted) return;

        const nextGroups = Array.isArray(result?.groups) ? result.groups : [];
        const nextCategoriesByGroup = result?.categoriesByGroup || {};
        const firstGroup = String(
          selectedGroupKey || nextGroups[0]?.key || nextGroups[0]?.id || ""
        );
        const firstList =
          nextCategoriesByGroup[firstGroup] ??
          nextCategoriesByGroup[Number(firstGroup)] ??
          [];

        setGroups(nextGroups);
        setCategoriesByGroup(nextCategoriesByGroup);
        setActiveGroup(firstGroup);
        setActiveL1(Array.isArray(firstList) ? firstList[0] ?? null : null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "Gagal memuat kategori");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, groups.length, selectedGroupKey]);

  useEffect(() => {
    if (!open) return;

    const nextGroupKey = String(selectedGroupKey || "");

    if (!nextGroupKey) return;

    const exists = groups.some((group) => {
      return String(group.key ?? group.id ?? group.slug) === nextGroupKey;
    });

    if (exists && nextGroupKey !== activeGroupKey) {
      setActiveGroup(nextGroupKey);
    }
  }, [open, selectedGroupKey, groups, activeGroupKey]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (!open || !activeGroupKey) return;
    setActiveL1(l1List[0] ?? null);
  }, [open, activeGroupKey, l1List]);

  if (!rendered) return null;

  return (
    <>
      <div
        className={`absolute left-0 right-0 top-full z-40 h-screen bg-black/45 transition-opacity duration-300 ease-out ${
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
        className={`absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-gray-200 bg-white font-sans transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu ${
          open
            ? "max-h-[560px] translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-3 opacity-0"
        }`}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="border-b border-gray-200 bg-white px-4">
          <div className="mx-auto flex max-w-[1200px] items-center gap-1 overflow-x-auto">
            {groups.map((group) => {
              const groupKey = String(group.key ?? group.id ?? group.slug);
              const isActive = activeGroupKey === groupKey;

              return (
                <button
                  key={groupKey}
                  type="button"
                  onMouseEnter={() => handleSetActiveGroup(groupKey)}
                  onClick={() => handleSetActiveGroup(groupKey)}
                  className={`whitespace-nowrap border-b-4 px-5 py-3 text-sm font-bold transition-[border-color,color,background-color] duration-200 ease-out ${
                    isActive
                      ? "border-[#03ac0e] bg-white text-[#03ac0e]"
                      : "border-transparent bg-white text-gray-500 hover:text-[#03ac0e]"
                  }`}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto flex h-[460px] max-w-[1200px]">
          <div className="w-56 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white py-3">
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
                  className={`w-full border-l-4 bg-white px-5 py-2.5 text-left text-sm transition-[border-color,color,background-color,padding] duration-200 ease-out ${
                    isActive
                      ? "border-[#03ac0e] font-bold text-[#03ac0e]"
                      : "border-transparent font-medium text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-6">
            {current ? (
              <>
                <div className="mb-5 border-b border-gray-100 pb-3">
                  <Link
                    to={getCategoryHref(current)}
                    onClick={handleClose}
                    className="block text-xl font-bold tracking-tight text-gray-900 transition-colors duration-200 ease-out hover:text-[#03ac0e]"
                  >
                    {current.name}
                  </Link>
                </div>

                {Array.isArray(current.children) && current.children.length ? (
                  <div className="columns-3 gap-8 space-y-6">
                    {current.children.map((levelTwo) => (
                      <div
                        key={levelTwo.key || levelTwo.id || levelTwo.slug}
                        className="break-inside-avoid"
                      >
                        <Link
                          to={getCategoryHref(levelTwo)}
                          onClick={handleClose}
                          className="mb-2 block text-sm font-bold text-gray-900 transition-colors duration-200 ease-out hover:text-[#03ac0e]"
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
                                  className="block text-xs text-gray-500 transition-colors duration-200 ease-out hover:text-[#03ac0e]"
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
      </div>
    </>
  );
}