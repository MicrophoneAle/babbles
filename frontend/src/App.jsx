import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { api } from "./api";
import EntryPage from "./pages/EntryPage";
import EntriesPage from "./pages/EntriesPage";
import StatsPage from "./pages/StatsPage";
import TagsPage from "./pages/TagsPage";

const WORD_OF_THE_DAY_LIST = [
  "Serendipity",
  "Luminous",
  "Equanimity",
  "Petrichor",
  "Solstice",
  "Vellichor",
  "Ephemeral",
  "Resilience",
  "Quintessential",
  "Melancholy",
  "Sonorous",
  "Wanderlust",
  "Ebullient",
  "Halcyon",
  "Ineffable",
  "Labyrinth",
  "Nocturne",
  "Opulent",
  "Phosphorescence",
  "Quixotic",
  "Ripple",
  "Susurrus",
  "Tempest",
  "Umbral",
  "Vestige",
  "Whimsical",
  "Zenith",
  "Apricity",
  "Bucolic",
  "Crepuscular",
  "Dulcet",
  "Forbearance"
];

function wordOfTheDayLabel() {
  const d = new Date();
  const dayOrdinal = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  return WORD_OF_THE_DAY_LIST[dayOrdinal % WORD_OF_THE_DAY_LIST.length];
}

function JournalSidebarPanels() {
  const [prompts, setPrompts] = useState([]);
  const [hidePrompts, setHidePrompts] = useState(false);
  const [wordOfTheDay] = useState(() => wordOfTheDayLabel());

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

      <section className="left-panel-card mt-auto">
        <h3 className="mb-1 font-heading text-lg italic text-[#3b2a1a]">Word of the Day</h3>
        <p className="font-heading text-2xl italic text-[#6b4a2a]">{wordOfTheDay}</p>
        <p className="mt-2 font-prose text-xs text-[#5c4634]">A word to carry with you today.</p>
      </section>
    </div>
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
    <div className="desk-bg flex min-h-screen items-center justify-center p-6">
      <div className="book-frame relative w-full max-w-7xl rounded-[10px] p-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="book-cover relative w-full overflow-visible rounded-[8px]">
          <div className="absolute inset-y-0 left-0 z-20 w-10 rounded-l-[8px] bg-[#2f2114]" />

          <div className="relative z-0 ml-10 box-border min-h-0 p-[12px]">
            <div className="grid min-h-0 grid-cols-2">
              <div className="page-left flex min-h-0 flex-col rounded-bl-[6px] rounded-tl-[6px] p-6">
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

              <main className="page-right relative z-10 rounded-br-[6px] rounded-tr-[6px] p-6 text-journal-text">
                {children}
              </main>
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-0 overflow-visible"
              aria-hidden
            >
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
            </div>
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
