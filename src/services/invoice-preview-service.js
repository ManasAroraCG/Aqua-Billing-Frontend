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

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function resolveInvoiceItemProductName(item, index, productNameById) {
  const resolvedProductId = item?.productId ?? item?.product?.id;
  const catalogName = productNameById?.get(Number(resolvedProductId));

  return (
    firstNonEmptyString(
      item?.productName,
      item?.name,
      item?.itemName,
      item?.description,
      item?.product?.productName,
      item?.product?.name,
      item?.productDetails?.productName,
      item?.productDetails?.name,
      catalogName
    ) || `Product ${index + 1}`
  );
}

function toValidInvoiceId(candidateId) {
  const id = Number(candidateId);

  if (Number.isNaN(id) || !Number.isFinite(id) || id <= 0) {
    return null;
  }

  return id;
}

async function resolveInvoiceIdFromReference(invoiceRef) {
  if (!invoiceRef || invoiceRef.toLowerCase() === "preview") {
    return null;
  }

  const numericInvoiceId = toValidInvoiceId(invoiceRef);
  if (numericInvoiceId) {
    return numericInvoiceId;
  }

  const response = await api.get("/invoices");
  const invoices = normalizeCollection(response?.data);
  const matchedInvoice = invoices.find((item) => {
    const candidateNumber = firstNonEmptyString(item?.invoiceNumber, item?.invoiceNo);
    return candidateNumber.toLowerCase() === invoiceRef.toLowerCase();
  });

  return toValidInvoiceId(matchedInvoice?.id);
}

async function hydrateCatalogProductNames(items) {
  const shouldHydrateNamesFromCatalog = items.some(
    (item) =>
      !firstNonEmptyString(
        item?.productName,
        item?.name,
        item?.itemName,
        item?.description,
        item?.product?.productName,
        item?.product?.name,
        item?.productDetails?.productName,
        item?.productDetails?.name
      )
  );

  if (!shouldHydrateNamesFromCatalog) {
    return new Map();
  }

  try {
    const productRes = await api.get("/products");
    const productRows = normalizeCollection(productRes?.data);

    return new Map(
      productRows.map((product) => [
        Number(product?.id ?? product?.productId),
        firstNonEmptyString(product?.productName, product?.name),
      ])
    );
  } catch (productLoadError) {
    console.error("Unable to resolve product names from catalog", productLoadError);
    return new Map();
  }
}

async function fetchAndNormalizeInvoiceById(invoiceId) {
  const response = await api.get(`/invoices/${invoiceId}`);
  const data = response?.data || {};
  const items = normalizeCollection(data.items);
  const productNameById = await hydrateCatalogProductNames(items);

  const normalizedItems = items.map((item, index) => {
    const productId = item.productId || index + 1;
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const itemSubTotal = Number(item.subTotal || quantity * unitPrice);
    const resolvedProductName = resolveInvoiceItemProductName(
      item,
      index,
      productNameById
    );

    return {
      productId,
      productName: resolvedProductName,
      quantity,
      unitPrice,
      subTotal: itemSubTotal,
    };
  });

  const computedSubTotal = normalizedItems.reduce(
    (total, item) => total + Number(item.subTotal || 0),
    0
  );
  const computedGst = computedSubTotal * 0.05;
  const computedGrandTotal = computedSubTotal + computedGst;

  return {
    ...data,
    items: normalizedItems,
    subTotal: data.subTotal ?? computedSubTotal,
    gstAmount: data.gstAmount ?? computedGst,
    grandTotal: data.grandTotal ?? computedGrandTotal,
  };
}

export async function getInvoicePreviewData({ invoiceRef, stateInvoiceId }) {
  const resolvedInvoiceId =
    toValidInvoiceId(stateInvoiceId) ||
    (await resolveInvoiceIdFromReference(invoiceRef));

  if (!resolvedInvoiceId) {
    throw new Error("Unable to locate invoice from route reference");
  }

  return fetchAndNormalizeInvoiceById(resolvedInvoiceId);
}
