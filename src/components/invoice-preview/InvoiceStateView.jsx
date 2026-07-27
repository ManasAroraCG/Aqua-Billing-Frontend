export default function InvoiceStateView({
  title,
  description,
  tone = "default",
  primaryActionLabel,
  onPrimaryAction,
}) {
  const isError = tone === "error";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div
        className={`max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ${
          isError ? "border border-red-200" : "border border-slate-200"
        }`}
      >
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm text-slate-600">{description}</p>
        ) : null}
        {primaryActionLabel && onPrimaryAction ? (
          <button
            onClick={onPrimaryAction}
            className={`mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
              isError ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {primaryActionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
