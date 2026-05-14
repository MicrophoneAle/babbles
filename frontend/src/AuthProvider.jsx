import { createContext, useContext, useEffect, useMemo } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { clearApiTokenGetter, setApiTokenGetter } from "./api";

const OwnerContext = createContext({ isOwner: false, isLoaded: true });

function normalizeEmail(value) {
  return (value || "").trim().toLowerCase();
}

function ClerkOwnerBridge({ children }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const ownerEmail = normalizeEmail(import.meta.env.VITE_OWNER_EMAIL);
  const userEmail = normalizeEmail(user?.primaryEmailAddress?.emailAddress);
  const isOwner = Boolean(ownerEmail && user && userEmail === ownerEmail);

  useEffect(() => {
    if (!authLoaded) return undefined;
    setApiTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
    return () => {
      clearApiTokenGetter();
    };
  }, [getToken, authLoaded]);

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
