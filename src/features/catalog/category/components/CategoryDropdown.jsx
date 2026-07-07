import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CATALOG_GROUPS, CATEGORY_DATA } from "@/features/catalog/category/services/categoryData";

export function CategoryDropdown({ open, onClose }) {
  const [activeGroup, setActiveGroup] = useState("belanja");
  const [activeL1, setActiveL1] = useState(null);
  const ref = useRef(null);

  const l1List = CATEGORY_DATA[activeGroup] ?? [];
  useEffect(() => {
    setActiveL1(l1List[0] ?? null);
  }, [activeGroup]);
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
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

      
      <div className="max-w-[1200px] mx-auto flex" style={{ height: 420 }}>
        
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

        
        {current && (
          <div className="flex-1 overflow-y-auto p-5">
            
            <div className="flex items-center gap-2 mb-4">
              {current.icon && <span className="text-2xl">{current.icon}</span>}
              <h3 className="text-base font-bold text-gray-900">{current.name}</h3>
            </div>

            <div className="columns-3 gap-6">
              {current.children.map((l2) => (
                <div key={l2.slug} className="break-inside-avoid mb-5">
                  
                  <Link to={`/category/${l2.slug}`}
                    onClick={onClose}
                    className="block text-sm font-bold text-gray-800 hover:text-[#03ac0e] mb-1.5 transition-colors"
                  >
                    {l2.name}
                  </Link>
                  
                  <ul className="space-y-1">
                    {l2.children.map((l3) => (
                      <li key={l3.slug}>
                        <Link to={`/category/${l3.slug}`}
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
