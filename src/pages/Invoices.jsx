import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, ReceiptText, RefreshCw } from "lucide-react";
import api from "../services/api";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function SkeletonRows() {
  return (
    <tbody>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-slate-100">
          <td className="px-4 py-4 sm:px-6">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-4 py-4 sm:px-6">
            <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-4 py-4 sm:px-6">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-4 py-4 text-right sm:px-6">
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-4 py-4 text-right sm:px-6">
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-4 py-4 text-right sm:px-6">
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-4 py-4 text-right sm:px-6">
            <div className="ml-auto h-9 w-24 animate-pulse rounded-xl bg-slate-200" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInvoices() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices");
      setInvoices(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) {
      return invoices;
    }

    const query = searchTerm.toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceNumber = String(invoice.invoiceNumber || "").toLowerCase();
      const customerName = String(invoice.customerName || "").toLowerCase();

      return invoiceNumber.includes(query) || customerName.includes(query);
    });
  }, [invoices, searchTerm]);

  function handleViewInvoice(invoice) {
    navigate(`/invoices/${invoice.id}`, {
      state: {
        invoice,
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Invoice History
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          View and manage generated invoices
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Search Invoices
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number or customer"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:text-base"
          />
        </div>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3 sm:px-6">Invoice No.</th>
                  <th className="px-4 py-3 sm:px-6">Customer</th>
                  <th className="px-4 py-3 sm:px-6">Date</th>
                  <th className="px-4 py-3 text-right sm:px-6">Subtotal</th>
                  <th className="px-4 py-3 text-right sm:px-6">GST</th>
                  <th className="px-4 py-3 text-right sm:px-6">Grand Total</th>
                  <th className="px-4 py-3 text-right sm:px-6">Action</th>
                </tr>
              </thead>
              <SkeletonRows />
            </table>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-red-700">{error}</p>
          <button
            onClick={loadInvoices}
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ReceiptText className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No invoices generated yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Generate an invoice from the billing page and it will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3 sm:px-6">Invoice No.</th>
                  <th className="px-4 py-3 sm:px-6">Customer</th>
                  <th className="px-4 py-3 sm:px-6">Date</th>
                  <th className="px-4 py-3 text-right sm:px-6">Subtotal</th>
                  <th className="px-4 py-3 text-right sm:px-6">GST</th>
                  <th className="px-4 py-3 text-right sm:px-6">Grand Total</th>
                  <th className="px-4 py-3 text-right sm:px-6">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => {
                  const subTotal = Number(invoice.subTotal || 0);
                  const gstAmount = Number(invoice.gstAmount || 0);
                  const grandTotal = Number(invoice.grandTotal || 0);

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-900 sm:px-6">
                        {invoice.invoiceNumber || "-"}
                      </td>
                      <td className="px-4 py-4 sm:px-6">{invoice.customerName || "Unknown Customer"}</td>
                      <td className="px-4 py-4 sm:px-6">{formatDate(invoice.invoiceDate)}</td>
                      <td className="px-4 py-4 text-right tabular-nums sm:px-6">₹{formatAmount(subTotal)}</td>
                      <td className="px-4 py-4 text-right tabular-nums sm:px-6">₹{formatAmount(gstAmount)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-900 tabular-nums sm:px-6">
                        ₹{formatAmount(grandTotal)}
                      </td>
                      <td className="px-4 py-4 text-right sm:px-6">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 sm:px-4 sm:text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
