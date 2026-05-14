import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";

export function apiClerkMiddleware() {
  if (!process.env.CLERK_SECRET_KEY?.trim()) {
    return (_req, _res, next) => next();
  }
  return clerkMiddleware();
}

export async function requireOwner(req, res, next) {
  if (!process.env.CLERK_SECRET_KEY?.trim() || !process.env.OWNER_EMAIL?.trim()) {
    return res.status(503).json({
      error: "Write operations require CLERK_SECRET_KEY and OWNER_EMAIL on the server."
    });
  }

  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated || !userId) {
    return res.status(401).json({ error: "Sign in required to modify content." });
  }

  const ownerEmail = process.env.OWNER_EMAIL.trim().toLowerCase();

  try {
    const user = await clerkClient.users.getUser(userId);
    const primary = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
    if (!primary || primary !== ownerEmail) {
      return res.status(403).json({ error: "Only the site owner can modify content." });
    }
    return next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[auth] Failed to verify Clerk user:", error);
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}
