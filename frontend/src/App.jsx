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

  useEffect(() => {
    let active = true;
    setHidePrompts(false);

    async function loadPanels() {
      try {
        const promptData = await api.getPrompts();
        if (!active) return;
        setPrompts(promptData?.prompts || []);
      } catch {
        if (!active) return;
        setPrompts([]);
      }
    }

    loadPanels();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
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
    </div>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const showJournalPanels = location.pathname === "/";

  return (
    <div className="desk-bg flex min-h-screen w-full max-w-full min-w-0 items-center justify-center p-6">
      <div className="book-frame relative w-full max-w-full min-w-0 rounded-[5px] p-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="book-cover box-border w-full max-w-full min-w-0 overflow-hidden rounded-[3px] p-[12px]">
          <div className="flex min-h-[calc(100vh-9rem)] w-full min-w-0">
            <div className="page-left flex w-1/2 min-w-0 flex-col overflow-y-auto rounded-bl-[2px] rounded-tl-[2px] p-6">
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

              {showJournalPanels ? (
                <div className="mt-5 flex min-h-0 flex-1 flex-col">
                  <JournalSidebarPanels />
                </div>
              ) : null}
            </div>

            <main className="page-right flex w-1/2 min-w-0 flex-col overflow-y-auto rounded-br-[2px] rounded-tr-[2px] p-6 text-journal-text">
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
