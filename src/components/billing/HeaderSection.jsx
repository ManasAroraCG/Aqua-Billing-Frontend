export default function HeaderSection({
  selectedCustomerName,
  totalItemsInCart,
  grandTotal,
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 p-5 text-white shadow-xl sm:p-7">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200">
            Billing Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Generate Invoice
          </h1>
          <p className="mt-2 text-sm text-slate-200 sm:text-base">
            Build invoices faster with customer-specific pricing and live cart totals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-200">
              Customer
            </p>
            <p className="mt-1 truncate text-sm font-semibold">
              {selectedCustomerName}
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-200">
              Items
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {totalItemsInCart}
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-200">
              Cart Total
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              ₹{grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
