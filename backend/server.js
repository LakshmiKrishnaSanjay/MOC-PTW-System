// server.js
import express from 'express';
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import dbConnect from './utils/dbConnect.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import hseRoutes from './routes/hse.js';
import requestRoutes from "./routes/requests.js";
import mocRoutes from "./routes/moc.js";


const app = express();

// Better CORS for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Connect to MongoDB
dbConnect()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/contractors', hseRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/moc", mocRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// server.js — put these as early as possible, right after dotenv loading
   // ← or whatever dotenv method you're using

