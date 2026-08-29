import { describe, expect, it } from "vitest";
import {
  buildRawColumns,
  formatTableValue,
  humanizeColumnKey,
  mergeColumns,
} from "@/shared/utils/tableData";

describe("tableData", () => {
  describe("humanizeColumnKey", () => {
    it("inserts spaces between camelCase words", () => {
      expect(humanizeColumnKey("productName")).toBe("Product Name");
    });

    it("replaces underscores and dashes with spaces", () => {
      expect(humanizeColumnKey("product_name")).toBe("Product Name");
      expect(humanizeColumnKey("is-active")).toBe("Is Active");
    });

    it("capitalizes the first letter of each word", () => {
      expect(humanizeColumnKey("jumlah penjualan")).toBe("Jumlah Penjualan");
    });

    it("handles empty input", () => {
      expect(humanizeColumnKey("")).toBe("");
      expect(humanizeColumnKey(null)).toBe("");
    });
  });

  describe("formatTableValue", () => {
    it("renders a dash for empty values", () => {
      expect(formatTableValue(null)).toBe("-");
      expect(formatTableValue(undefined)).toBe("-");
      expect(formatTableValue("")).toBe("-");
    });

    it("renders booleans in Indonesian", () => {
      expect(formatTableValue(true)).toBe("Ya");
      expect(formatTableValue(false)).toBe("Tidak");
    });

    it("renders arrays as joined labels", () => {
      expect(formatTableValue(["A", "B"])).toBe("A, B");
      expect(formatTableValue([])).toBe("-");
    });

    it("renders arrays of objects using a preferred field", () => {
      const rows = [{ name: "Merah" }, { code: "X1" }];
      expect(formatTableValue(rows)).toBe("Merah, X1");
    });

    it("renders objects using a preferred field", () => {
      expect(formatTableValue({ name: "Toko A" })).toBe("Toko A");
      expect(formatTableValue({ label: "Label" })).toBe("Label");
      expect(formatTableValue({ id: 7 })).toBe('{"id":7}');
    });

    it("stringifies primitive values", () => {
      expect(formatTableValue(42)).toBe("42");
    });
  });

  describe("buildRawColumns", () => {
    it("excludes system keys by default", () => {
      const columns = buildRawColumns([{ id: 1, name: "A", created_at: "x", raw: { market_price: 100 } }]);
      const rawKeys = columns.map((column) => column.rawKey);
      expect(rawKeys).toContain("market_price");
      expect(rawKeys).not.toContain("id");
      expect(rawKeys).not.toContain("created_at");
    });

    it("reads from row.raw when present", () => {
      const columns = buildRawColumns([{ name: "A", raw: { hidden_field: 1 } }]);
      const rawKeys = columns.map((column) => column.rawKey);
      expect(rawKeys).toContain("hidden_field");
    });

    it("respects omittedKeys", () => {
      const columns = buildRawColumns([{ secret: 1, name: "A" }], ["secret"]);
      const rawKeys = columns.map((column) => column.rawKey);
      expect(rawKeys).not.toContain("secret");
      expect(rawKeys).toContain("name");
    });

    it("shapes columns with a raw: prefix", () => {
      const [column] = buildRawColumns([{ name: "A" }]);
      expect(column.key).toBe("raw:name");
      expect(column.label).toBe("Name");
      expect(column.rawKey).toBe("name");
      expect(column.defaultVisible).toBe(false);
    });
  });

  describe("mergeColumns", () => {
    it("deduplicates raw columns already present in base columns", () => {
      const base = [{ key: "name", label: "Nama" }];
      const raw = [
        { key: "raw:name", rawKey: "name", label: "Name" },
        { key: "raw:sku", rawKey: "sku", label: "SKU" },
      ];
      const merged = mergeColumns(base, raw);
      expect(merged).toHaveLength(2);
      expect(merged.map((column) => column.rawKey)).toEqual(["name", "sku"]);
    });

    it("returns base columns unchanged when there are no raw columns", () => {
      const base = [{ key: "name", label: "Nama" }];
      expect(mergeColumns(base, [])).toEqual(base);
    });
  });
});