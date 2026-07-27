import ProductCard from "./ProductCard";

export default function ProductCatalogSection({
  selectedCustomer,
  displayedProducts,
  cart,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveFromCart,
}) {
  if (!selectedCustomer) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-2xl text-sky-600">
          ◎
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-900">
          Select a customer to begin billing.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
          Once a customer is selected, products and customer-specific pricing will appear here.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Product Catalog
          </h2>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {displayedProducts.length} products
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {displayedProducts.map((product) => {
            const cartItem = cart.find(
              (item) => Number(item.productId) === Number(product.id)
            );

            return (
              <ProductCard
                key={product.id}
                product={product}
                cartItem={cartItem}
                onAddToCart={onAddToCart}
                onIncreaseQuantity={onIncreaseQuantity}
                onDecreaseQuantity={onDecreaseQuantity}
                onRemoveFromCart={onRemoveFromCart}
              />
            );
          })}
        </div>
      </section>

      {displayedProducts.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-700 sm:text-base">
            No products match your current search and category filters.
          </p>
        </section>
      ) : null}
    </>
  );
}
