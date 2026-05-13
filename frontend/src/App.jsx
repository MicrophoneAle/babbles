import { NavLink, Route, Routes } from "react-router-dom";
import { format } from "date-fns";
import EntryPage from "./pages/EntryPage";
import EntriesPage from "./pages/EntriesPage";
import StatsPage from "./pages/StatsPage";
import TagsPage from "./pages/TagsPage";

function Layout({ children }) {
  const pageLayers = [
    "#f7f7f4",
    "#f1f0ec",
    "#f5f2ea",
    "#ecebe6",
    "#f6f3ed",
    "#eeede7",
    "#f4f1e9",
    "#ebe9e2",
    "#f3f0e8",
    "#e9e7e0"
  ];

  return (
    <div className="desk-bg flex h-screen items-center justify-center p-6">
      <div className="book-cover relative h-[92vh] w-full max-w-6xl rounded-[4px] p-3">
        <div className="absolute inset-y-3 left-3 w-8 rounded-[2px] bg-[#2f2114] shadow-inner" />
        <div className="absolute right-16 top-0 h-36 w-4 bookmark-ribbon shadow-md" />
        <div className="book-page relative ml-7 flex h-full gap-6 p-6">
          {pageLayers.map((shade, idx) => (
            <div
              key={shade + idx}
              className="absolute top-5 w-2 shadow-[inset_-1px_0_0_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.12)]"
              style={{
                right: `${-4 - idx * 3}px`,
                height: `${95 - idx * 0.8}%`,
                background: shade
              }}
            />
          ))}
          <aside className="sticky top-6 h-fit w-64 rounded-[4px] border border-[#4c3928] bg-journal-cover p-5 shadow-leather">
            <h1 className="font-heading text-4xl font-bold italic leading-tight text-[#efe7db]">
              Michael's Babbles
            </h1>
            <p className="mt-1 font-heading text-base italic text-[#c8b8a3]">{format(new Date(), "EEEE, MMM d")}</p>
          <nav className="mt-6 flex flex-col gap-2 text-sm font-bold">
            <NavLink className="nav-link" to="/">
              Journal
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
        <main className="flex-1 overflow-y-auto pr-3 text-journal-text">{children}</main>
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
