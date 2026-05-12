import { NavLink, Route, Routes } from "react-router-dom";
import { format } from "date-fns";
import EntryPage from "./pages/EntryPage";
import EntriesPage from "./pages/EntriesPage";
import StatsPage from "./pages/StatsPage";
import TagsPage from "./pages/TagsPage";

function Layout({ children }) {
  return (
    <div className="desk-bg py-8">
      <div className="book-cover relative mx-auto max-w-6xl rounded-[4px] p-3">
        <div className="absolute inset-y-3 left-3 w-8 rounded-[2px] bg-[#2f2114] shadow-inner" />
        <div className="book-page relative ml-7 flex gap-6 p-6">
          <div className="absolute -right-2 top-6 h-[92%] w-2 bg-[#f3f3f0]" />
          <div className="absolute -right-4 top-7 h-[90%] w-2 bg-[#ecebe7]" />
          <div className="absolute -right-6 top-8 h-[88%] w-2 bg-[#e4e2dd]" />
          <aside className="sticky top-6 h-fit w-64 rounded-[4px] border border-[#4c3928] bg-journal-cover p-5 shadow-leather">
            <h1 className="font-heading text-5xl font-bold italic text-[#efe7db]">Journal</h1>
            <p className="mt-1 font-heading text-base italic text-[#c8b8a3]">{format(new Date(), "EEEE, MMM d")}</p>
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
        <main className="flex-1 text-journal-text">{children}</main>
        </div>
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
