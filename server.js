require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4000;

// =======================================================
// 🧠 ENVIRONMENT VALIDATION
// =======================================================
if (!process.env.DATABASE_URL || !process.env.SECRET_KEY) {
  console.error("❌ DATABASE_URL or SECRET_KEY missing.");
  process.exit(1);
}

// =======================================================
// ☁️ MONGODB CONNECTION (LAZY + CACHED)
// =======================================================
let cachedConnection = null;

async function connectDB() {
  if (cachedConnection) return cachedConnection;

  try {
    cachedConnection = await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected');
    return cachedConnection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// =======================================================
// 🛡️ GLOBAL MIDDLEWARE
// =======================================================
app.use(helmet());
app.use(compression()); 
app.use(cors({
  origin: [
    'https://lito-portfolio-cms.vercel.app',
    'https://lito-portfolio.vercel.app',
    'http://localhost:5173',
    'https://www.litoportfolio.space',
    'https://cms.litoportfolio.space'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// =======================================================
// ⚙️ RATE LIMITERS
// =======================================================
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

// =======================================================
// 🧩 ROUTES
// =======================================================
const messageRoutes = require('./routers/messageRoutes');
const skillRoutes = require('./routers/skillRoutes');
const projectRoutes = require('./routers/projectRoutes');
const employmentRoutes = require('./routers/employmentRoutes');
const userRoutes = require('./routers/userRoutes');
const jobRoutes = require('./routers/jobRoutes');
const newsletterRoute = require('./routers/newsletterRoute');

// 🔥 Ensure DB is connected BEFORE handling API calls
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({ message: "Database unavailable" });
  }
});

// =======================================================
// 🚏 ROUTE MOUNTING
// =======================================================
app.use('/api/auth', authLimiter, userRoutes);
app.use('/api', apiLimiter, userRoutes);
app.use('/api/skills', apiLimiter, skillRoutes);
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/employment', apiLimiter, employmentRoutes);
app.use('/api/jobs', apiLimiter, jobRoutes);
app.use('/api/newsletter', apiLimiter, newsletterRoute);

// =======================================================
// ❤️ HEALTH CHECK (NO DB WAIT)
// =======================================================
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// =======================================================
// 🚀 START SERVER (FAST BOOT)
// =======================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
