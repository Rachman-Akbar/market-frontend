"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CATALOG_GROUPS, CATEGORY_DATA, type CatL1 } from "@/lib/categoryData";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CategoryDropdown({ open, onClose }: Props) {
  const [activeGroup, setActiveGroup] = useState("belanja");
  const [activeL1, setActiveL1] = useState<CatL1 | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const l1List = CATEGORY_DATA[activeGroup] ?? [];

  // Set default L1 when group changes
  useEffect(() => {
    setActiveL1(l1List[0] ?? null);
  }, [activeGroup]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const current = activeL1 ?? l1List[0];

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 top-full bg-white border-t border-gray-200 z-50"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      {/* Catalog group tabs */}
      <div className="border-b border-gray-200 px-4">
        <div className="max-w-[1200px] mx-auto flex items-center gap-1">
          {CATALOG_GROUPS.map((g) => (
            <button
              key={g.id}
              onMouseEnter={() => setActiveGroup(g.id)}
              onClick={() => setActiveGroup(g.id)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeGroup === g.id
                  ? "border-[#03ac0e] text-[#03ac0e]"
                  : "border-transparent text-gray-600 hover:text-[#03ac0e]"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Body: sidebar L1 + content */}
      <div className="max-w-[1200px] mx-auto flex" style={{ height: 420 }}>
        {/* Sidebar L1 */}
        <div className="w-52 flex-shrink-0 border-r border-gray-100 overflow-y-auto py-2">
          {l1List.map((cat) => (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveL1(cat)}
              onClick={() => setActiveL1(cat)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                current?.id === cat.id
                  ? "font-bold text-gray-900 bg-gray-50 border-l-2 border-[#03ac0e]"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content: L1 title + L2 headings + L3 links */}
        {current && (
          <div className="flex-1 overflow-y-auto p-5">
            {/* L1 title with icon */}
            <div className="flex items-center gap-2 mb-4">
              {current.icon && <span className="text-2xl">{current.icon}</span>}
              <h3 className="text-base font-bold text-gray-900">{current.name}</h3>
            </div>

            <div className="columns-3 gap-6">
              {current.children.map((l2) => (
                <div key={l2.slug} className="break-inside-avoid mb-5">
                  {/* L2 as bold heading */}
                  <Link
                    href={`/category/${l2.slug}`}
                    onClick={onClose}
                    className="block text-sm font-bold text-gray-800 hover:text-[#03ac0e] mb-1.5 transition-colors"
                  >
                    {l2.name}
                  </Link>
                  {/* L3 as links */}
                  <ul className="space-y-1">
                    {l2.children.map((l3) => (
                      <li key={l3.slug}>
                        <Link
                          href={`/category/${l3.slug}`}
                          onClick={onClose}
                          className="text-xs text-[#03ac0e] hover:underline block leading-relaxed"
                        >
                          {l3.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
