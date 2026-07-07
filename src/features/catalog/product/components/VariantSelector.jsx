import { useEffect, useMemo, useState } from "react";

function buildVariantGroups(variants = []) {
  const groups = new Map();

  variants.forEach((variant) => {
    (variant.values || []).forEach((item) => {
      const key = item.attribute_id || item.attribute_name || "variant";
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          name: item.attribute_name || "Varian",
          values: [],
        });
      }
      const group = groups.get(key);
      if (!group.values.some((value) => value.value === item.value)) {
        group.values.push({ value: item.value, label: item.value });
      }
    });
  });

  return Array.from(groups.values()).slice(0, 2);
}

function findVariant(variants, selectedValues) {
  const selectedKeys = Object.keys(selectedValues).filter((key) => selectedValues[key]);
  if (!selectedKeys.length) return variants.find((variant) => variant.is_default) || variants[0] || null;

  return variants.find((variant) => {
    return selectedKeys.every((key) => {
      return (variant.values || []).some((item) => String(item.attribute_id || item.attribute_name || "variant") === String(key) && item.value === selectedValues[key]);
    });
  }) || variants.find((variant) => variant.is_default) || variants[0] || null;
}

export function VariantSelector({ variants = [], onVariantChange }) {
  const groups = useMemo(() => buildVariantGroups(variants), [variants]);
  const [selectedValues, setSelectedValues] = useState({});
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    const defaultVariant = variants.find((variant) => variant.is_default) || variants[0] || null;
    const nextValues = {};

    groups.forEach((group) => {
      const matched = defaultVariant?.values?.find((item) => String(item.attribute_id || item.attribute_name || "variant") === String(group.key));
      nextValues[group.key] = matched?.value || group.values[0]?.value || "";
    });

    setSelectedValues(nextValues);
    setSelectedVariantId(defaultVariant?.id || null);
    onVariantChange?.(defaultVariant);
  }, [variants, groups, onVariantChange]);

  useEffect(() => {
    if (!variants.length) return;
    const nextVariant = groups.length ? findVariant(variants, selectedValues) : variants.find((variant) => variant.id === selectedVariantId) || variants[0];
    onVariantChange?.(nextVariant);
  }, [selectedValues, selectedVariantId, variants, groups.length, onVariantChange]);

  if (!variants.length) return null;

  if (!groups.length) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Pilih varian</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id || variant.sku || variant.name}
              onClick={() => setSelectedVariantId(variant.id)}
              className={`min-w-[44px] h-11 px-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                variant.id === selectedVariantId
                  ? "border-[#03ac0e] bg-[#e5f9e7] text-[#03ac0e] font-bold"
                  : "border-gray-200 hover:border-[#03ac0e]"
              }`}
            >
              {variant.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {groups.map((group, groupIndex) => (
        <div key={group.key} className={groupIndex === groups.length - 1 ? "mb-8" : "mb-6"}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">
              Pilih {group.name.toLowerCase()}: <span className="text-gray-500 font-normal ml-1">{selectedValues[group.key]}</span>
            </span>
          </div>
          <div className={groupIndex === 0 ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"}>
            {group.values.map((item) => {
              const active = selectedValues[group.key] === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setSelectedValues((current) => ({ ...current, [group.key]: item.value }))}
                  className={groupIndex === 0
                    ? `flex items-center gap-2 p-2 rounded-lg border-2 text-left ${active ? "border-[#03ac0e] bg-[#e5f9e7]" : "border-gray-200 hover:border-gray-400"}`
                    : `min-w-[44px] h-11 px-3 rounded-lg text-sm font-semibold border-2 transition-colors ${active ? "border-[#03ac0e] bg-[#e5f9e7] text-[#03ac0e] font-bold" : "border-gray-200 hover:border-[#03ac0e]"}`
                  }
                >
                  <span className={groupIndex === 0 ? `text-xs font-semibold ${active ? "text-[#03ac0e]" : "text-gray-500"}` : ""}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
