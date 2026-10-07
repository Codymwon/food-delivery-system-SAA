const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');
const UserAuth = require('./models/UserAuth');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/user_db';
const JWT_SECRET = process.env.JWT_SECRET || 'vit_swe4007_secret_key_2026';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Auto-seed demo user on startup
async function seedDemoUser() {
  try {
    const demoEmail = 'customer@vit.ac.in';
    const existing = await UserAuth.findOne({ email: demoEmail });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password123', salt);
      const demoUser = await UserAuth.create({
        _id: new mongoose.Types.ObjectId('65f000000000000000000001'),
        email: demoEmail,
        passwordHash: hash,
        role: 'customer',
      });
      console.log(`[Auth Service] Seeded demo user: ${demoEmail} (ID: ${demoUser._id})`);
    } else {
      console.log(`[Auth Service] Demo user already exists: ${demoEmail} (ID: ${existing._id})`);
    }
  } catch (err) {
    console.error('[Auth Service] Error seeding demo user:', err.message);
  }
}

// Router Definition
const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  res.status(200).json({
    status: 'UP',
    service: 'auth-service',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// 2. User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserAuth.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserAuth.create({
      email: normalizedEmail,
      passwordHash,
      role: role || 'customer',
    });

    return res.status(201).json({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    console.error('[Auth Service] Registration error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 3. User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserAuth.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      token,
      user: {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[Auth Service] Login error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 4. Token verification
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      valid: false,
      error: 'Unauthorized',
      message: 'Authorization header with Bearer token is required',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({
      valid: true,
      user: decoded,
    });
  } catch (err) {
    return res.status(401).json({
      valid: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
});

// Mount router on both '/api/auth' (gateway path) and '/' (direct service path)
app.use('/api/auth', router);
app.use('/', router);

// MongoDB Connection & Server Start
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Auth Service] Connected to MongoDB at ${MONGO_URI}`);
    await seedDemoUser();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Auth Service] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Auth Service] Database connection error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
