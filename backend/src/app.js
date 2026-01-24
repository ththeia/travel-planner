import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { db } from "./firebaseAdmin.js";


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Travel Planner API'
  });
});

app.get('/api/trips', async (req, res) => {
  try {
    const snapshot = await db.collection('trips').get();

    const trips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(trips);
  } catch (err) {
    console.error('Firestore GET /api/trips error:', err);
    return res.status(500).json({ message: 'Failed to fetch trips' });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const { country, date, budget } = req.body;

    // Validare minimală
    if (!country || typeof country !== 'string') {
      return res.status(400).json({ message: 'country is required' });
    }

    const trip = {
      country: country.trim(),
      date: date ? String(date) : '',
      budget: Number(budget) || 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('trips').add(trip);

    return res.status(201).json({ id: docRef.id, ...trip });
  } catch (err) {
    console.error('Firestore POST /api/trips error:', err);
    return res.status(500).json({ message: 'Failed to create trip' });
  }
});

app.get('/api/trips/:tripId/activities', async (req, res) => {
  try {
    const { tripId } = req.params;

    const snapshot = await db
      .collection('trips')
      .doc(tripId)
      .collection('activities')
      .orderBy('createdAt', 'desc')
      .get();

    const activities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(activities);
  } catch (err) {
    console.error('Firestore GET activities error:', err);
    return res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

app.post('/api/trips/:tripId/activities', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, place, price } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }
    if (!place || typeof place !== 'string' || !place.trim()) {
      return res.status(400).json({ message: 'place is required' });
    }

    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ message: 'price must be a number >= 0' });
    }

    const activity = {
      name: name.trim(),
      place: place.trim(),
      price: priceNumber,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db
      .collection('trips')
      .doc(tripId)
      .collection('activities')
      .add(activity);

    return res.status(201).json({ id: docRef.id, ...activity });
  } catch (err) {
    console.error('Firestore POST activities error:', err);
    return res.status(500).json({ message: 'Failed to create activity' });
  }
});

app.put("/api/trips/:tripId/activities/:activityId", async (req, res) => {
  try {
    const { tripId, activityId } = req.params;
    const { name, place, price } = req.body;

    // Validări
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

    const ref = db
      .collection("trips")
      .doc(tripId)
      .collection("activities")
      .doc(activityId);

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
});

app.delete("/api/trips/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      return res.status(404).json({ message: "trip not found" });
    }

    // ia toate activities
    const activitiesSnap = await tripRef.collection("activities").get();

    //  șterge activities
    const batch = db.batch();
    activitiesSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    //  șterge trip-ul
    await tripRef.delete();

    return res.status(204).send();
  } catch (err) {
    console.error("DELETE trip error:", err);
    return res.status(500).json({ message: "Failed to delete trip" });
  }
});

app.delete('/api/trips/:tripId/activities/:activityId', async (req, res) => {
  try {
    const { tripId, activityId } = req.params;

    const activityRef = db
      .collection('trips')
      .doc(tripId)
      .collection('activities')
      .doc(activityId);

    const doc = await activityRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await activityRef.delete();

    return res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('DELETE activity error:', err);
    return res.status(500).json({ message: 'Failed to delete activity' });
  }
});


export default app;