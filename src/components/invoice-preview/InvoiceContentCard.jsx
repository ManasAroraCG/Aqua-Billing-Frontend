export default function InvoiceContentCard({
  invoice,
  invoiceDate,
  customerName,
  customerGstNumber,
  customerPhone,
  products,
  amountInWords,
  formatCurrency,
  signature,
}) {
  return (
    <div className="invoice-card no-print mx-auto w-full overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 print:mx-0 print:rounded-none print:shadow-none print:ring-0">
      <div className="invoice-stage p-3 text-slate-900 sm:p-6 lg:p-8 print:p-0">
        <div className="border-b border-slate-200 pb-5 sm:pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-600">
                  Tax Invoice
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Aqua Billing
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600 sm:text-[15px]">
                  Sanitaryware &amp; Bath Fittings
                </p>
              </div>
              <div className="text-sm leading-6 text-slate-600">
                <p>Ahmedabad, Gujarat | GSTIN: 24AABCA1234F1Z5 | Ph: +91 98765 43210</p>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:max-w-[280px]">
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium text-slate-500">Invoice No</span>
                  <span className="text-right font-semibold text-slate-950 break-all">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium text-slate-500">Invoice Date</span>
                  <span className="text-right font-semibold text-slate-950">{invoiceDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Customer
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {customerName || "Walk-in Customer"}
              </p>
            </div>
            <div className="grid gap-2 text-sm sm:justify-self-end sm:text-right">
              {customerGstNumber ? (
                <div>
                  <span className="text-slate-500">GST Number:</span>
                  <span className="ml-2 font-semibold text-slate-900">{customerGstNumber}</span>
                </div>
              ) : null}
              {customerPhone ? (
                <div>
                  <span className="text-slate-500">Phone:</span>
                  <span className="ml-2 font-semibold text-slate-900">{customerPhone}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200">
          <div className="hidden sm:block">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="border-r border-slate-800 px-3 py-3 text-left font-semibold">Product</th>
                  <th className="border-r border-slate-800 px-3 py-3 text-center font-semibold">Qty</th>
                  <th className="border-r border-slate-800 px-3 py-3 text-right font-semibold">Rate</th>
                  <th className="px-3 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.productId} className="border-t border-slate-200 even:bg-slate-50">
                    <td className="px-3 py-3 font-medium text-slate-900">{item.productName}</td>
                    <td className="px-3 py-3 text-center text-slate-700">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-slate-700">₹{formatCurrency(item.price)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-950">₹{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-3 sm:hidden">
            {products.map((item) => (
              <div key={item.productId} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.productName}</p>
                    <p className="mt-1 text-xs text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">₹{formatCurrency(item.amount)}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <span className="block text-slate-500">Rate</span>
                    <span className="mt-1 block font-semibold text-slate-900">₹{formatCurrency(item.price)}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
                    <span className="block text-slate-500">Amount</span>
                    <span className="mt-1 block font-semibold text-slate-900">₹{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Amount in Words
            </p>
            <p className="mt-2 text-base font-semibold leading-7 text-slate-950 sm:text-lg">
              {amountInWords}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-950">₹{formatCurrency(invoice.subTotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-600">
                <span>GST (5%)</span>
                <span className="font-semibold text-slate-950">₹{formatCurrency(invoice.gstAmount)}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-950 px-4 py-3 text-white">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">Grand Total</span>
                  <span className="text-lg font-bold">₹{formatCurrency(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs rounded-2xl border border-slate-200 p-4 sm:p-5 text-center">
            <div className="flex h-24 items-end justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 pb-3">
              <div
                style={{
                  fontFamily: '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive',
                  fontSize: "2rem",
                  lineHeight: 1,
                }}
              >
                {signature.name}
              </div>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-3 text-sm font-semibold text-slate-800">
              {signature.title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
