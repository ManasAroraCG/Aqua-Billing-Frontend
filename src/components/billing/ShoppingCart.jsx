export default function ShoppingCart({
  cart,
  totalItemsInCart,
  subtotal,
  gst,
  grandTotal,
  onUpdateCartPrice,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemoveItem,
  onGenerateInvoice,
  savingPricing,
}) {
  return (
    <aside className="lg:col-span-2 xl:col-span-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Billing Cart
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            {totalItemsInCart} items
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl text-slate-500">
              🛒
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Your cart is empty
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add products from the catalog to begin.
            </p>
          </div>
        ) : null}

        <div className="max-h-[46vh] space-y-3 overflow-y-auto pr-1 sm:max-h-[52vh]">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="pr-2 text-[15px] font-semibold leading-snug text-slate-900 sm:text-base">
                  {item.productName}
                </h3>
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-100"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.price}
                    onChange={(e) =>
                      onUpdateCartPrice(item.productId, e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Quantity
                    </p>
                    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-1 py-1">
                      <button
                        onClick={() => onDecreaseQuantity(item.productId)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-base font-semibold leading-none text-slate-700 transition hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="min-w-7 text-center text-sm font-semibold text-slate-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onIncreaseQuantity(item.productId)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-base font-semibold leading-none text-slate-700 transition hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Line Total
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">
                      ₹
                      {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-200">
              <span>Subtotal</span>
              <span className="font-semibold tabular-nums">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span>GST (5%)</span>
              <span className="font-semibold tabular-nums">₹{gst.toFixed(2)}</span>
            </div>
            <div className="mt-2 border-t border-white/20 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">
                  Grand Total
                </span>
                <span className="text-xl font-bold tabular-nums text-white">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onGenerateInvoice}
          disabled={savingPricing}
          className="mt-5 w-full rounded-2xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingPricing ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </aside>
  );
}
