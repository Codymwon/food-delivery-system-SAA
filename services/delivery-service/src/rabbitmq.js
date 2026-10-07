const amqp = require('amqplib');
const Delivery = require('./models/Delivery');

const EXCHANGE_NAME = 'food_delivery_events';
const QUEUE_NAME = 'delivery_payment_completed_queue';
const ROUTING_KEY_PAYMENT_COMPLETED = 'payment.completed';
const ROUTING_KEY_DELIVERY_ASSIGNED = 'delivery.assigned';

let connection = null;
let channel = null;
let isConnecting = false;

// Helper to generate Unique Delivery ID (e.g. DEL-619283)
function generateDeliveryId() {
  return `DEL-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function connect(url) {
  if (channel) return;
  if (isConnecting) return;
  isConnecting = true;

  const rabbitUrl = url || process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  while (!channel) {
    try {
      console.log(`[Delivery Service] Connecting to RabbitMQ at ${rabbitUrl}...`);
      connection = await amqp.connect(rabbitUrl);

      connection.on('error', (err) => {
        console.error('[Delivery Service] RabbitMQ connection error:', err.message);
      });

      connection.on('close', () => {
        console.warn('[Delivery Service] RabbitMQ connection closed. Reconnecting in 3s...');
        channel = null;
        connection = null;
        setTimeout(() => connect(rabbitUrl), 3000);
      });

      channel = await connection.createChannel();

      channel.on('error', (err) => {
        console.error('[Delivery Service] RabbitMQ channel error:', err.message);
      });

      channel.on('close', () => {
        console.warn('[Delivery Service] RabbitMQ channel closed.');
        channel = null;
      });

      // Assert topic exchange
      await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

      // Assert queue and bind to payment.completed events
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY_PAYMENT_COMPLETED);

      // Subscribe to payment.completed events
      await channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          console.log('[Delivery Service] Received payment.completed event:', content);

          const { orderId, userId, status } = content;

          if (orderId && status === 'SUCCESS') {
            // Idempotency check: see if delivery already assigned for this orderId
            let delivery = await Delivery.findOne({ orderId });

            if (!delivery) {
              let deliveryId = generateDeliveryId();
              while (await Delivery.findOne({ deliveryId })) {
                deliveryId = generateDeliveryId();
              }

              delivery = new Delivery({
                deliveryId,
                orderId,
                userId: userId || 'customer-anonymous',
                partnerName: 'Ramesh Kumar',
                partnerPhone: '+91 98765 43210',
                status: 'ASSIGNED',
                etaMinutes: 25,
                currentLocation: { text: 'Assigned partner Ramesh Kumar heading to restaurant' },
              });

              await delivery.save();
              console.log(`[Delivery Service] Driver Ramesh Kumar assigned to Order ${orderId} (Delivery: ${delivery.deliveryId})`);

              // Publish delivery.assigned event
              const deliveryAssignedEvent = {
                deliveryId: delivery.deliveryId,
                orderId: delivery.orderId,
                userId: delivery.userId,
                partnerName: delivery.partnerName,
                partnerPhone: delivery.partnerPhone,
                status: delivery.status,
                etaMinutes: delivery.etaMinutes,
                currentLocation: delivery.currentLocation,
                timestamp: new Date().toISOString(),
              };

              publishEvent(ROUTING_KEY_DELIVERY_ASSIGNED, deliveryAssignedEvent);

              // Schedule automatic status progression
              // Step 1: Status -> OUT_FOR_DELIVERY after 15 seconds
              setTimeout(async () => {
                try {
                  const currentDelivery = await Delivery.findOne({ orderId });
                  if (currentDelivery && currentDelivery.status === 'ASSIGNED') {
                    currentDelivery.status = 'OUT_FOR_DELIVERY';
                    currentDelivery.etaMinutes = 10;
                    currentDelivery.currentLocation = { text: 'En route to Hostel Block D, VIT Vellore' };
                    await currentDelivery.save();
                    console.log(`[Delivery Service] Auto-progression: Order ${orderId} status updated to OUT_FOR_DELIVERY`);

                    publishEvent('delivery.status_updated', {
                      deliveryId: currentDelivery.deliveryId,
                      orderId: currentDelivery.orderId,
                      userId: currentDelivery.userId,
                      status: currentDelivery.status,
                      etaMinutes: currentDelivery.etaMinutes,
                      currentLocation: currentDelivery.currentLocation,
                      timestamp: new Date().toISOString(),
                    });
                  }
                } catch (progErr) {
                  console.error(`[Delivery Service] Error in auto-progression to OUT_FOR_DELIVERY for ${orderId}:`, progErr.message);
                }
              }, 15000);

              // Step 2: Status -> DELIVERED after 40 seconds
              setTimeout(async () => {
                try {
                  const currentDelivery = await Delivery.findOne({ orderId });
                  if (currentDelivery && ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(currentDelivery.status)) {
                    currentDelivery.status = 'DELIVERED';
                    currentDelivery.etaMinutes = 0;
                    currentDelivery.currentLocation = { text: 'Delivered at Hostel Block D, VIT Vellore' };
                    await currentDelivery.save();
                    console.log(`[Delivery Service] Auto-progression: Order ${orderId} status updated to DELIVERED`);

                    publishEvent('delivery.status_updated', {
                      deliveryId: currentDelivery.deliveryId,
                      orderId: currentDelivery.orderId,
                      userId: currentDelivery.userId,
                      status: currentDelivery.status,
                      etaMinutes: currentDelivery.etaMinutes,
                      currentLocation: currentDelivery.currentLocation,
                      timestamp: new Date().toISOString(),
                    });
                  }
                } catch (progErr) {
                  console.error(`[Delivery Service] Error in auto-progression to DELIVERED for ${orderId}:`, progErr.message);
                }
              }, 40000);
            } else {
              console.log(`[Delivery Service] Delivery already exists for Order ${orderId}: ${delivery.deliveryId}`);
            }
          }

          channel.ack(msg);
        } catch (consumeErr) {
          console.error('[Delivery Service] Error handling payment.completed event:', consumeErr.message);
          channel.ack(msg);
        }
      });

      console.log(`[Delivery Service] RabbitMQ connected. Topic exchange '${EXCHANGE_NAME}' ready and consumer listening on '${QUEUE_NAME}'.`);
      isConnecting = false;
      return;
    } catch (err) {
      console.error(`[Delivery Service] RabbitMQ connection failed: ${err.message}. Retrying in 3s...`);
      channel = null;
      connection = null;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  isConnecting = false;
}

function publishEvent(routingKey, data) {
  if (!channel) {
    console.warn(`[Delivery Service] Cannot publish '${routingKey}': Channel not ready.`);
    return false;
  }

  const payload = Buffer.from(JSON.stringify(data));
  const published = channel.publish(EXCHANGE_NAME, routingKey, payload, {
    persistent: true,
    contentType: 'application/json',
  });

  console.log(`[Delivery Service] Emitted event '${routingKey}' for Order ${data.orderId}`);
  return published;
}

function isConnected() {
  return connection !== null && channel !== null;
}

module.exports = {
  connect,
  publishEvent,
  isConnected,
};
