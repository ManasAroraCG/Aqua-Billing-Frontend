export default function InvoiceActionBar({
  isExporting,
  onDownloadPdf,
  onPrint,
  onBack,
}) {
  return (
    <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Invoice Preview
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Professional GST invoice ready for print and PDF download.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={onDownloadPdf}
          disabled={isExporting}
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
        >
          {isExporting ? "Generating..." : "Download PDF"}
        </button>
        <button
          onClick={onPrint}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
        >
          Print
        </button>
        <button
          onClick={onBack}
          className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400 sm:w-auto"
        >
          Back To Billing
        </button>
      </div>
    </div>
  );
}
