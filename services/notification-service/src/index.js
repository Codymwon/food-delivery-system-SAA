const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rabbitmq = require('./rabbitmq');

const app = express();
const PORT = process.env.PORT || 5007;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Router Definition
const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  const rabbitmqStatus = rabbitmq.isConnected() ? 'CONNECTED' : 'DISCONNECTED';

  return res.status(200).json({
    status: 'UP',
    service: 'notification-service',
    rabbitmq: rabbitmqStatus,
    timestamp: new Date().toISOString(),
  });
});

// 2. Retrieve chronological notifications for an order (GET /order/:orderId)
router.get('/order/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const notifications = rabbitmq.getNotificationsByOrder(orderId);
    return res.status(200).json(notifications);
  } catch (err) {
    console.error('[Notification Service] Get order notifications error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 3. Retrieve all notifications for customer (GET /user/:userId)
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = rabbitmq.getNotificationsByUser(userId);
    return res.status(200).json(notifications);
  } catch (err) {
    console.error('[Notification Service] Get user notifications error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 4. Retrieve all recent notifications (GET /)
router.get('/', (req, res) => {
  try {
    const notifications = rabbitmq.getAllNotifications();
    return res.status(200).json({
      service: 'notification-service',
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error('[Notification Service] Get all notifications error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// Mount router on both '/api/notifications' (gateway proxy path) and '/' (direct container path)
app.use('/api/notifications', router);
app.use('/', router);

// RabbitMQ Startup
async function startServer() {
  try {
    await rabbitmq.connect(RABBITMQ_URL);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Notification Service] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Notification Service] Startup error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
