import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { db } from "./firebaseAdmin.js";
import { requireAuth, optionalAuth } from "./middleware/authMiddleware.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Travel Planner API",
  });
});

/**
 * Helpers
 */
async function getTripOr404(tripId, res) {
  const ref = db.collection("trips").doc(tripId);
  const doc = await ref.get();
  if (!doc.exists) {
    res.status(404).json({ message: "trip not found" });
    return null;
  }
  return { ref, data: doc.data() };
}

function canReadTrip(trip, user) {
  // dacă e owner => OK
  if (user?.uid && trip.ownerId === user.uid) return true;
  // dacă e public => OK
  if (trip.isPublic === true) return true;
  return false;
}

function requireOwner(trip, user, res) {
  if (!user?.uid) {
    res.status(401).json({ message: "Missing auth token" });
    return false;
  }
  if (trip.ownerId !== user.uid) {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
}

/**
 * TRIPS
 */

// GET public (fără token => doar public), cu token => doar trips-urile userului
app.get("/api/trips", optionalAuth, async (req, res) => {
  try {
    let query = db.collection("trips");

    if (req.user?.uid) {
      query = query.where("ownerId", "==", req.user.uid);
    } else {
      query = query.where("isPublic", "==", true);
    }

    const snapshot = await query.get();

    const trips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(trips);
  } catch (err) {
    console.error("Firestore GET /api/trips error:", err);
    return res.status(500).json({ message: "Failed to fetch trips" });
  }
});

// WRITE protejat
app.post("/api/trips", requireAuth, async (req, res) => {
  try {
    const { country, date, budget } = req.body;

    if (!country || typeof country !== "string" || !country.trim()) {
      return res.status(400).json({ message: "country is required" });
    }

    const trip = {
      country: country.trim(),
      date: date ? String(date) : "",
      budget: Number(budget) || 0,
      ownerId: req.user.uid,
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("trips").add(trip);

    return res.status(201).json({ id: docRef.id, ...trip });
  } catch (err) {
    console.error("Firestore POST /api/trips error:", err);
    return res.status(500).json({ message: "Failed to create trip" });
  }
});

// WRITE protejat (doar owner)
app.put("/api/trips/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { country, date, budget } = req.body;

    if (!country || typeof country !== "string" || !country.trim()) {
      return res.status(400).json({ message: "country is required" });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date must be YYYY-MM-DD" });
    }

    const budgetNumber = Number(budget);
    if (Number.isNaN(budgetNumber) || budgetNumber < 0) {
      return res.status(400).json({ message: "budget must be a number >= 0" });
    }

    const tripDoc = await getTripOr404(id, res);
    if (!tripDoc) return;

    if (!requireOwner(tripDoc.data, req.user, res)) return;

    const updatedTrip = {
      country: country.trim(),
      date,
      budget: budgetNumber,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("trips").doc(id).set(updatedTrip, { merge: true });

    return res.status(200).json({
      id,
      ...tripDoc.data,
      ...updatedTrip,
    });
  } catch (err) {
    console.error("Firestore PUT /api/trips error:", err);
    return res.status(500).json({ message: "Failed to update trip" });
  }
});

// WRITE protejat (doar owner)
app.delete("/api/trips/:tripId", requireAuth, async (req, res) => {
  try {
    const { tripId } = req.params;

    const tripDoc = await getTripOr404(tripId, res);
    if (!tripDoc) return;

    if (!requireOwner(tripDoc.data, req.user, res)) return;

    const activitiesSnap = await tripDoc.ref.collection("activities").get();

    const batch = db.batch();
    activitiesSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await tripDoc.ref.delete();

    return res.status(204).send();
  } catch (err) {
    console.error("DELETE trip error:", err);
    return res.status(500).json({ message: "Failed to delete trip" });
  }
});

/**
 * ACTIVITIES
 */

// GET public (fără token => doar dacă trip e public), cu token => dacă e owner
app.get("/api/trips/:tripId/activities", optionalAuth, async (req, res) => {
  try {
    const { tripId } = req.params;

    const tripDoc = await getTripOr404(tripId, res);
    if (!tripDoc) return;

    if (!canReadTrip(tripDoc.data, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const snapshot = await tripDoc.ref
      .collection("activities")
      .orderBy("createdAt", "desc")
      .get();

    const activities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(activities);
  } catch (err) {
    console.error("Firestore GET activities error:", err);
    return res.status(500).json({ message: "Failed to fetch activities" });
  }
});

// WRITE protejat (doar owner)
app.post("/api/trips/:tripId/activities", requireAuth, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, place, price } = req.body;

    const tripDoc = await getTripOr404(tripId, res);
    if (!tripDoc) return;

    if (!requireOwner(tripDoc.data, req.user, res)) return;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name is required" });
    }
    if (!place || typeof place !== "string" || !place.trim()) {
      return res.status(400).json({ message: "place is required" });
    }

    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ message: "price must be a number >= 0" });
    }

    const activity = {
      name: name.trim(),
      place: place.trim(),
      price: priceNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await tripDoc.ref.collection("activities").add(activity);

    return res.status(201).json({ id: docRef.id, ...activity });
  } catch (err) {
    console.error("Firestore POST activities error:", err);
    return res.status(500).json({ message: "Failed to create activity" });
  }
});

// WRITE protejat (doar owner)
app.put(
  "/api/trips/:tripId/activities/:activityId",
  requireAuth,
  async (req, res) => {
    try {
      const { tripId, activityId } = req.params;
      const { name, place, price } = req.body;

      const tripDoc = await getTripOr404(tripId, res);
      if (!tripDoc) return;

      if (!requireOwner(tripDoc.data, req.user, res)) return;

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "name is required" });
      }
      if (!place || typeof place !== "string" || !place.trim()) {
        return res.status(400).json({ message: "place is required" });
      }
      if (price === undefined || price === null || Number.isNaN(Number(price))) {
        return res.status(400).json({ message: "price is required" });
      }
      if (Number(price) < 0) {
        return res.status(400).json({ message: "price must be >= 0" });
      }

      const ref = tripDoc.ref.collection("activities").doc(activityId);

      const doc = await ref.get();
      if (!doc.exists) {
        return res.status(404).json({ message: "activity not found" });
      }

      const updated = {
        name: name.trim(),
        place: place.trim(),
        price: Number(price),
        updatedAt: new Date().toISOString(),
      };

      await ref.update(updated);

      return res.status(200).json({ id: activityId, ...doc.data(), ...updated });
    } catch (err) {
      console.error("Firestore PUT /activities error:", err);
      return res.status(500).json({ message: "Failed to update activity" });
    }
  }
);

// WRITE protejat (doar owner)
app.delete(
  "/api/trips/:tripId/activities/:activityId",
  requireAuth,
  async (req, res) => {
    try {
      const { tripId, activityId } = req.params;

      const tripDoc = await getTripOr404(tripId, res);
      if (!tripDoc) return;

      if (!requireOwner(tripDoc.data, req.user, res)) return;

      const activityRef = tripDoc.ref.collection("activities").doc(activityId);

      const doc = await activityRef.get();
      if (!doc.exists) {
        return res.status(404).json({ message: "Activity not found" });
      }

      await activityRef.delete();

      return res.status(200).json({ message: "Activity deleted successfully" });
    } catch (err) {
      console.error("DELETE activity error:", err);
      return res.status(500).json({ message: "Failed to delete activity" });
    }
  }
);

export default app;
