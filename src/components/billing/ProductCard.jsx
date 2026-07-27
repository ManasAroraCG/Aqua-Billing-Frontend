export default function ProductCard({
  product,
  cartItem,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveFromCart,
}) {
  return (
    <article className="group flex min-h-[268px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-3.5 pb-2.5 pt-3">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex max-w-[62%] truncate rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">
            {product.categoryName || "Category"}
          </span>

          <p className="text-lg font-semibold text-slate-900 tabular-nums">
            ₹{product.effectivePrice}
          </p>
        </div>

        {product.hasCustomerPrice ? (
          <div className="mt-2">
            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
              Customer Price Active
            </span>
          </div>
        ) : (
          <div className="mt-2 h-6" />
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-2.5">
        <h3 className="min-h-[52px] text-[1.15rem] line-clamp-2 font-semibold leading-tight text-slate-900 sm:text-[1.22rem]">
          {product.productName}
        </h3>

        <div className="mt-1.5 rounded-xl bg-slate-50 px-2.5 py-1.5 text-sm text-slate-600">
          <p className="font-medium">Model: {product.modelNumber || "-"}</p>
          <p className="mt-1 text-xs text-slate-500">
            {cartItem ? `${cartItem.quantity} item(s) in cart` : "Not added yet"}
          </p>
        </div>

        <div className="mt-auto space-y-2 pt-3">
          {!cartItem ? (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 group-hover:shadow-md"
            >
              Add To Cart
            </button>
          ) : (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="inline-flex items-center justify-between rounded-xl border border-slate-300 bg-white px-2 py-1.5">
                <button
                  onClick={() => onDecreaseQuantity(cartItem.productId)}
                  className="h-7 w-7 rounded-lg text-base font-semibold leading-none text-slate-700 transition hover:bg-slate-100"
                >
                  -
                </button>
                <span className="min-w-7 text-center text-sm font-semibold tabular-nums text-slate-900">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => onIncreaseQuantity(cartItem.productId)}
                  className="h-7 w-7 rounded-lg text-base font-semibold leading-none text-slate-700 transition hover:bg-slate-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => onRemoveFromCart(cartItem.productId)}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-red-700 transition hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
