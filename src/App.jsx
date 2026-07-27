import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Layout from "./layout/Layout";
import Billing from "./pages/Billing";
import Invoices from "./pages/Invoices";
import InvoicePreview from "./pages/InvoicePreview";
import { waitForBackendReady } from "./services/api";

function StartupLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <h1 className="mt-5 text-xl font-bold text-slate-900">Starting AquaBilling</h1>
        <p className="mt-2 text-sm text-slate-600">
          Waking up the backend server. This may take a few seconds after inactivity.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function warmup() {
      await waitForBackendReady({
        endpoint: "/customers",
        timeoutMs: 10000,
        retryDelayMs: 3000,
      });

      if (active) {
        setIsBackendReady(true);
      }
    }

    warmup();

    return () => {
      active = false;
    };
  }, []);

  if (!isBackendReady) {
    return <StartupLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Billing /></Layout>} />
        <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
        <Route path="/invoices/view/:ref" element={<InvoicePreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;