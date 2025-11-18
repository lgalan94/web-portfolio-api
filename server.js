require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 4000;

// =======================================================
// 🧠 ENVIRONMENT VALIDATION
// =======================================================
if (!process.env.DATABASE_URL || !process.env.SECRET_KEY) {
  console.error("❌ FATAL ERROR: DATABASE_URL or SECRET_KEY missing in .env. Shutting down.");
  process.exit(1);
}

// =======================================================
// ☁️ DATABASE CONNECTION
// =======================================================
mongoose.connect(process.env.DATABASE_URL, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
const DB = mongoose.connection;
DB.on('error', (err) => console.error('❌ Database connection error:', err));
DB.once('open', () => console.log('✅ Connected to MongoDB Cloud Database'));


// =======================================================
// 🛡️ GLOBAL MIDDLEWARE
// =======================================================
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    'https://lito-portfolio-cms.vercel.app',
    'https://lito-portfolio.vercel.app',
    'http://localhost:5173',
    'https://www.litoportfolio.space',
    'https://cms.litoportfolio.space'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // if you are sending cookies/auth headers
}));
app.use(express.json({ limit: '10kb' })); // JSON body parser with size limit

// =======================================================
// ⚙️ RATE LIMITERS
// =======================================================
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit 10 auth attempts/hour/IP
  message: 'Too many login/register attempts. Please try again in an hour.',
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 200 requests per 15 min/IP
  message: 'Too many requests from this IP. Please slow down.',
});

// =======================================================
// 🧩 ROUTE IMPORTS
// =======================================================
const messageRoutes = require('./routers/messageRoutes');
const skillRoutes = require('./routers/skillRoutes');
const projectRoutes = require('./routers/projectRoutes');
const employmentRoutes = require('./routers/employmentRoutes');
// 🟢 Combined route: handles auth, profile & public portfolio
const userRoutes = require('./routers/userRoutes');
const jobRoutes = require('./routers/jobRoutes');
const newsletterRoute = require('./routers/newsletterRoute');

// =======================================================
// 🚏 ROUTE MOUNTING
// =======================================================

// Auth routes (register, login) – rate limited
app.use('/api/auth', authLimiter, userRoutes);

// User & profile routes (protected & public profile)
app.use('/api', apiLimiter, userRoutes);

// Other CMS routes
app.use('/api/skills', apiLimiter, skillRoutes);
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/employment', apiLimiter, employmentRoutes);
app.use('/api/jobs', apiLimiter, jobRoutes);
app.use('/api/newsletter', apiLimiter, newsletterRoute);
// =======================================================
// 🚀 START SERVER
// =======================================================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});


