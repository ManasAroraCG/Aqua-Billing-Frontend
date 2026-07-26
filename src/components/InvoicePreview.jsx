import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../services/api";

function formatCurrency(amount) {
	return new Intl.NumberFormat("en-IN", {
		maximumFractionDigits: 0,
	}).format(Math.round(Number(amount || 0)));
}

function numberToWords(value) {
	const number = Math.floor(Math.abs(Number(value) || 0));

	if (number === 0) {
		return "Zero Rupees Only";
	}

	const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
	const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
	const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

	function twoDigitsToWords(n) {
		if (n < 10) return ones[n];
		if (n < 20) return teens[n - 10];

		const ten = Math.floor(n / 10);
		const unit = n % 10;

		return `${tens[ten]}${unit ? ` ${ones[unit]}` : ""}`;
	}

	function threeDigitsToWords(n) {
		const hundred = Math.floor(n / 100);
		const remainder = n % 100;
		const parts = [];

		if (hundred) {
			parts.push(`${ones[hundred]} Hundred`);
		}

		if (remainder) {
			parts.push(twoDigitsToWords(remainder));
		}

		return parts.join(" ");
	}

	const crore = Math.floor(number / 10000000);
	const lakh = Math.floor((number % 10000000) / 100000);
	const thousand = Math.floor((number % 100000) / 1000);
	const remainder = number % 1000;

	const parts = [];

	if (crore) parts.push(`${threeDigitsToWords(crore)} Crore`);
	if (lakh) parts.push(`${threeDigitsToWords(lakh)} Lakh`);
	if (thousand) parts.push(`${threeDigitsToWords(thousand)} Thousand`);
	if (remainder) parts.push(threeDigitsToWords(remainder));

	return `${parts.join(" ")} Rupees Only`.replace(/\s+/g, " ").trim();
}

function InvoiceExportSheet({
	invoice,
	invoiceDate,
	customerName,
	customerGstNumber,
	customerPhone,
	products,
	amountInWords,
}) {
	return (
		<div
			style={{
				width: "794px",
				background: "#ffffff",
				color: "#0f172a",
				fontFamily: "Arial, Helvetica, sans-serif",
				padding: "28px",
				boxSizing: "border-box",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					gap: "16px",
					borderBottom: "2px solid #cbd5e1",
					paddingBottom: "18px",
				}}
			>
				<div style={{ flex: 1 }}>
					<div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.24em", color: "#c2410c", textTransform: "uppercase" }}>
						Tax Invoice
					</div>
					<div style={{ marginTop: "8px", fontSize: "28px", fontWeight: 800, lineHeight: 1.1 }}>
						Aqua Billing
					</div>
					<div style={{ marginTop: "4px", fontSize: "14px", color: "#475569" }}>
						Sanitaryware &amp; Bath Fittings
					</div>
					<div style={{ marginTop: "10px", fontSize: "12px", lineHeight: 1.6, color: "#475569" }}>
						Ahmedabad, Gujarat | GSTIN: 24AABCA1234F1Z5 | Ph: +91 98765 43210
					</div>
				</div>

				<div style={{ width: "240px", border: "1px solid #cbd5e1", borderRadius: "12px", background: "#f8fafc", padding: "14px" }}>
					<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "10px", gap: "12px" }}>
						<span style={{ color: "#64748b", fontWeight: 600 }}>Invoice No</span>
						<span style={{ fontWeight: 700, color: "#0f172a", textAlign: "right", wordBreak: "break-all" }}>{invoice.invoiceNumber}</span>
					</div>
					<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", gap: "12px" }}>
						<span style={{ color: "#64748b", fontWeight: 600 }}>Invoice Date</span>
						<span style={{ fontWeight: 700, color: "#0f172a" }}>{invoiceDate}</span>
					</div>
				</div>
			</div>

			<div style={{ marginTop: "16px", border: "1px solid #cbd5e1", borderRadius: "12px", background: "#f8fafc", padding: "14px 16px", display: "flex", justifyContent: "space-between", gap: "16px" }}>
				<div>
					<div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase" }}>Customer</div>
					<div style={{ marginTop: "6px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>{customerName || "Walk-in Customer"}</div>
				</div>
				<div style={{ textAlign: "right", fontSize: "12px", lineHeight: 1.8 }}>
					{customerGstNumber ? (
						<div>
							<span style={{ color: "#64748b" }}>GST Number: </span>
							<span style={{ fontWeight: 700 }}>{customerGstNumber}</span>
						</div>
					) : null}
					{customerPhone ? (
						<div>
							<span style={{ color: "#64748b" }}>Phone: </span>
							<span style={{ fontWeight: 700 }}>{customerPhone}</span>
						</div>
					) : null}
				</div>
			</div>

			<div style={{ marginTop: "16px", border: "1px solid #cbd5e1", borderRadius: "12px", overflow: "hidden" }}>
				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
					<thead>
						<tr style={{ background: "#0f172a", color: "#ffffff" }}>
							<th style={{ textAlign: "left", padding: "10px 12px", borderRight: "1px solid #334155" }}>Product</th>
							<th style={{ width: "70px", textAlign: "center", padding: "10px 12px", borderRight: "1px solid #334155" }}>Qty</th>
							<th style={{ width: "110px", textAlign: "right", padding: "10px 12px", borderRight: "1px solid #334155" }}>Rate</th>
							<th style={{ width: "110px", textAlign: "right", padding: "10px 12px" }}>Amount</th>
						</tr>
					</thead>
					<tbody>
						{products.map((item, index) => (
							<tr key={item.productId} style={{ borderTop: "1px solid #e2e8f0", background: index % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
								<td style={{ padding: "10px 12px", fontWeight: 600, color: "#0f172a" }}>{item.productName}</td>
								<td style={{ padding: "10px 12px", textAlign: "center", color: "#334155" }}>{item.quantity}</td>
								<td style={{ padding: "10px 12px", textAlign: "right", color: "#334155" }}>₹{formatCurrency(item.price)}</td>
								<td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>₹{formatCurrency(item.amount)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div style={{ marginTop: "16px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
				<div style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "12px", background: "#f8fafc", padding: "14px" }}>
					<div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase" }}>Amount in Words</div>
					<div style={{ marginTop: "8px", fontSize: "13px", fontWeight: 700, lineHeight: 1.6, color: "#0f172a" }}>{amountInWords}</div>
				</div>

				<div style={{ width: "280px", border: "1px solid #cbd5e1", borderRadius: "12px", overflow: "hidden" }}>
					<div style={{ background: "#f8fafc", padding: "10px 14px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#334155", textTransform: "uppercase", borderBottom: "1px solid #cbd5e1" }}>
						Totals
					</div>
					<div style={{ padding: "12px 14px" }}>
						<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "8px" }}>
							<span>Subtotal</span>
							<span style={{ fontWeight: 700, color: "#0f172a" }}>₹{formatCurrency(invoice.subTotal)}</span>
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "10px" }}>
							<span>GST (5%)</span>
							<span style={{ fontWeight: 700, color: "#0f172a" }}>₹{formatCurrency(invoice.gstAmount)}</span>
						</div>
						<div style={{ background: "#0f172a", color: "#ffffff", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Grand Total</span>
							<span style={{ fontSize: "17px", fontWeight: 800 }}>₹{formatCurrency(invoice.grandTotal)}</span>
						</div>
					</div>
				</div>
			</div>

			<div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
				<div style={{ width: "260px", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
					<div style={{ height: "80px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "#f8fafc" }} />
					<div style={{ marginTop: "10px", borderTop: "1px solid #cbd5e1", paddingTop: "10px", fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
						Authorized Signatory
					</div>
				</div>
			</div>
		</div>
	);
}

export default function InvoicePreview() {
	const navigate = useNavigate();
	const location = useLocation();
	const { id } = useParams();
	const [isExporting, setIsExporting] = useState(false);
	const [loadingInvoice, setLoadingInvoice] = useState(false);
	const [loadError, setLoadError] = useState("");
	const [historyInvoice, setHistoryInvoice] = useState(null);
	const [historyCart, setHistoryCart] = useState([]);
	const exportRef = useRef(null);

	const state = location.state || {};
	const invoice = state.invoice || historyInvoice;
	const cart = (state.cart && state.cart.length > 0 ? state.cart : historyCart) || [];
	const customerName = state.customerName || invoice?.customerName || "";
	const customerGstNumber = state.customerGstNumber || invoice?.customerGstNumber || "";
	const customerPhone = state.customerPhone || invoice?.customerPhone || "";

	useEffect(() => {
		if (!id || state.invoice) {
			return;
		}

		loadInvoiceById(id);
	}, [id]);

	async function loadInvoiceById(invoiceId) {
		try {
			setLoadingInvoice(true);
			setLoadError("");

			const response = await api.get(`/invoices/${invoiceId}`);
			const data = response.data || {};

			const items =
				data.items ||
				data.invoiceItems ||
				data.products ||
				[];

			const normalizedItems = items.map((item, index) => {
				const productId = item.productId || item.id || index + 1;
				const quantity = Number(item.quantity || item.qty || 1);
				const price = Number(
					item.price ||
					item.unitPrice ||
					item.rate ||
					item.customPrice ||
					0
				);

				return {
					productId,
					productName:
						item.productName ||
						item.name ||
						item.product?.productName ||
						`Product ${index + 1}`,
					quantity,
					price,
					amount: quantity * price,
				};
			});

			const computedSubTotal = normalizedItems.reduce(
				(total, item) => total + item.amount,
				0
			);
			const computedGst = computedSubTotal * 0.05;
			const computedGrandTotal = computedSubTotal + computedGst;

			setHistoryCart(normalizedItems);
			setHistoryInvoice({
				...data,
				subTotal:
					data.subTotal ?? computedSubTotal,
				gstAmount:
					data.gstAmount ?? computedGst,
				grandTotal:
					data.grandTotal ?? computedGrandTotal,
			});
		} catch (error) {
			console.error(error);
			setLoadError("Unable to load invoice");
		} finally {
			setLoadingInvoice(false);
		}
	}

	const invoiceDate = useMemo(() => {
		const raw = invoice?.invoiceDate || new Date().toISOString();
		return new Date(raw).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	}, [invoice?.invoiceDate]);

	const amountInWords = useMemo(() => numberToWords(invoice?.grandTotal), [invoice?.grandTotal]);

	const products = cart.map((item, index) => ({
		...item,
		srNo: index + 1,
		amount: item.price * item.quantity,
	}));

	async function downloadPdf() {
		if (!exportRef.current) return;

		try {
			setIsExporting(true);

			const canvas = await html2canvas(exportRef.current, {
				scale: 1.5,
				useCORS: true,
				backgroundColor: "#ffffff",
				windowWidth: 900,
				windowHeight: exportRef.current.scrollHeight,
				scrollX: 0,
				scrollY: 0,
			});

			const pdf = new jsPDF({
				orientation: "p",
				unit: "mm",
				format: "a4",
				compress: true,
			});

			const marginMm = 10;
			const pdfWidthMm = 210 - marginMm * 2;
			const pdfHeightMm = 297 - marginMm * 2;
			const pxPerMm = canvas.width / pdfWidthMm;
			const pageHeightPx = Math.floor(pdfHeightMm * pxPerMm);

			let renderedHeightPx = 0;
			let isFirstPage = true;

			while (renderedHeightPx < canvas.height) {
				const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);

				const pageCanvas = document.createElement("canvas");
				pageCanvas.width = canvas.width;
				pageCanvas.height = sliceHeightPx;

				const ctx = pageCanvas.getContext("2d");
				if (!ctx) {
					throw new Error("Could not get canvas context");
				}

				ctx.drawImage(canvas, 0, renderedHeightPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

				const imageData = pageCanvas.toDataURL("image/jpeg", 0.75);
				const imageHeightMm = (sliceHeightPx * pdfWidthMm) / canvas.width;

				if (!isFirstPage) {
					pdf.addPage();
				}

				pdf.addImage(imageData, "JPEG", marginMm, marginMm, pdfWidthMm, imageHeightMm);
				renderedHeightPx += sliceHeightPx;
				isFirstPage = false;
			}

			pdf.save(`${invoice.invoiceNumber}.pdf`);
		} catch (error) {
			console.error("PDF export failed:", error);
			alert("PDF download failed. Please try again.");
		} finally {
			setIsExporting(false);
		}
	}

	function handlePrint() {
		window.print();
	}

	if (loadingInvoice) {
		return (
			<div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
				<div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-700 shadow-sm">
					Loading invoice...
				</div>
			</div>
		);
	}

	if (loadError && !invoice) {
		return (
			<div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
				<div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
					<h1 className="text-xl font-bold text-slate-900">{loadError}</h1>
					<button
						onClick={() => loadInvoiceById(id)}
						className="mt-6 inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
				<div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
					<h1 className="text-2xl font-bold text-slate-900">Invoice preview unavailable</h1>
					<p className="mt-3 text-sm text-slate-600">Generate an invoice from Billing to open the printable preview.</p>
					<button
						onClick={() => navigate("/")}
						className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
					>
						Back to Billing
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="invoice-preview-page min-h-screen bg-slate-100 px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8 print:bg-white print:p-0">
			<div className="mx-auto flex w-full max-w-[850px] flex-col gap-4 print:max-w-none print:gap-0">
				<div className="no-print flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Invoice Preview</h1>
						<p className="mt-1 text-sm text-slate-600">Professional GST invoice ready for print and PDF download.</p>
					</div>

					<div className="flex flex-col gap-2 sm:flex-row">
						<button
							onClick={downloadPdf}
							disabled={isExporting}
							className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
						>
							{isExporting ? "Generating..." : "Download PDF"}
						</button>
						<button
							onClick={handlePrint}
							className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
						>
							Print
						</button>
						<button
							onClick={() => navigate("/")}
							className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400 sm:w-auto"
						>
							Back To Billing
						</button>
					</div>
				</div>

				<div className="invoice-card mx-auto w-full overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 print:mx-0 print:rounded-none print:shadow-none print:ring-0">
					<div className="invoice-stage p-3 text-slate-900 sm:p-6 lg:p-8 print:p-0">
						<div className="border-b border-slate-200 pb-5 sm:pb-6">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
								<div className="space-y-2">
									<div>
										<p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-600">Tax Invoice</p>
										<h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Aqua Billing</h2>
										<p className="mt-1 text-sm font-medium text-slate-600 sm:text-[15px]">Sanitaryware &amp; Bath Fittings</p>
									</div>
									<div className="text-sm leading-6 text-slate-600">
										<p>Ahmedabad, Gujarat | GSTIN: 24AABCA1234F1Z5 | Ph: +91 98765 43210</p>
									</div>
								</div>

								<div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:max-w-[280px]">
									<div className="space-y-3 text-sm">
										<div className="flex items-start justify-between gap-3">
											<span className="font-medium text-slate-500">Invoice No</span>
											<span className="text-right font-semibold text-slate-950 break-all">{invoice.invoiceNumber}</span>
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
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Customer</p>
									<p className="mt-2 text-lg font-semibold text-slate-950">{customerName || "Walk-in Customer"}</p>
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
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Amount in Words</p>
								<p className="mt-2 text-base font-semibold leading-7 text-slate-950 sm:text-lg">{amountInWords}</p>
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
								<div className="h-24 rounded-2xl border border-dashed border-slate-300 bg-slate-50" />
								<div className="mt-4 border-t border-slate-200 pt-3 text-sm font-semibold text-slate-800">Authorized Signatory</div>
							</div>
						</div>
					</div>
				</div>

				<div
					ref={exportRef}
					className="no-print"
					style={{
						position: "absolute",
						left: "-10000px",
						top: 0,
						width: "794px",
						background: "#ffffff",
						pointerEvents: "none",
					}}
				>
					<InvoiceExportSheet
						invoice={invoice}
						invoiceDate={invoiceDate}
						customerName={customerName}
						customerGstNumber={customerGstNumber}
						customerPhone={customerPhone}
						products={products}
						amountInWords={amountInWords}
					/>
				</div>
			</div>
		</div>
	);
}
