import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import HeaderSection from "./HeaderSection";
import CustomerAndCategorySection from "./CustomerAndCategorySection";
import ProductCatalogSection from "./ProductCatalogSection";
import ShoppingCart from "./ShoppingCart";
import {
  createInvoice,
  getBillingBootstrapData,
  getCustomerPricingByCustomerId,
  getInvoiceById,
  syncCustomerPricingForCart,
} from "../../services/billing-service";

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export default function BillingModule() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customerPricingRecords, setCustomerPricingRecords] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeCustomerPricingRecords = Array.isArray(customerPricingRecords)
    ? customerPricingRecords
    : [];
  const safeCart = Array.isArray(cart) ? cart : [];

  useEffect(() => {
    let cancelled = false;

    async function bootstrapBillingData() {
      try {
        const data = await getBillingBootstrapData();

        if (cancelled) {
          return;
        }

        setCustomers(data.customers);
        setProducts(data.products);
        setCategories(data.categories);
      } catch (error) {
        console.error(error);

        if (cancelled) {
          return;
        }

        setCustomers([]);
        setProducts([]);
        setCategories([]);
      }
    }

    bootstrapBillingData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    let cancelled = false;

    async function fetchCustomerPricing() {
      setPricingLoading(true);

      try {
        const records = await getCustomerPricingByCustomerId(selectedCustomer);

        if (!cancelled) {
          setCustomerPricingRecords(records);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setCustomerPricingRecords([]);
        }
      } finally {
        if (!cancelled) {
          setPricingLoading(false);
        }
      }
    }

    fetchCustomerPricing();

    return () => {
      cancelled = true;
    };
  }, [selectedCustomer]);

  function handleCustomerChange(customerId) {
    setSelectedCustomer(customerId);
    setCart([]);

    if (!customerId) {
      setCustomerPricingRecords([]);
      setPricingLoading(false);
    }
  }

  function getCustomerPricingRecord(productId, customerId) {
    return (
      safeCustomerPricingRecords.find(
        (record) =>
          Number(record.customerId) === Number(customerId) &&
          Number(record.productId) === Number(productId)
      ) || null
    );
  }

  function getEffectivePrice(productId, customerId) {
    const pricingRecord = getCustomerPricingRecord(productId, customerId);

    if (pricingRecord) {
      return Number(pricingRecord.customPrice);
    }

    const product = safeProducts.find(
      (item) => Number(item.id) === Number(productId)
    );
    return Number(product?.basePrice || 0);
  }

  function getProductCardView(product) {
    const pricingRecord = getCustomerPricingRecord(product.id, selectedCustomer);
    const effectivePrice = getEffectivePrice(product.id, selectedCustomer);

    return {
      ...product,
      effectivePrice,
      hasCustomerPrice: Boolean(pricingRecord),
    };
  }

  function addToCart(product) {
    if (!selectedCustomer) {
      alert("Please select a customer first");
      return;
    }

    const effectivePrice = getEffectivePrice(product.id, selectedCustomer);
    const existing = safeCart.find((item) => item.productId === product.id);

    if (existing) {
      setCart((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];

        return safePrev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      });
      return;
    }

    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      return [
        ...safePrev,
        {
          productId: product.id,
          productName: product.productName,
          modelNumber: product.modelNumber,
          price: effectivePrice,
          quantity: 1,
        },
      ];
    });
  }

  function updateCartPrice(productId, value) {
    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    const safePrice = Math.max(0, parsedValue);

    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      return safePrev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              price: safePrice,
            }
          : item
      );
    });
  }

  function increaseQuantity(productId) {
    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      return safePrev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    });
  }

  function decreaseQuantity(productId) {
    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      return safePrev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity - 1),
            }
          : item
      );
    });
  }

  function removeItem(productId) {
    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter((item) => item.productId !== productId);
    });
  }

  const subtotal = safeCart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;

  function getCustomerRecordById(customerId) {
    return (
      safeCustomers.find((customer) => {
        const idValue = customer?.id ?? customer?.customerId ?? customer?.CustomerId;

        if (
          String(idValue ?? "").trim() === "" ||
          String(customerId ?? "").trim() === ""
        ) {
          return false;
        }

        const numericMatch = Number(idValue) === Number(customerId);
        const stringMatch = String(idValue) === String(customerId);

        return numericMatch || stringMatch;
      }) || null
    );
  }

  async function syncPricingBeforeInvoice(customerId) {
    const resolvedRecords = await syncCustomerPricingForCart({
      customerId,
      cartItems: safeCart,
      existingPricingRecords: safeCustomerPricingRecords,
    });

    setCustomerPricingRecords((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const safeResolvedRecords = Array.isArray(resolvedRecords)
        ? resolvedRecords.filter(Boolean)
        : [];

      const untouched = safePrev.filter(
        (record) =>
          !safeResolvedRecords.some(
            (resolved) => Number(resolved.productId) === Number(record.productId)
          )
      );

      return [...untouched, ...safeResolvedRecords];
    });
  }

  async function generateInvoice() {
    if (!selectedCustomer) {
      alert("Please select customer");
      return;
    }

    if (safeCart.length === 0) {
      alert("Please add at least one product");
      return;
    }

    const invalidPrice = safeCart.find((item) => Number(item.price) < 0);
    if (invalidPrice) {
      alert("Price cannot be less than 0");
      return;
    }

    const invalidQuantity = safeCart.find((item) => Number(item.quantity) < 1);
    if (invalidQuantity) {
      alert("Quantity cannot be less than 1");
      return;
    }

    try {
      setSavingPricing(true);

      await syncPricingBeforeInvoice(selectedCustomer);

      const customerRecord = getCustomerRecordById(selectedCustomer);
      const resolvedCustomerName =
        customerRecord?.partyName ||
        customerRecord?.customerName ||
        customerRecord?.name ||
        "";

      const payload = {
        customerId: Number(selectedCustomer),
        customerName: resolvedCustomerName,
        items: safeCart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const createdInvoice = await createInvoice(payload);
      const createdInvoiceId = createdInvoice?.id;
      let createdInvoiceNumber = firstNonEmptyString(
        createdInvoice?.invoiceNumber,
        createdInvoice?.invoiceNo
      );

      if (!createdInvoiceNumber && createdInvoiceId) {
        try {
          const invoiceDetail = await getInvoiceById(createdInvoiceId);
          createdInvoiceNumber = firstNonEmptyString(
            invoiceDetail?.invoiceNumber,
            invoiceDetail?.invoiceNo
          );
        } catch (invoiceDetailError) {
          console.error(
            "Unable to resolve invoice number for route ref",
            invoiceDetailError
          );
        }
      }

      setCart([]);
      setSelectedCustomer("");
      setSelectedCategory("");
      setSearch("");

      if (createdInvoiceId) {
        const previewRef = encodeURIComponent(createdInvoiceNumber || "preview");

        navigate(`/invoices/view/${previewRef}`, {
          state: {
            invoiceId: createdInvoiceId,
            invoiceNumber: createdInvoiceNumber,
          },
        });
      } else {
        alert("Invoice was created, but invoice id was not returned by API.");
      }
    } catch (error) {
      console.error(error);
      alert("Invoice generation failed");
    } finally {
      setSavingPricing(false);
    }
  }

  const filteredProducts = safeProducts.filter((product) => {
    if (!product || typeof product !== "object") {
      return false;
    }

    const searchMatch = String(product.productName || "")
      .toLowerCase()
      .includes(String(search || "").toLowerCase());

    const categoryMatch =
      selectedCategory === "" || Number(product.categoryId) === Number(selectedCategory);

    return searchMatch && categoryMatch;
  });

  const displayedProducts = filteredProducts.map(getProductCardView);

  const selectedCustomerRecord = getCustomerRecordById(selectedCustomer);
  const selectedCustomerName =
    selectedCustomerRecord?.partyName ||
    selectedCustomerRecord?.customerName ||
    selectedCustomerRecord?.name ||
    "No customer selected";

  const totalItemsInCart = safeCart.reduce(
    (count, item) => count + Number(item.quantity || 0),
    0
  );

  const controlClassName =
    "w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:text-base";

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <HeaderSection
        selectedCustomerName={selectedCustomerName}
        totalItemsInCart={totalItemsInCart}
        grandTotal={grandTotal}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5 xl:grid-cols-10">
        <div className="space-y-5 lg:col-span-3 xl:col-span-7">
          <CustomerAndCategorySection
            controlClassName={controlClassName}
            selectedCustomer={selectedCustomer}
            onCustomerChange={handleCustomerChange}
            customers={safeCustomers}
            pricingLoading={pricingLoading}
            selectedCustomerName={selectedCustomerName}
            cartCount={safeCart.length}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={safeCategories}
            search={search}
            onSearchChange={setSearch}
          />

          <ProductCatalogSection
            selectedCustomer={selectedCustomer}
            displayedProducts={displayedProducts}
            cart={safeCart}
            onAddToCart={addToCart}
            onIncreaseQuantity={increaseQuantity}
            onDecreaseQuantity={decreaseQuantity}
            onRemoveFromCart={removeItem}
          />
        </div>

        <ShoppingCart
          cart={safeCart}
          totalItemsInCart={totalItemsInCart}
          subtotal={subtotal}
          gst={gst}
          grandTotal={grandTotal}
          onUpdateCartPrice={updateCartPrice}
          onDecreaseQuantity={decreaseQuantity}
          onIncreaseQuantity={increaseQuantity}
          onRemoveItem={removeItem}
          onGenerateInvoice={generateInvoice}
          savingPricing={savingPricing}
        />
      </div>
    </div>
  );
}
