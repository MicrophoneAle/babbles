import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { format } from "date-fns";
import woodTexture from "./assets/textures/babbles-wood-texture.jpg";
import leatherTexture from "./assets/textures/babbles-leather-book-texture.jpg";
import maroonTexture from "./assets/textures/babbles-maroon-book-texture.jpg";
import { api } from "./api";
import EntryPage from "./pages/EntryPage";
import EntriesPage from "./pages/EntriesPage";
import StatsPage from "./pages/StatsPage";
import TagsPage from "./pages/TagsPage";

const PROMPTS_HIDDEN_KEY = "promptsHiddenDate";

/** Figma nodes 40:5–40:32 / 40:36–40:60 — back (darkest) to front (#F5EDD9). */
const PAGE_STACK_LAYERS = [
  "#c4bc9e",
  "#c8c0a3",
  "#ccc4a8",
  "#d0c8ad",
  "#d4ccb2",
  "#d8d0b7",
  "#ddd5bb",
  "#e1d9c0",
  "#e5ddc5",
  "#e9e2ca",
  "#ede6cf",
  "#f1ead4",
  "#f5edd9"
];

const PAGE_STACK_STEP_PX = 2;
const PAGE_STACK_STRIP_PX = 12;
const PAGE_STACK_TOTAL_WIDTH =
  (PAGE_STACK_LAYERS.length - 1) * PAGE_STACK_STEP_PX + PAGE_STACK_STRIP_PX;

function PageStackLayers({ side }) {
  const onLeftPage = side === "left";

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-[5] ${onLeftPage ? "left-0" : "right-0"}`}
      style={{ width: PAGE_STACK_TOTAL_WIDTH }}
      aria-hidden
    >
      {PAGE_STACK_LAYERS.map((color, index) => {
        const offset = index * PAGE_STACK_STEP_PX;
        const isFirst = index === 0;
        const isLast = index === PAGE_STACK_LAYERS.length - 1;
        const stripBorder =
          isFirst || isLast ? {} : { border: "0.5px solid rgba(160, 140, 110, 0.3)" };
        return (
          <div
            key={color}
            className="absolute inset-y-0"
            style={{
              width: PAGE_STACK_STRIP_PX,
              backgroundColor: color,
              zIndex: index + 1,
              left: onLeftPage ? offset : undefined,
              right: onLeftPage ? undefined : offset,
              ...stripBorder
            }}
          />
        );
      })}
    </div>
  );
}

/** Figma node 40:2 — spine gutter shadow (28px wide). */
function BookSpine() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-[15] h-full w-[28px] -translate-x-1/2"
      style={{
        background:
          "linear-gradient(to right, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.06) 15%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.06) 85%, rgba(0,0,0,0.0) 100%)"
      }}
      aria-hidden
    />
  );
}

function JournalSidebarPanels() {
  const [prompts, setPrompts] = useState([]);
  const [hidePrompts, setHidePrompts] = useState(() => {
    if (typeof window === "undefined") return false;
    const today = new Date().toISOString().slice(0, 10);
    return window.localStorage.getItem(PROMPTS_HIDDEN_KEY) === today;
  });

  useEffect(() => {
    let active = true;

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
            <h3 className="page-subheading text-[#3b2a1a]">Daily prompts</h3>
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                window.localStorage.setItem(PROMPTS_HIDDEN_KEY, today);
                setHidePrompts(true);
              }}
              className="text-ds-xs font-semibold text-[#6b4a2a] hover:text-[#3b2a1a]"
            >
              Hide
            </button>
          </div>
          <ul className="prompt-list space-y-1 text-sm text-[#4b3a28]">
            {prompts.map((prompt) => (
              <li key={prompt}>- {prompt}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function SidebarAuth() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  if (!publishableKey) {
    return (
      <p className="font-ui-hint text-ds-xs leading-snug text-[#6b4a2a]/85">
        Owner sign-in is not configured yet. Add <span className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</span> to enable
        editing.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="w-full rounded-[2px] border border-journal-brown/40 bg-journal-brown px-3 py-2 text-ds-sm font-semibold text-journal-white shadow-sm transition hover:bg-[#5d4533]"
          >
            Sign in
          </button>
        </SignInButton>
        <p className="font-ui-hint text-ds-xs leading-snug text-[#6b4a2a]/80">
          Michael&apos;s Babbles is public to read. Sign in as the owner to write or delete anything.
        </p>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center justify-between gap-2">
          <span className="font-ui-hint text-ds-xs font-semibold text-[#6b4a2a]">Signed in</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const showJournalPanels = location.pathname === "/";

  return (
    <div
      className="desk-bg flex min-h-screen w-full max-w-full min-w-0 items-center justify-center p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(139, 94, 60, 0.55), rgba(139, 94, 60, 0.55)), url(${woodTexture})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div
        className="book-frame relative w-full max-w-full min-w-0 rounded-[5px] p-[10px]"
        style={{
          backgroundImage: `linear-gradient(rgba(123, 45, 45, 0.6), rgba(123, 45, 45, 0.6)), url(${maroonTexture})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div
          className="book-cover box-border w-full max-w-full min-w-0 overflow-hidden rounded-[3px] p-[12px]"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 42, 26, 0.6), rgba(59, 42, 26, 0.6)), url(${leatherTexture})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="relative flex min-h-[calc(100vh-9rem)] w-full min-w-0">
            <BookSpine />
            <div className="page-left relative flex w-1/2 min-w-0 flex-col overflow-y-auto rounded-bl-[2px] rounded-tl-[2px]">
              <PageStackLayers side="left" />
              <div
                className="relative z-10 flex min-h-0 flex-1 flex-col"
                style={{ paddingLeft: PAGE_STACK_TOTAL_WIDTH }}
              >
              <h1 className="app-brand-title italic text-[#3b2a1a]">Michael's Babbles</h1>
              <p className="font-date-sm mt-1 text-[#6b4a2a]">{format(new Date(), "EEEE, MMM d")}</p>

              <nav className="mt-6 flex flex-col gap-2 text-sm font-bold">
                <NavLink className="nav-link" to="/">
                  Babble
                </NavLink>
                <NavLink className="nav-link" to="/entries">
                  Past Babbles
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

              <div className="mt-auto shrink-0 border-t border-journal-brown/15 pt-5">
                <SidebarAuth />
              </div>
              </div>
            </div>

            <main className="page-right relative flex w-1/2 min-w-0 flex-col overflow-y-auto rounded-br-[2px] rounded-tr-[2px] text-journal-text">
              <PageStackLayers side="right" />
              <div
                className="relative z-10 flex min-h-0 flex-1 flex-col"
                style={{ paddingRight: PAGE_STACK_TOTAL_WIDTH }}
              >
                {children}
              </div>
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
        <Route path="/entry/:entryId" element={<EntryPage mode="id" />} />
        <Route path="/entries" element={<EntriesPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/tags" element={<TagsPage />} />
      </Routes>
    </Layout>
  );
}

