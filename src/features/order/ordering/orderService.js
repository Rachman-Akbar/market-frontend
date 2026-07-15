import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  getApiMessage,
  unwrapApiData,
} from "@/core/utils/apiClient";
import { useAuth } from "@/features/auth/context/AuthContext";

export const orderKeys = {
  all: ["order", "orderings"],
  customer: (userId, filters = {}) => [
    "order",
    "orderings",
    "customer",
    userId,
    filters,
  ],
  detail: (id) => ["order", "orderings", "detail", String(id || "")],
  shipping: (payload) => ["order", "shipping-options", payload],
  seller: (storeId, filters = {}) => [
    "order",
    "orderings",
    "seller",
    storeId,
    filters,
  ],
};

function firstValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

function normalizeItem(item = {}) {
  return {
    id: item.id ?? null,
    productId: Number(item.product_id ?? item.productId ?? 0),
    variantId: Number(item.variant_id ?? item.variantId ?? 0),
    productName: item.product_name || item.productName || item.name || "Produk",
    variantLabel: item.variant_label || item.variantLabel || item.sku || "",
    sku: item.sku || "",
    quantity: Number(item.quantity || 0),
    price: Number(item.unit_price ?? item.price ?? 0),
    subtotal: Number(item.subtotal ?? 0),
    imageUrl: item.thumbnail || item.image || item.image_url || "",
    storeId: Number(item.store_id ?? item.storeId ?? 0),
    storeName: item.store_name || item.storeName || "Toko",
  };
}

function resolveOrderResponse(payload = {}) {
  const source = unwrapApiData(payload) || {};
  const nestedData =
    source?.data && typeof source.data === "object" ? source.data : {};
  const order =
    source?.order ||
    nestedData?.order ||
    source?.ordering ||
    nestedData?.ordering ||
    source?.orders?.[0] ||
    nestedData?.orders?.[0] ||
    source?.orderings?.[0] ||
    nestedData?.orderings?.[0] ||
    source;
  const payment =
    source?.payment ||
    nestedData?.payment ||
    order?.payment ||
    source?.midtrans ||
    nestedData?.midtrans ||
    source ||
    {};

  return { order: order || {}, payment: payment || {} };
}

export function normalizeOrder(row = {}, payment = {}) {
  const items = Array.isArray(row.items) ? row.items.map(normalizeItem) : [];
  const subOrders = Array.isArray(row.sub_orders)
    ? row.sub_orders.map((subOrder) => ({
        id: subOrder.id ?? null,
        storeId: Number(subOrder.store_id),
        storeName: subOrder.store_name || "Toko",
        subOrderNumber: subOrder.sub_order_number || "",
        status: subOrder.status || "pending",
        courier: subOrder.courier || "",
        service: subOrder.service || "",
        shippingCost: Number(subOrder.shipping_cost || 0),
        trackingNumber: subOrder.tracking_number || null,
        items: Array.isArray(subOrder.items)
          ? subOrder.items.map(normalizeItem)
          : [],
      }))
    : [];
  const paymentSource = {
    ...(payment && typeof payment === "object" ? payment : {}),
    ...(row.payment && typeof row.payment === "object" ? row.payment : {}),
  };
  const rawId = firstValue(
    row.id,
    row.order_id,
    row.orderId,
    paymentSource.order_id,
  );

  return {
    id: rawId === undefined ? "" : String(rawId),
    orderNumber: row.order_number || row.orderNumber || String(rawId || ""),
    userId: row.user_id ? String(row.user_id) : "",
    status: row.status || "pending",
    paymentStatus:
      row.payment_status ||
      paymentSource.payment_status ||
      paymentSource.transaction_status ||
      "unpaid",
    paymentMethod: row.payment_method || paymentSource.payment_method || null,
    subtotal: Number(
      row.subtotal ?? row.items_total ?? row.total_items_price ?? 0,
    ),
    totalAmount: Number(row.total_amount || 0),
    shippingCost: Number(row.shipping_cost || 0),
    discountAmount: Number(row.discount_amount || 0),
    shippingDiscountAmount: Number(row.shipping_discount_amount || 0),
    grandTotal: Number(
      row.grand_total ?? row.final_total ?? row.total_amount ?? 0,
    ),
    shippingAddress: row.shipping_address || "",
    courier: row.courier || "",
    service: row.service || "",
    snapToken: firstValue(
      row.snap_token,
      row.midtrans_snap_token,
      row.snapToken,
      paymentSource.snap_token,
      paymentSource.midtrans_snap_token,
      paymentSource.token,
    ),
    paymentUrl: firstValue(
      row.payment_url,
      row.redirect_url,
      paymentSource.payment_url,
      paymentSource.redirect_url,
      paymentSource.invoice_url,
    ),
    redirectUrl: firstValue(
      row.redirect_url,
      paymentSource.redirect_url,
      paymentSource.payment_url,
    ),
    midtransClientKey: firstValue(
      row.midtrans_client_key,
      paymentSource.client_key,
      paymentSource.midtrans_client_key,
    ),
    midtransIsProduction:
      firstValue(
        row.midtrans_is_production,
        paymentSource.is_production,
        paymentSource.production,
      ) ?? null,
    items,
    subOrders,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

function normalizePagination(payload) {
  const source = payload?.data ?? payload ?? {};
  const rows = Array.isArray(source)
    ? source
    : Array.isArray(source.data)
      ? source.data
      : [];
  const meta = payload?.meta ||
    source.meta || {
      current_page: source.current_page || 1,
      last_page: source.last_page || 1,
      per_page: source.per_page || rows.length,
      total: source.total || rows.length,
    };

  return { data: rows.map((row) => normalizeOrder(row)), meta };
}

export function normalizeShippingOption(option = {}, index = 0) {
  const courier = String(
    option.courier || option.code || option.provider || "",
  ).toLowerCase();
  const service = String(
    option.service || option.service_code || option.name || "REG",
  );
  const cost = Number(
    option.price ?? option.cost ?? option.shipping_cost ?? option.value ?? 0,
  );

  return {
    ...option,
    id:
      option.id ||
      `${courier || "shipping"}:${service || index}:${cost || index}`,
    courier,
    courier_label:
      option.courier_label || option.courier_name || option.provider_name || "",
    service,
    price: cost,
    cost,
    description:
      option.description || option.etd || option.estimated_days || "",
    provider: String(option.provider || option.source || "").toLowerCase(),
    requiresDestinationId: Boolean(
      option.requires_destination_id ??
        option.requires_komerce_destination_id ??
        option.requiresDestinationId,
    ),
  };
}

export function isDestinationShippingOption(option = {}) {
  if (option.requiresDestinationId) {
    return true;
  }

  const provider = String(option.provider || option.source || "").toLowerCase();
  const courier = String(option.courier || "").toLowerCase();
  const localCouriers = [
    "ambil_sendiri",
    "pickup",
    "haversine",
    "internal",
    "local",
    "kurir_toko",
    "store_delivery",
  ];

  if (localCouriers.some((name) => courier.includes(name))) {
    return false;
  }

  const destinationProviders = ["rajaongkir", "komerce"];
  const destinationCouriers = [
    "jne",
    "jnt",
    "j&t",
    "sicepat",
    "anteraja",
    "pos",
    "tiki",
    "ninja",
    "lion",
    "rex",
    "idexpress",
    "sap",
    "wahana",
  ];

  return (
    destinationProviders.some(
      (name) => provider.includes(name) || courier.includes(name),
    ) || destinationCouriers.some((name) => courier.includes(name))
  );
}

export async function getCustomerOrders(userId, filters = {}) {
  const response = await apiClient.get(
    `/api/v1/order/orderings/customers/${userId}`,
    { params: filters },
  );
  return normalizePagination(response.data);
}

export async function getOrderDetail(id) {
  const response = await apiClient.get(`/api/v1/order/orderings/${id}`);
  const resolved = resolveOrderResponse(response.data);
  return normalizeOrder(resolved.order, resolved.payment);
}

export async function getSellerOrders(storeId, filters = {}) {
  const response = await apiClient.get(
    `/api/v1/order/orderings/stores/${storeId}`,
    { params: filters },
  );
  const source = response.data?.data ?? response.data ?? {};
  const rows = Array.isArray(source)
    ? source
    : Array.isArray(source.data)
      ? source.data
      : [];

  return {
    data: rows.map((row) => ({
      id: row.id ?? null,
      orderId: row.order_id ?? null,
      orderNumber: row.order_number || row.sub_order_number || "",
      subOrderNumber: row.sub_order_number || "",
      storeId: Number(row.store_id || 0),
      storeName: row.store_name || "",
      status: row.status || "pending",
      paymentStatus: row.payment_status || "unpaid",
      totalItemsPrice: Number(row.total_items_price || 0),
      shippingCost: Number(row.shipping_cost || 0),
      courier: row.courier || "",
      service: row.service || "",
      trackingNumber: row.tracking_number || null,
      items: Array.isArray(row.items) ? row.items.map(normalizeItem) : [],
      createdAt: row.created_at || null,
    })),
    meta: source.meta || response.data?.meta || null,
  };
}

export async function getShippingOptions(payload) {
  if (!payload.addressId || !payload.cartItemIds?.length) {
    return [];
  }

  const response = await apiClient.post(
    "/api/v1/order/orderings/shipping-options",
    {
      address_id: payload.addressId,
      cart_item_ids: payload.cartItemIds,
    },
  );
  const source = unwrapApiData(response.data);
  const rows = Array.isArray(source?.options)
    ? source.options
    : Array.isArray(source)
      ? source
      : [];

  return rows.map(normalizeShippingOption);
}

export async function createOrder(payload) {
  const response = await apiClient.post("/api/v1/order/orderings", {
    address_id: payload.courier === "ambil_sendiri" ? null : payload.addressId,
    cart_item_ids: payload.cartItemIds,
    courier: payload.courier,
    service: payload.service || null,
    payment_method: payload.paymentMethod,
    voucher_code: payload.voucherCode || null,
  });
  const resolved = resolveOrderResponse(response.data);
  return normalizeOrder(resolved.order, resolved.payment);
}

export async function cancelOrder(id) {
  const response = await apiClient.post(`/api/v1/order/orderings/${id}/cancel`);
  return response.data;
}

export function useOrders(filters = {}) {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id || "";

  return useQuery({
    queryKey: orderKeys.customer(userId, filters),
    queryFn: () => getCustomerOrders(userId, filters),
    enabled: Boolean(isAuthenticated && userId),
    staleTime: 60000,
  });
}

export function useOrderDetail(id) {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      try {
        return await getOrderDetail(id);
      } catch (error) {
        if (error?.response?.status !== 404 || !user?.id) {
          throw error;
        }

        const result = await getCustomerOrders(user.id, {
          search: id,
          per_page: 100,
        });
        const match = result.data.find(
          (order) =>
            String(order.id) === String(id) ||
            String(order.orderNumber) === String(id),
        );

        if (!match) {
          throw error;
        }

        if (String(match.id) === String(id)) {
          return match;
        }

        try {
          return await getOrderDetail(match.id);
        } catch {
          return match;
        }
      }
    },
    enabled: Boolean(isAuthenticated && id),
    staleTime: 30000,
    retry: (failureCount, error) =>
      error?.response?.status === 404 && failureCount < 2,
    retryDelay: 500,
    refetchInterval: (query) => {
      const order = query.state.data;
      return order && ["pending", "unpaid"].includes(order.paymentStatus)
        ? 5000
        : false;
    },
  });
}

export function useShippingOptions(payload, enabled = true) {
  return useQuery({
    queryKey: orderKeys.shipping(payload),
    queryFn: () => getShippingOptions(payload),
    enabled: Boolean(
      enabled && payload?.addressId && payload?.cartItemIds?.length,
    ),
    staleTime: 60000,
  });
}

export function useSellerOrders(storeId, filters = {}) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: orderKeys.seller(storeId, filters),
    queryFn: () => getSellerOrders(storeId, filters),
    enabled: Boolean(isAuthenticated && storeId),
    staleTime: 30000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: ["order", "cart"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function getOrderError(error) {
  return getApiMessage(error, "Pesanan gagal diproses.");
}
