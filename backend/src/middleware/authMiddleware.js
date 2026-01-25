import { auth } from "../firebaseAdmin.js";

// obligatoriu (pentru WRITE)
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded; // { uid, email, ... }
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// optional (pentru GET public, dar cu token => filtrăm pe user)
export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = header.split(" ")[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
  } catch {
    req.user = null;
  }

  return next();
}
