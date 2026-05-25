import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

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

function SidebarAuth({ compact = false }) {
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
            className={`w-full rounded-[2px] border border-journal-brown/40 bg-journal-brown px-3 text-ds-sm font-semibold text-journal-white shadow-sm transition hover:bg-[#5d4533] ${
              compact ? "min-h-11 py-2.5" : "py-2"
            }`}
          >
            Sign in
          </button>
        </SignInButton>
        {!compact ? (
          <p className="font-ui-hint text-ds-xs leading-snug text-[#6b4a2a]/80">
            Michael&apos;s Babbles is public to read. Sign in as the owner to write or delete anything.
          </p>
        ) : null}
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

function MobileNavDrawer({ open, onClose, showJournalPanels }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={`mobile-drawer-backdrop fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside
        className={`mobile-drawer fixed inset-y-0 left-0 z-[70] flex w-[min(18rem,85vw)] flex-col bg-[#F5EDD9] shadow-xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-journal-brown/15 px-4 py-3">
          <p className="font-carattere text-2xl italic text-[#3b2a1a]">Menu</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-[2px] text-2xl leading-none text-[#6b4a2a] transition hover:bg-[#ede2cb]"
          >
            ×
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4" onClick={onClose}>
          <NavLink className="mobile-nav-link nav-link" to="/">
            Babble
          </NavLink>
          <NavLink className="mobile-nav-link nav-link" to="/entries">
            Past Babbles
          </NavLink>
          <NavLink className="mobile-nav-link nav-link" to="/stats">
            Stats
          </NavLink>
          <NavLink className="mobile-nav-link nav-link" to="/tags">
            Tags
          </NavLink>
        </nav>
        {showJournalPanels ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <JournalSidebarPanels />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="shrink-0 border-t border-journal-brown/15 px-4 py-4">
          <SidebarAuth compact />
        </div>
      </aside>
    </>
  );
}

function MobileLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const showJournalPanels = location.pathname === "/";

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="mobile-shell flex min-h-[100dvh] min-w-0 flex-col bg-[#F5EDD9] text-journal-text">
      <header className="mobile-top-nav sticky top-0 z-50 flex shrink-0 items-center justify-between gap-3 overflow-visible border-b border-journal-brown/15 bg-[#F5EDD9] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h1 className="mobile-brand-title min-w-0 flex-1 pr-2 font-carattere italic leading-tight text-[#3b2a1a]">
          Michael&apos;s Babbles
        </h1>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          className="flex min-h-11 min-w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-[2px] border border-journal-brown/25 bg-[#f0e5cf]/80 px-2 transition hover:bg-[#ede2cb]"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="block h-0.5 w-5 rounded-full bg-[#3b2a1a]" />
          <span className="block h-0.5 w-5 rounded-full bg-[#3b2a1a]" />
          <span className="block h-0.5 w-5 rounded-full bg-[#3b2a1a]" />
        </button>
      </header>
      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} showJournalPanels={showJournalPanels} />
      <main className="mobile-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-journal-text">
        <Outlet />
      </main>
    </div>
  );
}

function DesktopBookLayout() {
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
          backgroundImage: `linear-gradient(rgba(123, 45, 45, 0.42), rgba(123, 45, 45, 0.42)), url(${maroonTexture})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div
          className="book-cover box-border w-full max-w-full min-w-0 overflow-hidden rounded-[2px] p-[12px]"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 42, 26, 0.38), rgba(59, 42, 26, 0.38)), url(${leatherTexture})`,
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
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopBookLayout /> : <MobileLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EntryPage mode="today" />} />
        <Route path="/entry/:entryId" element={<EntryPage mode="id" />} />
        <Route path="/entries" element={<EntriesPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/tags" element={<TagsPage />} />
      </Route>
    </Routes>
  );
}
