import api from "./api";

function normalizeCollection(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.$values)) {
    return value.$values;
  }

  return [];
}

function findExistingPricingRecord(records, customerId, productId) {
  const safeRecords = Array.isArray(records) ? records : [];

  return (
    safeRecords.find(
      (record) =>
        Number(record?.customerId) === Number(customerId) &&
        Number(record?.productId) === Number(productId)
    ) || null
  );
}

export async function getBillingBootstrapData() {
  const [customerRes, productRes, categoryRes] = await Promise.all([
    api.get("/customers"),
    api.get("/products"),
    api.get("/categories"),
  ]);

  return {
    customers: normalizeCollection(customerRes?.data),
    products: normalizeCollection(productRes?.data),
    categories: normalizeCollection(categoryRes?.data),
  };
}

export async function getCustomerPricingByCustomerId(customerId) {
  const pricingRes = await api.get("/customer-pricing");
  const pricingRecords = normalizeCollection(pricingRes?.data);

  return pricingRecords.filter(
    (record) => Number(record?.customerId) === Number(customerId)
  );
}

export async function syncCustomerPricingForCart({
  customerId,
  cartItems,
  existingPricingRecords,
}) {
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const operations = safeCartItems.map(async (item) => {
    const payload = {
      customerId: Number(customerId),
      productId: Number(item.productId),
      customPrice: Number(item.price),
    };

    const existingRecord = findExistingPricingRecord(
      existingPricingRecords,
      customerId,
      item.productId
    );

    if (existingRecord) {
      const shouldUpdate =
        Number(existingRecord?.customPrice) !== payload.customPrice;

      if (!shouldUpdate) {
        return existingRecord;
      }

      const updateRes = await api.put(
        `/customer-pricing/${existingRecord.id}`,
        payload
      );
      return updateRes?.data;
    }

    const createRes = await api.post("/customer-pricing", payload);
    return createRes?.data;
  });

  return Promise.all(operations);
}

export async function createInvoice(payload) {
  const response = await api.post("/invoices", payload);
  return response?.data;
}

export async function getInvoiceById(invoiceId) {
  const response = await api.get(`/invoices/${invoiceId}`);
  return response?.data || null;
}
