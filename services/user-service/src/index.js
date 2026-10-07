const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const UserProfile = require('./models/UserProfile');

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/user_db';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Auto-seed demo user profile on startup
async function seedDemoProfile() {
  try {
    let demoUserId = '65f000000000000000000001';
    try {
      const authUser = await mongoose.connection.db
        .collection('userauths')
        .findOne({ email: 'customer@vit.ac.in' });
      if (authUser) {
        demoUserId = authUser._id.toString();
      }
    } catch (dbErr) {
      // If collection doesn't exist yet, continue with fallback ID
    }

    const existing = await UserProfile.findOne({ userId: demoUserId });
    if (!existing) {
      await UserProfile.create({
        userId: demoUserId,
        name: 'Aadith (Demo Customer)',
        phone: '+91 98765 43210',
        addresses: [
          {
            label: 'Hostel',
            street: 'Hostel Block D',
            city: 'VIT Vellore, Tamil Nadu',
            zipCode: '632014',
            isDefault: true,
          },
        ],
      });
      console.log(`[User Service] Seeded demo profile for userId: ${demoUserId}`);
    } else {
      console.log(`[User Service] Demo profile already exists for userId: ${demoUserId}`);
    }
  } catch (err) {
    console.error('[User Service] Error seeding demo profile:', err.message);
  }
}

// Router Definition
const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  res.status(200).json({
    status: 'UP',
    service: 'user-service',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// 2. Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        error: 'Not Found',
        message: `User profile not found for userId: ${userId}`,
      });
    }

    return res.status(200).json({
      userId: profile.userId,
      name: profile.name,
      phone: profile.phone,
      addresses: profile.addresses,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (err) {
    console.error('[User Service] Get profile error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 3. Update user profile (name, phone)
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      userId: profile.userId,
      name: profile.name,
      phone: profile.phone,
      addresses: profile.addresses,
      updatedAt: profile.updatedAt,
    });
  } catch (err) {
    console.error('[User Service] Update profile error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 4. Add delivery address
router.post('/profile/:userId/addresses', async (req, res) => {
  try {
    const { userId } = req.params;
    const { label, street, city, zipCode, isDefault } = req.body;

    if (!street || !city || !zipCode) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'street, city, and zipCode are required fields',
      });
    }

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({
        userId,
        name: 'Customer',
        phone: '',
        addresses: [],
      });
    }

    // If marked as default, unset other default addresses
    if (isDefault) {
      profile.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      label: label || 'Home',
      street,
      city,
      zipCode,
      isDefault: isDefault || profile.addresses.length === 0,
    };

    profile.addresses.push(newAddress);
    await profile.save();

    return res.status(201).json({
      message: 'Address added successfully',
      addresses: profile.addresses,
    });
  } catch (err) {
    console.error('[User Service] Add address error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 5. Get saved addresses
router.get('/profile/:userId/addresses', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        error: 'Not Found',
        message: `User profile not found for userId: ${userId}`,
      });
    }

    return res.status(200).json({
      userId: profile.userId,
      addresses: profile.addresses || [],
    });
  } catch (err) {
    console.error('[User Service] Get addresses error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// Mount router on both '/api/users' (gateway path) and '/' (direct service path)
app.use('/api/users', router);
app.use('/', router);

// MongoDB Connection & Server Start
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[User Service] Connected to MongoDB at ${MONGO_URI}`);
    await seedDemoProfile();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[User Service] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[User Service] Database connection error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
