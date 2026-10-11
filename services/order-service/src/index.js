const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Order = require('./models/Order');
const rabbitmq = require('./rabbitmq');

const app = express();
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/order_db';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Instance Tracking Middleware
app.use((req, res, next) => {
  res.setHeader('X-Served-By', process.env.HOSTNAME || 'unknown');
  next();
});

// Helper to generate Unique Order ID (e.g. ORD-849201)
function generateOrderId() {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

// Router Definition
const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  const rabbitmqStatus = rabbitmq.isConnected() ? 'CONNECTED' : 'DISCONNECTED';

  return res.status(200).json({
    status: 'UP',
    service: 'order-service',
    database: dbStatus,
    rabbitmq: rabbitmqStatus,
    servedBy: process.env.HOSTNAME || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// 2. Submit new order (POST /)
router.post('/', async (req, res) => {
  try {
    const { userId, restaurantId, items, deliveryAddress } = req.body;

    if (!userId || !restaurantId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'userId and restaurantId are required',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'items must be a non-empty array',
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.zipCode) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'deliveryAddress with street, city, and zipCode is required',
      });
    }

    // Compute total amount
    const totalAmount = items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);

    // Generate unique order ID
    let orderId = generateOrderId();
    // Safety check for unique orderId
    while (await Order.findOne({ orderId })) {
      orderId = generateOrderId();
    }

    // Create order with status PENDING
    const order = new Order({
      orderId,
      userId,
      restaurantId,
      items,
      deliveryAddress,
      totalAmount,
      status: 'PENDING',
      paymentId: null,
    });

    await order.save();
    console.log(`[Order Service] Order created: ${orderId} in state PENDING`);

    // Emit order.created event to RabbitMQ
    try {
      rabbitmq.publishOrderCreated({
        orderId: order.orderId,
        userId: order.userId,
        restaurantId: order.restaurantId,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      });
    } catch (publishErr) {
      console.error(`[Order Service] Failed to publish order.created event for ${orderId}:`, publishErr.message);
    }

    // Return HTTP 201 Created immediately
    return res.status(201).json({
      orderId: order.orderId,
      status: order.status,
      totalAmount: order.totalAmount,
      userId: order.userId,
      restaurantId: order.restaurantId,
      items: order.items,
      deliveryAddress: order.deliveryAddress,
      paymentId: order.paymentId,
      createdAt: order.createdAt,
      servedBy: process.env.HOSTNAME || 'unknown',
    });
  } catch (err) {
    console.error('[Order Service] Create order error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 3. Get order history for a customer (GET /user/:userId)
// Placed before GET /:id so it does not conflict
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('[Order Service] Get user orders error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 4. Retrieve order status and details (GET /:id)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order = await Order.findOne({ orderId: id });
    if (!order && mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Order not found with id: ${id}`,
      });
    }

    const orderObj = order.toObject ? order.toObject() : order;
    return res.status(200).json({
      ...orderObj,
      servedBy: process.env.HOSTNAME || 'unknown',
    });
  } catch (err) {
    console.error('[Order Service] Get order error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// Mount router on both '/api/orders' (gateway path) and '/' (direct service path)
app.use('/api/orders', router);
app.use('/', router);

// MongoDB and RabbitMQ Startup
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Order Service] Connected to MongoDB at ${MONGO_URI}`);

    await rabbitmq.connect(RABBITMQ_URL);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Order Service] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Order Service] Startup error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
