import { useMemo } from "react";
import {
  usePpobCategories,
  usePpobOperators,
  usePpobProducts,
} from "@/features/ppob/services/ppobService";

const CATEGORY_DEFAULT = "pulsa";

export function usePpobCatalog(category = CATEGORY_DEFAULT, operatorId = "") {
  const categoriesQuery = usePpobCategories();
  const operatorsQuery = usePpobOperators(category);
  const productsQuery = usePpobProducts(category, operatorId || undefined);

  const categories = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);

  const operators = useMemo(() => operatorsQuery.data || [], [operatorsQuery.data]);

  const products = useMemo(() => {
    const rows = productsQuery.data || [];
    return rows.slice().sort((a, b) => Number(a.sellingPrice) - Number(b.sellingPrice));
  }, [productsQuery.data]);

  const operatorName = useMemo(() => operators[0]?.name || "", [operators]);

  return useMemo(
    () => ({
      category,
      setCategoryKey: null,
      categories,
      operators,
      products,
      operatorName,
      loading: categoriesQuery.isLoading || productsQuery.isLoading,
      isLoadingCategories: categoriesQuery.isLoading,
      isLoadingProducts: productsQuery.isLoading,
      error: productsQuery.error ? (productsQuery.error.message || "Terjadi kesalahan.") : categoriesQuery.error ? (categoriesQuery.error.message || "Terjadi kesalahan.") : "",
    }),
    [
      category,
      categories,
      operators,
      products,
      operatorName,
      categoriesQuery.isLoading,
      productsQuery.isLoading,
      productsQuery.error,
      categoriesQuery.error,
    ],
  );
}
