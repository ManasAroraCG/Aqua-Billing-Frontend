export default function InvoiceExportSheet({
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
  const linesNeeded = Math.max(5, 9 - products.length);
  const fillerRows = Array.from({ length: linesNeeded });

  return (
    <div
      style={{
        width: "794px",
        background: "#ffffff",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "14px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ border: "1px solid #374151", padding: "10px 12px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Tax Invoice
        </div>
        <div style={{ marginTop: "2px", fontSize: "34px", fontWeight: 800, letterSpacing: "0.02em", color: "#b91c1c", lineHeight: 1 }}>
          AQUA BILLING
        </div>
        <div style={{ marginTop: "4px", fontSize: "11px", lineHeight: 1.45 }}>
          Sanitaryware, Bath Fittings and Allied Products
          <br />
          Ahmedabad, Gujarat | GSTIN: 24AABCA1234F1Z5 {customerPhone ? `| Ph: ${customerPhone}` : ""}
        </div>
      </div>

      <div style={{ marginTop: "8px", border: "1px solid #374151" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: "6px 8px", borderRight: "1px solid #374151", fontSize: "12px" }}>
            <strong>GSTIN:</strong> 24AABCA1234F1Z5
          </div>
          <div style={{ padding: "6px 8px", fontSize: "12px", textAlign: "right" }}>
            <strong>Invoice Date:</strong> {invoiceDate}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "8px", border: "1px solid #374151" }}>
        <div style={{ borderBottom: "1px solid #374151", padding: "4px 8px", fontSize: "11px", fontWeight: 700, textAlign: "center" }}>
          Details of Receiver (Billed to)
        </div>
        <div style={{ padding: "6px 8px", fontSize: "11px", lineHeight: 1.55 }}>
          <div><strong>Name:</strong> {customerName || "Walk-in Customer"}</div>
          <div><strong>Address:</strong> -</div>
          <div><strong>GSTIN:</strong> {customerGstNumber || "-"}</div>
          <div><strong>Invoice No:</strong> {invoice?.invoiceNumber || "-"}</div>
        </div>
      </div>

      <div style={{ marginTop: "8px", border: "1px solid #374151" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "#f3f4f6", color: "#111827" }}>
              <th style={{ width: "42px", textAlign: "center", padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #374151" }}>No.</th>
              <th style={{ textAlign: "left", padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #374151" }}>NAME OF PRODUCT / SERVICE</th>
              <th style={{ width: "90px", textAlign: "center", padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #374151" }}>HSN</th>
              <th style={{ width: "72px", textAlign: "center", padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #374151" }}>QTY</th>
              <th style={{ width: "105px", textAlign: "right", padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #374151" }}>RATE</th>
              <th style={{ width: "118px", textAlign: "right", padding: "6px", borderBottom: "1px solid #374151" }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr key={item.productId}>
                <td style={{ padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #d1d5db", textAlign: "center" }}>{index + 1}</td>
                <td style={{ padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #d1d5db" }}>{item.productName}</td>
                <td style={{ padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #d1d5db", textAlign: "center" }}>-</td>
                <td style={{ padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #d1d5db", textAlign: "center" }}>{item.quantity}</td>
                <td style={{ padding: "6px", borderRight: "1px solid #374151", borderBottom: "1px solid #d1d5db", textAlign: "right" }}>₹{formatCurrency(item.price)}</td>
                <td style={{ padding: "6px", borderBottom: "1px solid #d1d5db", textAlign: "right" }}>₹{formatCurrency(item.amount)}</td>
              </tr>
            ))}
            {fillerRows.map((_, index) => (
              <tr key={`filler-${index}`}>
                <td style={{ padding: "8px", borderRight: "1px solid #374151", borderBottom: "1px solid #e5e7eb" }}>&nbsp;</td>
                <td style={{ padding: "8px", borderRight: "1px solid #374151", borderBottom: "1px solid #e5e7eb" }}>&nbsp;</td>
                <td style={{ padding: "8px", borderRight: "1px solid #374151", borderBottom: "1px solid #e5e7eb" }}>&nbsp;</td>
                <td style={{ padding: "8px", borderRight: "1px solid #374151", borderBottom: "1px solid #e5e7eb" }}>&nbsp;</td>
                <td style={{ padding: "8px", borderRight: "1px solid #374151", borderBottom: "1px solid #e5e7eb" }}>&nbsp;</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "8px" }}>
        <div style={{ border: "1px solid #374151", padding: "8px", minHeight: "138px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>
            Total Invoice Value (in words)
          </div>
          <div style={{ fontSize: "12px", lineHeight: 1.5 }}>{amountInWords}</div>
        </div>

        <div style={{ border: "1px solid #374151" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", fontSize: "11px" }}>
            <div style={{ padding: "6px 8px", borderBottom: "1px solid #d1d5db" }}>Total Amount Before Tax</div>
            <div style={{ padding: "6px 8px", borderBottom: "1px solid #d1d5db", textAlign: "right" }}>₹{formatCurrency(invoice.subTotal)}</div>
            <div style={{ padding: "6px 8px", borderBottom: "1px solid #d1d5db" }}>Add GST @ 5%</div>
            <div style={{ padding: "6px 8px", borderBottom: "1px solid #d1d5db", textAlign: "right" }}>₹{formatCurrency(invoice.gstAmount)}</div>
            <div style={{ padding: "7px 8px", fontWeight: 700 }}>TOTAL AMOUNT</div>
            <div style={{ padding: "7px 8px", fontWeight: 700, textAlign: "right" }}>₹{formatCurrency(invoice.grandTotal)}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "8px", border: "1px solid #374151", padding: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "8px", minHeight: "92px" }}>
          <div style={{ fontSize: "10px", lineHeight: 1.5 }}>
            <strong>Terms & Conditions:</strong>
            <br />
            1. Goods once sold will not be taken back.
            <br />
            2. Subject to Ahmedabad jurisdiction only.
            <br />
            3. Payment due within agreed credit period.
          </div>
          <div style={{ textAlign: "center", fontSize: "11px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ marginBottom: "8px", minHeight: "34px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div
                style={{
                  fontFamily: '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive',
                  fontSize: "27px",
                  lineHeight: 1,
                  color: "#0f172a",
                }}
              >
                {signature.name}
              </div>
            </div>
            <div style={{ borderTop: "1px solid #374151", paddingTop: "6px", fontWeight: 700 }}>
              For AQUA BILLING - {signature.title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
