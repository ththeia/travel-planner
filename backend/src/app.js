import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { db } from "./firebaseAdmin.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

function validateCalendarDateYYYYMMDD(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "date must be YYYY-MM-DD";

  const [yStr, mStr, dStr] = dateStr.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return "invalid date values";
  }

  const currentYear = new Date().getFullYear();
  if (year < currentYear) return `year must be >= ${currentYear}`;

  if (month < 1 || month > 12) return "month must be between 01 and 12";

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return "invalid day for month";

  return null;
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "Travel Planner API" });
});

// -------------------- TRIPS --------------------

// GET public (returnează toate trips; frontend filtrează pe createdBy)
app.get("/api/trips", async (req, res) => {
  try {
    const snapshot = await db.collection("trips").get();
    const trips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(trips);
  } catch (err) {
    console.error("Firestore GET /api/trips error:", err);
    return res.status(500).json({ message: "Failed to fetch trips" });
  }
});

// POST protejat (setează createdBy)
app.post("/api/trips", requireAuth, async (req, res) => {
  try {
    const { country, date, budget } = req.body;

    if (!country || typeof country !== "string" || !country.trim()) {
      return res.status(400).json({ message: "country is required" });
    }

    const dateStr = String(date || "").trim();
    const dateErr = validateCalendarDateYYYYMMDD(dateStr);
    if (dateErr) {
      return res.status(400).json({ message: dateErr });
    }

    const budgetNumber = Number(budget);
    if (!Number.isFinite(budgetNumber) || budgetNumber < 0) {
      return res.status(400).json({ message: "budget must be a number >= 0" });
    }

    const trip = {
      country: country.trim(),
      date: dateStr,
      budget: budgetNumber,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
    };

    const docRef = await db.collection("trips").add(trip);
    return res.status(201).json({ id: docRef.id, ...trip });
  } catch (err) {
    console.error("Firestore POST /api/trips error:", err);
    return res.status(500).json({ message: "Failed to create trip" });
  }
});

// PUT protejat + ownership
app.put("/api/trips/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { country, date, budget } = req.body;

    if (!country || typeof country !== "string" || !country.trim()) {
      return res.status(400).json({ message: "country is required" });
    }

    const dateStr = String(date || "").trim();
    const dateErr = validateCalendarDateYYYYMMDD(dateStr);
    if (dateErr) {
      return res.status(400).json({ message: dateErr });
    }

    const budgetNumber = Number(budget);
    if (Number.isNaN(budgetNumber) || budgetNumber < 0) {
      return res.status(400).json({ message: "budget must be a number >= 0" });
    }

    const tripRef = db.collection("trips").doc(id);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      return res.status(404).json({ message: "trip not found" });
    }

    const tripData = tripDoc.data();
    if (tripData?.createdBy && tripData.createdBy !== req.user.uid) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedTrip = {
      country: country.trim(),
      date: dateStr,
      budget: budgetNumber,
      updatedAt: new Date().toISOString(),
    };

    await tripRef.set(updatedTrip, { merge: true });

    const merged = { ...tripData, ...updatedTrip };
    return res.status(200).json({ id, ...merged });
  } catch (err) {
    console.error("Firestore PUT /api/trips error:", err);
    return res.status(500).json({ message: "Failed to update trip" });
  }
});

// DELETE protejat + ownership
app.delete("/api/trips/:tripId", requireAuth, async (req, res) => {
  try {
    const { tripId } = req.params;

    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      return res.status(404).json({ message: "trip not found" });
    }

    const tripData = tripDoc.data();
    if (tripData?.createdBy && tripData.createdBy !== req.user.uid) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // șterge subcolecția activities
    const activitiesSnap = await tripRef.collection("activities").get();
    const batch = db.batch();
    activitiesSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await tripRef.delete();
    return res.status(204).send();
  } catch (err) {
    console.error("DELETE trip error:", err);
    return res.status(500).json({ message: "Failed to delete trip" });
  }
});

// -------------------- ACTIVITIES --------------------

// GET public
app.get("/api/trips/:tripId/activities", async (req, res) => {
  try {
    const { tripId } = req.params;

    const snapshot = await db
      .collection("trips")
      .doc(tripId)
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

// POST protejat + ownership pe trip
app.post("/api/trips/:tripId/activities", requireAuth, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, place, price } = req.body;

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

    // ownership: trebuie să fii owner-ul tripului
    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();
    if (!tripDoc.exists) return res.status(404).json({ message: "trip not found" });

    const tripData = tripDoc.data();
    if (tripData?.createdBy && tripData.createdBy !== req.user.uid) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const activity = {
      name: name.trim(),
      place: place.trim(),
      price: priceNumber,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
    };

    const docRef = await tripRef.collection("activities").add(activity);
    return res.status(201).json({ id: docRef.id, ...activity });
  } catch (err) {
    console.error("Firestore POST activities error:", err);
    return res.status(500).json({ message: "Failed to create activity" });
  }
});

// PUT protejat + ownership
app.put("/api/trips/:tripId/activities/:activityId", requireAuth, async (req, res) => {
  try {
    const { tripId, activityId } = req.params;
    const { name, place, price } = req.body;

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

    // ownership: trebuie să fii owner-ul tripului
    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();
    if (!tripDoc.exists) return res.status(404).json({ message: "trip not found" });

    const tripData = tripDoc.data();
    if (tripData?.createdBy && tripData.createdBy !== req.user.uid) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const ref = tripRef.collection("activities").doc(activityId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: "activity not found" });

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
});

// DELETE protejat + ownership
app.delete("/api/trips/:tripId/activities/:activityId", requireAuth, async (req, res) => {
  try {
    const { tripId, activityId } = req.params;

    // ownership: trebuie să fii owner-ul tripului
    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();
    if (!tripDoc.exists) return res.status(404).json({ message: "trip not found" });

    const tripData = tripDoc.data();
    if (tripData?.createdBy && tripData.createdBy !== req.user.uid) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const activityRef = tripRef.collection("activities").doc(activityId);
    const doc = await activityRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Activity not found" });

    await activityRef.delete();
    return res.status(200).json({ message: "Activity deleted successfully" });
  } catch (err) {
    console.error("DELETE activity error:", err);
    return res.status(500).json({ message: "Failed to delete activity" });
  }
});

export default app;
