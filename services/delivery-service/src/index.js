const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const Delivery = require('./models/Delivery');
const rabbitmq = require('./rabbitmq');

const app = express();
const PORT = process.env.PORT || 5006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/delivery_db';
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
    service: 'delivery-service',
    database: dbStatus,
    rabbitmq: rabbitmqStatus,
    timestamp: new Date().toISOString(),
  });
});

// 2. Track delivery by Order ID (GET /track/:orderId)
router.get('/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const delivery = await Delivery.findOne({ orderId });

    if (!delivery) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Delivery tracking not found for Order: ${orderId}`,
      });
    }

    return res.status(200).json(delivery);
  } catch (err) {
    console.error('[Delivery Service] Track delivery error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 3. Manual status override (PATCH /status/:orderId) - for viva demonstration
router.patch('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, currentLocation, etaMinutes, partnerName, partnerPhone } = req.body;

    const validStatuses = ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (currentLocation !== undefined) {
      updateFields.currentLocation = typeof currentLocation === 'string'
        ? { text: currentLocation }
        : currentLocation;
    }
    if (etaMinutes !== undefined) updateFields.etaMinutes = Number(etaMinutes);
    if (partnerName) updateFields.partnerName = partnerName;
    if (partnerPhone) updateFields.partnerPhone = partnerPhone;

    const delivery = await Delivery.findOneAndUpdate(
      { orderId },
      { $set: updateFields },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Delivery record not found for Order: ${orderId}`,
      });
    }

    console.log(`[Delivery Service] Order ${orderId} manual status updated to ${delivery.status}`);

    rabbitmq.publishEvent('delivery.status_updated', {
      deliveryId: delivery.deliveryId,
      orderId: delivery.orderId,
      userId: delivery.userId,
      status: delivery.status,
      etaMinutes: delivery.etaMinutes,
      currentLocation: delivery.currentLocation,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json(delivery);
  } catch (err) {
    console.error('[Delivery Service] Update delivery status error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// Mount router on both '/api/delivery' (gateway proxy path) and '/' (direct container path)
app.use('/api/delivery', router);
app.use('/', router);

// MongoDB and RabbitMQ Startup
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Delivery Service] Connected to MongoDB at ${MONGO_URI}`);

    await rabbitmq.connect(RABBITMQ_URL);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Delivery Service] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Delivery Service] Startup error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
