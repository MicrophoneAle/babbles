import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { api } from "./api";
import EntryPage from "./pages/EntryPage";
import EntriesPage from "./pages/EntriesPage";
import StatsPage from "./pages/StatsPage";
import TagsPage from "./pages/TagsPage";

function JournalSidebarPanels() {
  const [prompts, setPrompts] = useState([]);
  const [hidePrompts, setHidePrompts] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    let active = true;
    setHidePrompts(false);

    async function loadPanels() {
      try {
        const [promptData, tagData] = await Promise.all([api.getPrompts(), api.getTags()]);
        if (!active) return;
        setPrompts(promptData?.prompts || []);
        setAvailableTags((tagData || []).map((tag) => tag.name).filter(Boolean));
      } catch {
        if (!active) return;
        setPrompts([]);
        setAvailableTags([]);
      }
    }

    loadPanels();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {!hidePrompts && prompts.length > 0 ? (
        <section className="left-panel-card">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-heading text-lg italic text-[#3b2a1a]">Daily prompts</h3>
            <button
              type="button"
              onClick={() => setHidePrompts(true)}
              className="text-xs font-semibold text-[#6b4a2a] hover:text-[#3b2a1a]"
            >
              Hide
            </button>
          </div>
          <ul className="space-y-1 font-prose text-sm text-[#4b3a28]">
            {prompts.map((prompt) => (
              <li key={prompt}>- {prompt}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="left-panel-card">
        <h3 className="mb-2 font-heading text-lg italic text-[#3b2a1a]">Available Tags</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#7e6646]/50 bg-[#efe6d2] px-2 py-1 text-xs font-semibold text-[#6b4a2a]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const showJournalPanels = location.pathname === "/";
  const pageSliverColors = [
    "#C4BC9E",
    "#C8C0A3",
    "#CCC4A8",
    "#D0C8AD",
    "#D4CCB2",
    "#D8D0B7",
    "#DDD5BB",
    "#E1D9C0",
    "#E5DDC5",
    "#E9E2CA",
    "#EDE6CF",
    "#F1EAD4",
    "#F5EDD9"
  ];

  return (
    <div className="desk-bg flex h-screen items-center justify-center p-6">
      <div className="book-frame relative h-[92vh] w-full max-w-7xl rounded-[10px] p-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="book-cover relative h-full w-full rounded-[8px]">
          <div className="absolute inset-y-0 left-0 w-10 rounded-l-[8px] bg-[#2f2114]" />
          <div className="bookmark-ribbon absolute right-20 top-0 h-[140px] w-[18px]" />

          <div className="absolute inset-3 grid min-h-0 grid-cols-2">
            <div className="page-left flex h-full min-h-0 flex-col overflow-y-auto rounded-bl-[6px] rounded-tl-[6px] p-6">
              <h1 className="font-heading text-5xl font-bold italic leading-tight text-[#3b2a1a]">Michael's Babbles</h1>
              <p className="mt-1 font-heading text-base italic text-[#6b4a2a]">{format(new Date(), "EEEE, MMM d")}</p>

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

              {showJournalPanels ? <div className="mt-5 space-y-3">{<JournalSidebarPanels />}</div> : null}
            </div>

            <main className="page-right relative h-full min-h-0 overflow-y-auto rounded-br-[6px] rounded-tr-[6px] p-6 text-journal-text">
              {pageSliverColors.map((color, idx) => (
                <span
                  key={color}
                  className="page-sliver"
                  style={{
                    right: `${-(idx + 1) * 4}px`,
                    backgroundColor: color,
                    zIndex: idx
                  }}
                />
              ))}
              {children}
            </main>
          </div>
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
