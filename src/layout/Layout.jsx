import { NavLink } from "react-router";

const mobileLinkClass = ({ isActive }) =>
  [
    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
    isActive ? "bg-white text-slate-900" : "bg-white/5 text-white/80",
  ].join(" ");

const desktopLinkClass = ({ isActive }) =>
  [
    "block rounded-xl px-3 py-2 transition",
    isActive
      ? "bg-white/10 text-white"
      : "text-white/80 hover:bg-white/10 hover:text-white",
  ].join(" ");

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      <header className="lg:hidden sticky top-0 z-40 border-b border-slate-800 bg-slate-900 px-4 py-3 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight">
            AquaBilling
          </h1>
          <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
            Billing Suite
          </span>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <NavLink className={mobileLinkClass} to="/" end>
            Billing
          </NavLink>

          <NavLink className={mobileLinkClass} to="/invoices">
            Invoice History
          </NavLink>
        </nav>
      </header>

      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-slate-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">
          AquaBilling
        </h1>

        <nav className="space-y-3">
          <NavLink className={desktopLinkClass} to="/" end>
            Billing
          </NavLink>

          <NavLink className={desktopLinkClass} to="/invoices">
            Invoice History
          </NavLink>
        </nav>
      </aside>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-100">
        {children}
      </div>
    </div>
  );
}