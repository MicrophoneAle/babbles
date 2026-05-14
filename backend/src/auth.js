import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";

/**
 * Clerk Express must run before body parsers so the session JWT can be read reliably.
 * See: https://clerk.com/docs/reference/express/clerk-middleware
 */
export function apiClerkMiddleware() {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) {
    return (_req, _res, next) => next();
  }

  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY?.trim();
  const options = { secretKey };
  if (publishableKey) {
    options.publishableKey = publishableKey;
  }

  return clerkMiddleware(options);
}

function parseOwnerEmailSet() {
  const raw = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[,;]/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

function collectUserEmails(user) {
  const out = new Set();
  for (const e of user.emailAddresses ?? []) {
    const addr = e.emailAddress?.trim().toLowerCase();
    if (addr) out.add(addr);
  }
  const primary = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (primary) out.add(primary);
  return out;
}

export async function requireOwner(req, res, next) {
  if (!process.env.CLERK_SECRET_KEY?.trim()) {
    return res.status(503).json({
      error: "Write operations require CLERK_SECRET_KEY on the server."
    });
  }

  const ownerEmails = parseOwnerEmailSet();
  const ownerUserId = process.env.OWNER_USER_ID?.trim();
  const hasEmailRule = ownerEmails.size > 0;
  const hasUserIdRule = Boolean(ownerUserId);

  if (!hasEmailRule && !hasUserIdRule) {
    return res.status(503).json({
      error:
        "Write operations require OWNER_EMAIL (or OWNER_USER_ID from the Clerk dashboard) on the server."
    });
  }

  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated || !userId) {
    return res.status(401).json({ error: "Sign in required to modify content." });
  }

  if (hasUserIdRule && userId === ownerUserId) {
    return next();
  }

  if (!hasEmailRule) {
    return res.status(403).json({ error: "Only the site owner can modify content." });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const userEmails = collectUserEmails(user);
    const matchesOwner = [...userEmails].some((email) => ownerEmails.has(email));
    if (!matchesOwner) {
      return res.status(403).json({ error: "Only the site owner can modify content." });
    }
    return next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[auth] Failed to verify Clerk user:", error);
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}
