import { createContext, useContext, useEffect, useMemo } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { clearApiTokenGetter, setApiTokenGetter } from "./api";

const OwnerContext = createContext({ isOwner: false, isLoaded: true });

function parseOwnerEmailSet(value) {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[,;]/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

function collectUserEmails(user) {
  if (!user) return new Set();
  const out = new Set();
  for (const e of user.emailAddresses ?? []) {
    const addr = e.emailAddress?.trim().toLowerCase();
    if (addr) out.add(addr);
  }
  const primary = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (primary) out.add(primary);
  return out;
}

function ClerkOwnerBridge({ children }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded, userId, isSignedIn } = useAuth();
  const ownerEmails = useMemo(() => parseOwnerEmailSet(import.meta.env.VITE_OWNER_EMAIL), []);
  const ownerUserId = (import.meta.env.VITE_OWNER_USER_ID || "").trim();

  const userEmails = useMemo(() => collectUserEmails(user), [user]);
  const isOwner = useMemo(() => {
    if (ownerUserId && userId && userId === ownerUserId) return true;
    if (!ownerEmails.size) return false;
    if (!user) return false;
    return [...userEmails].some((email) => ownerEmails.has(email));
  }, [ownerEmails, ownerUserId, user, userEmails, userId]);

  useEffect(() => {
    if (!authLoaded) return undefined;

    setApiTokenGetter(async () => {
      try {
        if (!isSignedIn || !userId) return null;
        const token = await getToken();
        return token ?? null;
      } catch {
        return null;
      }
    });

    return () => {
      clearApiTokenGetter();
    };
  }, [getToken, authLoaded, userId, isSignedIn]);

  const value = useMemo(
    () => ({
      isOwner,
      isLoaded: userLoaded && authLoaded
    }),
    [isOwner, userLoaded, authLoaded]
  );

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function AuthProvider({ children }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  if (!publishableKey) {
    return <OwnerContext.Provider value={{ isOwner: false, isLoaded: true }}>{children}</OwnerContext.Provider>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkOwnerBridge>{children}</ClerkOwnerBridge>
    </ClerkProvider>
  );
}

export function useOwner() {
  return useContext(OwnerContext);
}
