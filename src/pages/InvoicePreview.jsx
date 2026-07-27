import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvoiceActionBar from "../components/invoice-preview/InvoiceActionBar";
import InvoiceStateView from "../components/invoice-preview/InvoiceStateView";
import InvoiceContentCard from "../components/invoice-preview/InvoiceContentCard";
import InvoiceExportSheet from "../components/invoice-preview/InvoiceExportSheet";
import { getInvoicePreviewData } from "../services/invoice-preview-service";

const DEFAULT_SIGNATURE = {
  name: "Aqua Billing",
  title: "Authorized Signatory",
};

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

export default function InvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ref } = useParams();

  const [isExporting, setIsExporting] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [invoice, setInvoice] = useState(null);
  const exportRef = useRef(null);

  const state = location.state || {};
  const stateInvoiceId = state?.invoiceId || state?.invoice?.id || null;
  const routeInvoiceRef = decodeURIComponent(String(ref || "")).trim();

  async function loadInvoice() {
    try {
      setLoadingInvoice(true);
      setLoadError("");

      const loadedInvoice = await getInvoicePreviewData({
        invoiceRef: routeInvoiceRef,
        stateInvoiceId,
      });

      setInvoice(loadedInvoice);
    } catch (error) {
      console.error(error);
      setInvoice(null);
      setLoadError(error?.message || "Unable to load invoice");
    } finally {
      setLoadingInvoice(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrapInvoice() {
      try {
        const loadedInvoice = await getInvoicePreviewData({
          invoiceRef: routeInvoiceRef,
          stateInvoiceId,
        });

        if (!cancelled) {
          setInvoice(loadedInvoice);
          setLoadError("");
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setInvoice(null);
          setLoadError(error?.message || "Unable to load invoice");
        }
      } finally {
        if (!cancelled) {
          setLoadingInvoice(false);
        }
      }
    }

    bootstrapInvoice();

    return () => {
      cancelled = true;
    };
  }, [routeInvoiceRef, stateInvoiceId]);

  const customerName = invoice?.customerName || "";
  const customerGstNumber = invoice?.customerGstNumber || "";
  const customerPhone = invoice?.customerPhone || "";

  const invoiceDate = useMemo(() => {
    const raw = invoice?.invoiceDate || new Date().toISOString();
    return new Date(raw).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [invoice?.invoiceDate]);

  const amountInWords = useMemo(() => numberToWords(invoice?.grandTotal), [invoice?.grandTotal]);

  const products = (Array.isArray(invoice?.items) ? invoice.items : []).map(
    (item, index) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      const amount = Number(item.subTotal || quantity * price);

      return {
        productId: item.productId || index + 1,
        productName: item.productName || `Product ${index + 1}`,
        quantity,
        price,
        amount,
      };
    }
  );

  async function buildInvoicePdf() {
    if (!exportRef.current) return null;

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

    return pdf;
  }

  async function downloadPdf() {
    try {
      setIsExporting(true);
      const pdf = await buildInvoicePdf();

      if (!pdf) {
        throw new Error("Unable to generate PDF");
      }

      pdf.save(`${invoice?.invoiceNumber || "invoice"}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF download failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handlePrint() {
    try {
      setIsExporting(true);
      const pdf = await buildInvoicePdf();

      if (!pdf) {
        throw new Error("Unable to generate PDF for print");
      }

      pdf.autoPrint();
      window.open(pdf.output("bloburl"), "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Print preparation failed:", error);
      alert("Print failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  if (loadingInvoice) {
    return <InvoiceStateView title="Loading invoice..." />;
  }

  if (loadError && !invoice) {
    return (
      <InvoiceStateView
        title={loadError}
        tone="error"
        primaryActionLabel="Retry"
        onPrimaryAction={loadInvoice}
      />
    );
  }

  if (!invoice) {
    return (
      <InvoiceStateView
        title="Invoice preview unavailable"
        description="Generate an invoice from Billing to open the printable preview."
        primaryActionLabel="Back to Billing"
        onPrimaryAction={() => navigate("/")}
      />
    );
  }

  return (
    <div className="invoice-preview-page min-h-screen bg-slate-100 px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8 print:bg-white print:p-0">
      <div className="mx-auto flex w-full max-w-[850px] flex-col gap-4 print:max-w-none print:gap-0">
        <InvoiceActionBar
          isExporting={isExporting}
          onDownloadPdf={downloadPdf}
          onPrint={handlePrint}
          onBack={() => navigate("/")}
        />

        <InvoiceContentCard
          invoice={invoice}
          invoiceDate={invoiceDate}
          customerName={customerName}
          customerGstNumber={customerGstNumber}
          customerPhone={customerPhone}
          products={products}
          amountInWords={amountInWords}
          formatCurrency={formatCurrency}
          signature={DEFAULT_SIGNATURE}
        />

        <div className="print-only">
          <InvoiceExportSheet
            invoice={invoice}
            invoiceDate={invoiceDate}
            customerName={customerName}
            customerGstNumber={customerGstNumber}
            customerPhone={customerPhone}
            products={products}
            amountInWords={amountInWords}
            formatCurrency={formatCurrency}
            signature={DEFAULT_SIGNATURE}
          />
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
            formatCurrency={formatCurrency}
            signature={DEFAULT_SIGNATURE}
          />
        </div>
      </div>
    </div>
  );
}
