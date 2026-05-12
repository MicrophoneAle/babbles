import { NavLink, Route, Routes } from "react-router-dom";
import { format } from "date-fns";
import EntryPage from "./pages/EntryPage";
import EntriesPage from "./pages/EntriesPage";
import StatsPage from "./pages/StatsPage";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9d5ff] via-[#d9f8ee] to-[#ffd8be] text-slate-700">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        <aside className="sticky top-6 h-fit w-64 rounded-3xl border border-white/40 bg-white/65 p-5 shadow-soft backdrop-blur-md">
          <h1 className="text-2xl font-extrabold text-violet-700">Pastel Journal</h1>
          <p className="mt-1 text-sm text-slate-500">{format(new Date(), "EEEE, MMM d")}</p>
          <nav className="mt-6 flex flex-col gap-2 text-sm font-bold">
            <NavLink className="nav-link" to="/">
              Today
            </NavLink>
            <NavLink className="nav-link" to="/entries">
              Entries
            </NavLink>
            <NavLink className="nav-link" to="/stats">
              Stats
            </NavLink>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<EntryPage mode="today" />} />
        <Route path="/entry/:date" element={<EntryPage mode="date" />} />
        <Route path="/entries" element={<EntriesPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </Layout>
  );
}
