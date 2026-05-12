import { NavLink, Route, Routes } from "react-router-dom";
import { format } from "date-fns";
import EntryPage from "./pages/EntryPage";
import EntriesPage from "./pages/EntriesPage";
import StatsPage from "./pages/StatsPage";
import TagsPage from "./pages/TagsPage";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-journal-maroon text-journal-cream">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        <aside className="sticky top-6 h-fit w-64 rounded-[4px] border border-journal-gold/40 bg-journal-maroonSoft p-5 shadow-leather">
          <h1 className="font-heading text-4xl font-bold italic text-journal-gold">Journal</h1>
          <p className="mt-1 text-sm text-[#ddc28b]">{format(new Date(), "EEEE, MMM d")}</p>
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
            <NavLink className="nav-link" to="/tags">
              Tags
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
        <Route path="/tags" element={<TagsPage />} />
      </Routes>
    </Layout>
  );
}
