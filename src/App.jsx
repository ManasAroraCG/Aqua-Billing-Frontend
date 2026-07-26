import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Layout from "./layout/Layout";
import Billing from "./pages/Billing";
import Invoices from "./pages/Invoices";
import InvoicePreview from "./components/InvoicePreview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Billing /></Layout>} />
        <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
        <Route path="/invoices/:id" element={<InvoicePreview />} />
        <Route path="/invoice-preview" element={<InvoicePreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;