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

export default app;