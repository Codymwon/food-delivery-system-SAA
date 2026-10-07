const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Review = require('./models/Review');

const app = express();
const PORT = process.env.PORT || 5008;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/review_db';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Helper to generate Unique Review ID (e.g. REV-391824)
function generateReviewId() {
  return `REV-${Math.floor(100000 + Math.random() * 900000)}`;
}

// Router Definition
const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';

  return res.status(200).json({
    status: 'UP',
    service: 'review-service',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// 2. Submit a new review (POST /)
router.post('/', async (req, res) => {
  try {
    const { userId, orderId, restaurantId, rating, comment, tags } = req.body;

    if (!userId || !restaurantId || rating === undefined || !comment) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'userId, restaurantId, rating, and comment are required',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'rating must be an integer between 1 and 5',
      });
    }

    const finalOrderId = orderId || `ORD-MANUAL-${Date.now()}`;

    // Check if review already exists for this orderId
    if (orderId) {
      const existing = await Review.findOne({ orderId });
      if (existing) {
        return res.status(409).json({
          error: 'Conflict',
          message: `A review has already been submitted for Order ${orderId}`,
          review: existing,
        });
      }
    }

    let reviewId = generateReviewId();
    while (await Review.findOne({ reviewId })) {
      reviewId = generateReviewId();
    }

    const review = new Review({
      reviewId,
      userId,
      orderId: finalOrderId,
      restaurantId,
      rating: numRating,
      comment: comment.trim(),
      tags: Array.isArray(tags) ? tags : [],
    });

    await review.save();
    console.log(`[Review Service] Review ${review.reviewId} submitted for Restaurant ${restaurantId} by User ${userId}`);

    return res.status(201).json(review);
  } catch (err) {
    console.error('[Review Service] Create review error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 3. Get restaurant reviews with aggregated average rating (GET /restaurant/:restaurantId)
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await Review.find({ restaurantId }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return res.status(200).json({
      restaurantId,
      totalReviews,
      averageRating,
      reviews,
    });
  } catch (err) {
    console.error('[Review Service] Get restaurant reviews error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 4. Get customer reviews (GET /user/:userId)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (err) {
    console.error('[Review Service] Get user reviews error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// Mount router on both '/api/reviews' (gateway proxy path) and '/' (direct container path)
app.use('/api/reviews', router);
app.use('/', router);

// Auto-seed Demo Reviews
async function seedDemoReviews() {
  try {
    const count = await Review.countDocuments();
    if (count > 0) {
      console.log(`[Review Service] Review database already seeded (${count} reviews exist).`);
      return;
    }

    console.log('[Review Service] Seeding demo authentic reviews...');
    const demoReviews = [
      {
        reviewId: 'REV-100001',
        userId: '65f000000000000000000001',
        orderId: 'ORD-DEMO-001',
        restaurantId: 'rest-1',
        rating: 5,
        comment: 'Great farmhouse pizza delivered fast to Hostel Block D!',
        tags: ['Fast Delivery', 'Hot Food', 'Delicious'],
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        reviewId: 'REV-100002',
        userId: '65f000000000000000000002',
        orderId: 'ORD-DEMO-002',
        restaurantId: 'rest-2',
        rating: 4,
        comment: 'Juicy burgers and crispy fries. Very satisfying meal.',
        tags: ['Crispy', 'Good Value'],
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
      {
        reviewId: 'REV-100003',
        userId: '65f000000000000000000001',
        orderId: 'ORD-DEMO-003',
        restaurantId: 'rest-3',
        rating: 5,
        comment: 'Aromatic Hyderabadi dum biryani with generous chicken pieces! Authentic flavor.',
        tags: ['Authentic', 'Spicy', 'Delicious'],
        createdAt: new Date(Date.now() - 3600000 * 6),
      },
    ];

    await Review.insertMany(demoReviews);
    console.log(`[Review Service] Successfully pre-seeded ${demoReviews.length} authentic reviews.`);
  } catch (err) {
    console.error('[Review Service] Seeding error:', err.message);
  }
}

// MongoDB Startup and Server Listen
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Review Service] Connected to MongoDB at ${MONGO_URI}`);

    await seedDemoReviews();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Review Service] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Review Service] Startup error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
