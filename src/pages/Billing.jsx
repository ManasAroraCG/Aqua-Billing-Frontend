import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../services/api";

export default function Billing() {
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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerPricingRecords([]);
      setCart([]);
      return;
    }

    setCart([]);
    loadCustomerPricing(selectedCustomer);
  }, [selectedCustomer]);

  async function loadData() {
    try {
      const customerRes = await api.get("/customers");
      const productRes = await api.get("/products");
      const categoryRes = await api.get("/categories");

      setCustomers(customerRes.data);
      setProducts(productRes.data);
      setCategories(categoryRes.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadCustomerPricing(customerId) {
    try {
      setPricingLoading(true);

      const pricingRes = await api.get("/customer-pricing");
      const records = pricingRes.data.filter(
        (record) => Number(record.customerId) === Number(customerId)
      );

      setCustomerPricingRecords(records);
    } catch (error) {
      console.error(error);
      setCustomerPricingRecords([]);
    } finally {
      setPricingLoading(false);
    }
  }

  function getCustomerPricingRecord(productId, customerId) {
    return customerPricingRecords.find(
      (record) =>
        Number(record.customerId) === Number(customerId) &&
        Number(record.productId) === Number(productId)
    );
  }

  function getEffectivePrice(productId, customerId) {
    const pricingRecord = getCustomerPricingRecord(productId, customerId);

    if (pricingRecord) {
      return Number(pricingRecord.customPrice);
    }

    const product = products.find((item) => Number(item.id) === Number(productId));
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
    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );
      return;
    }

    setCart([
      ...cart,
      {
        productId: product.id,
        productName: product.productName,
        modelNumber: product.modelNumber,
        price: effectivePrice,
        quantity: 1,
      },
    ]);
  }

  function updateCartPrice(productId, value) {
    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    const safePrice = Math.max(0, parsedValue);

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              price: safePrice,
            }
          : item
      )
    );
  }

  function increaseQuantity(productId) {
    setCart(
      cart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(productId) {
    setCart(
      cart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  }

  function removeItem(productId) {
    setCart(cart.filter((item) => item.productId !== productId));
  }

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;

  const selectedCustomerRecord = customers.find(
    (customer) => customer.id === Number(selectedCustomer)
  );

  async function syncCustomerPricingWithCart(customerId) {
    const operations = cart.map(async (item) => {
      const payload = {
        customerId: Number(customerId),
        productId: Number(item.productId),
        customPrice: Number(item.price),
      };

      const existingRecord = getCustomerPricingRecord(item.productId, customerId);

      if (existingRecord) {
        const shouldUpdate = Number(existingRecord.customPrice) !== payload.customPrice;

        if (!shouldUpdate) {
          return existingRecord;
        }

        const updateRes = await api.put(
          `/customer-pricing/${existingRecord.id}`,
          payload
        );
        return updateRes.data;
      }

      const createRes = await api.post("/customer-pricing", payload);
      return createRes.data;
    });

    const resolvedRecords = await Promise.all(operations);

    setCustomerPricingRecords((prev) => {
      const untouched = prev.filter(
        (record) =>
          !resolvedRecords.some(
            (resolved) => Number(resolved.productId) === Number(record.productId)
          )
      );

      return [...untouched, ...resolvedRecords];
    });
  }

  async function generateInvoice() {
    if (!selectedCustomer) {
      alert("Please select customer");
      return;
    }

    if (cart.length === 0) {
      alert("Please add at least one product");
      return;
    }

    const invalidPrice = cart.find((item) => Number(item.price) < 0);
    if (invalidPrice) {
      alert("Price cannot be less than 0");
      return;
    }

    const invalidQuantity = cart.find((item) => Number(item.quantity) < 1);
    if (invalidQuantity) {
      alert("Quantity cannot be less than 1");
      return;
    }

    try {
      setSavingPricing(true);

      await syncCustomerPricingWithCart(selectedCustomer);

      const payload = {
        customerId: Number(selectedCustomer),
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await api.post("/invoices", payload);

      const finalSubTotal = cart.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
      );
      const finalGstAmount = finalSubTotal * 0.05;
      const finalGrandTotal = finalSubTotal + finalGstAmount;

      const invoiceCart = cart.map((item) => ({ ...item }));

      setCart([]);
      setSelectedCustomer("");
      setSelectedCategory("");
      setSearch("");

      navigate("/invoice-preview", {
        state: {
          invoice: {
            ...response.data,
            subTotal: finalSubTotal,
            gstAmount: finalGstAmount,
            grandTotal: finalGrandTotal,
            invoiceDate: new Date().toISOString(),
          },
          cart: invoiceCart,
          customerName: selectedCustomerRecord?.partyName || "",
          customerGstNumber:
            selectedCustomerRecord?.gstNumber ||
            selectedCustomerRecord?.gstNo ||
            selectedCustomerRecord?.gst ||
            "",
          customerPhone:
            selectedCustomerRecord?.phone ||
            selectedCustomerRecord?.mobile ||
            selectedCustomerRecord?.contactNumber ||
            "",
        },
      });
    } catch (error) {
      console.error(error);
      alert("Invoice generation failed");
    } finally {
      setSavingPricing(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    const searchMatch = product.productName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "" || product.categoryId === Number(selectedCategory);

    return searchMatch && categoryMatch;
  });

  const displayedProducts = filteredProducts.map(getProductCardView);

  const controlClassName =
    "w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3 text-sm sm:text-base outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">Generate Invoice</h1>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Select customer and generate a bill
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
            <label className="block mb-2 text-sm sm:text-base font-semibold">
              Customer
            </label>

            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className={controlClassName}
            >
              <option value="">Select Customer</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.partyName}
                </option>
              ))}
            </select>

            {pricingLoading ? (
              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                Loading customer pricing...
              </p>
            ) : null}
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={controlClassName}
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search Product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={controlClassName}
              />
            </div>
          </div>

          {!selectedCustomer ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <h2 className="text-xl sm:text-2xl font-bold">Select Customer First</h2>

              <p className="text-sm sm:text-base text-slate-500 mt-3">
                Products and customer pricing will be shown after selecting a customer.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid h-full min-h-[270px] grid-rows-[auto_auto_1fr_auto] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex max-w-[62%] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      {product.categoryName || "Category"}
                    </span>

                    <div className="text-right">
                      <p className="text-lg font-extrabold tabular-nums text-slate-900 sm:text-2xl">
                        ₹{product.effectivePrice}
                      </p>
                      <div className="mt-1 h-[22px]">
                        {product.hasCustomerPrice ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                            Custom
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <h2 className="mt-3 h-16 overflow-hidden text-xl font-bold leading-tight text-slate-900">
                    {product.productName}
                  </h2>

                  <div className="mt-2 text-sm text-slate-600">
                    <p className="font-medium">Model: {product.modelNumber || "-"}</p>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:text-base"
                  >
                    Add To Cart
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedCustomer && displayedProducts.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-600 sm:text-base">
                No products match your current search and category filters.
              </p>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-5">
            <h2 className="text-xl sm:text-2xl font-bold mb-5">Cart</h2>

            {cart.length === 0 && (
              <p className="text-sm sm:text-base text-slate-500">No products selected</p>
            )}

            <div className="max-h-[52vh] overflow-y-auto pr-1 sm:max-h-[56vh]">
              {cart.map((item) => (
                <div key={item.productId} className="border-b py-4 last:border-b-0">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">{item.productName}</h3>

                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs text-slate-500">Price</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.price}
                        onChange={(e) => updateCartPrice(item.productId, e.target.value)}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="rounded-lg p-1 text-red-500 transition hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.productId)}
                      className="h-9 w-9 rounded-lg bg-slate-200 text-lg leading-none transition hover:bg-slate-300"
                    >
                      -
                    </button>

                    <span className="min-w-7 text-center font-semibold">{item.quantity}</span>

                    <button
                      onClick={() => increaseQuantity(item.productId)}
                      className="h-9 w-9 rounded-lg bg-slate-200 text-lg leading-none transition hover:bg-slate-300"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-semibold text-sm sm:text-base sm:text-right">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm sm:text-base">
                <span>GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between text-lg sm:text-xl font-bold">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={generateInvoice}
              disabled={savingPricing}
              className="mt-6 w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {savingPricing ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
