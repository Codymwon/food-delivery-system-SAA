const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Payment = require('./models/Payment');
const rabbitmq = require('./rabbitmq');

const app = express();
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/payment_db';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Router Definition
const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  const rabbitmqStatus = rabbitmq.isConnected() ? 'CONNECTED' : 'DISCONNECTED';

  return res.status(200).json({
    status: 'UP',
    service: 'payment-service',
    database: dbStatus,
    rabbitmq: rabbitmqStatus,
    timestamp: new Date().toISOString(),
  });
});

// 2. Retrieve payment transaction by orderId (GET /transaction/:orderId)
router.get('/transaction/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No payment transaction found for order: ${orderId}`,
      });
    }

    return res.status(200).json(payment);
  } catch (err) {
    console.error('[Payment Service] Get transaction error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 3. Retrieve payment transaction by paymentId (GET /:paymentId)
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    let payment = await Payment.findOne({ paymentId });
    if (!payment && mongoose.Types.ObjectId.isValid(paymentId)) {
      payment = await Payment.findById(paymentId);
    }

    if (!payment) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Payment transaction not found for id: ${paymentId}`,
      });
    }

    return res.status(200).json(payment);
  } catch (err) {
    console.error('[Payment Service] Get payment by ID error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// Mount router on both '/api/payments' (gateway path) and '/' (direct service path)
app.use('/api/payments', router);
app.use('/', router);

// MongoDB and RabbitMQ Startup
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Payment Service] Connected to MongoDB at ${MONGO_URI}`);

    await rabbitmq.connect(RABBITMQ_URL);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Payment Service] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Payment Service] Startup error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
