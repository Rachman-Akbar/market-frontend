import { describe, expect, it } from "vitest";
import {
  normalizeOperator,
  normalizePpobProduct,
  normalizePpobTransaction,
  normalizePricingRule,
} from "@/features/ppob/services/ppobService";

describe("normalizePpobProduct", () => {
  it("normalizes a ppob product", () => {
    const result = normalizePpobProduct({
      id: "12",
      operator_id: "3",
      category: "pulsa",
      provider_product_code: "XL-5K",
      name: "Pulsa XL 5.000",
      provider_price: "4800",
      admin_fee: "0",
      selling_price: "5000",
      is_available: 1,
    });

    expect(result).toMatchObject({
      id: 12,
      operatorId: "3",
      category: "pulsa",
      productType: "prepaid",
      providerProductCode: "XL-5K",
      name: "Pulsa XL 5.000",
      providerPrice: 4800,
      adminFee: 0,
      sellingPrice: 5000,
      isAvailable: true,
    });
  });

  it("normalizes boolean-like strings for availability", () => {
    expect(normalizePpobProduct({ is_available: "0" }).isAvailable).toBe(false);
    expect(normalizePpobProduct({ isAvailable: "false" }).isAvailable).toBe(false);
    expect(normalizePpobProduct({ is_available: undefined }).isAvailable).toBe(true);
  });

  it("uses defaults for a bare row", () => {
    expect(normalizePpobProduct({})).toMatchObject({
      id: 0,
      category: "",
      productType: "prepaid",
      name: "",
      providerPrice: 0,
      sellingPrice: 0,
    });
  });
});

describe("normalizeOperator", () => {
  it("normalizes an operator row", () => {
    expect(normalizeOperator({
      id: "44",
      name: "Telkomsel",
      slug: "telkomsel",
      category: "pulsa",
      provider_name: "TSEL",
      is_active: 1,
    })).toMatchObject({
      id: 44,
      name: "Telkomsel",
      slug: "telkomsel",
      category: "pulsa",
      providerName: "TSEL",
      isActive: true,
    });
  });

  it("reads icon from both naming conventions", () => {
    expect(normalizeOperator({ icon_url: "/a.png" }).iconUrl).toBe("/a.png");
    expect(normalizeOperator({ iconUrl: "/b.png" }).iconUrl).toBe("/b.png");
  });

  it("uses defaults for a bare row", () => {
    expect(normalizeOperator({})).toMatchObject({ id: 0, name: "", isActive: true });
  });
});

describe("normalizePricingRule", () => {
  it("normalizes a pricing rule", () => {
    const result = normalizePricingRule({
      id: "2",
      operator_id: "3",
      category: "pulsa",
      min_nominal: "1000",
      max_nominal: "50000",
      rule_type: "margin",
      value: "0.05",
      is_active: 1,
    });

    expect(result).toMatchObject({
      id: 2,
      operatorId: "3",
      minNominal: 1000,
      maxNominal: 50000,
      ruleType: "margin",
      value: 0.05,
      isActive: true,
    });
  });

  it("keeps null nominal bounds when values are nullish", () => {
    expect(normalizePricingRule({ min_nominal: null, max_nominal: undefined }).minNominal).toBe(null);
  });
});

describe("normalizePpobTransaction", () => {
  it("normalizes a transaction row", () => {
    const result = normalizePpobTransaction({
      id: "99",
      reference_id: "REF-1",
      product_name: "Pulsa XL 5K",
      category: "pulsa",
      customer_id: "0812",
      total_amount: "5000",
      status: "success",
      provider_message: "SUKSES",
      tr_id: "TRX-1",
      created_at: "2024-01-01T00:00:00Z",
      operator: { id: 3 },
    });

    expect(result).toMatchObject({
      id: 99,
      referenceId: "REF-1",
      productName: "Pulsa XL 5K",
      category: "pulsa",
      customerId: "0812",
      totalAmount: 5000,
      status: "success",
      providerMessage: "SUKSES",
      trId: "TRX-1",
      createdAt: "2024-01-01T00:00:00Z",
      operator: { id: 3 },
    });
  });

  it("uses defaults for a bare row", () => {
    expect(normalizePpobTransaction({})).toMatchObject({
      id: 0,
      productName: "",
      productType: "prepaid",
      totalAmount: 0,
      status: "pending",
    });
  });
});