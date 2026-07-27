export default function CustomerAndCategorySection({
  controlClassName,
  selectedCustomer,
  onCustomerChange,
  customers,
  pricingLoading,
  selectedCustomerName,
  cartCount,
  selectedCategory,
  onCategoryChange,
  categories,
  search,
  onSearchChange,
}) {
  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Select Customer
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => onCustomerChange(e.target.value)}
              className={controlClassName}
            >
              <option value="">Choose customer</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.partyName}
                </option>
              ))}
            </select>

            {pricingLoading ? (
              <p className="mt-2 text-xs text-slate-500">Loading customer pricing...</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {selectedCustomer ? (
              <>
                <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Customer Selected
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-900">
                  {selectedCustomerName}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Customer Pricing Active
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {cartCount} Products in Cart
                </p>
              </>
            ) : (
              <div className="flex h-full flex-col justify-center">
                <p className="text-sm font-semibold text-slate-700">
                  No customer selected
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a customer to activate pricing and start billing.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[230px_1fr]">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
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
            placeholder="Search product name"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={controlClassName}
          />
        </div>
      </section>
    </>
  );
}
