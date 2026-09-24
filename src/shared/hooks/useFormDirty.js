import { useMemo } from "react";

function pruneByKeys(value, keys) {
  if (Array.isArray(value)) return value.map((item) => pruneByKeys(item, keys));
  if (value && typeof value === "object") {
    const output = {};
    Object.keys(value).forEach((key) => {
      if (!keys.includes(key)) output[key] = pruneByKeys(value[key], keys);
    });
    return output;
  }
  return value;
}

function pruneUnknownKeys(value, allowedKeys) {
  if (Array.isArray(value)) return value.map((item) => pruneUnknownKeys(item, allowedKeys));
  if (value && typeof value === "object") {
    const output = {};
    allowedKeys.forEach((key) => {
      if (key in value) output[key] = pruneUnknownKeys(value[key], allowedKeys);
    });
    return output;
  }
  return value;
}

export function useFormDirty(pristine, current, options = {}) {
  const { volatileKeys = [], compareKeys = null } = options;
  return useMemo(() => {
    if (!pristine || !current) return false;
    const prepare = (value) => pruneByKeys(
      compareKeys ? pruneUnknownKeys(value, compareKeys) : value,
      volatileKeys,
    );
    return JSON.stringify(prepare(pristine)) !== JSON.stringify(prepare(current));
  }, [pristine, current, volatileKeys, compareKeys]);
}