const amqp = require('amqplib');
const Order = require('./models/Order');

const EXCHANGE_NAME = 'food_delivery_events';
const QUEUE_NAME = 'order_payment_completed_queue';
const ROUTING_KEY_PAYMENT_COMPLETED = 'payment.completed';
const ROUTING_KEY_ORDER_CREATED = 'order.created';

let connection = null;
let channel = null;
let isConnecting = false;

async function connect(url) {
  if (channel) return;
  if (isConnecting) return;
  isConnecting = true;

  const rabbitUrl = url || process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  while (!channel) {
    try {
      console.log(`[Order Service] Connecting to RabbitMQ at ${rabbitUrl}...`);
      connection = await amqp.connect(rabbitUrl);

      connection.on('error', (err) => {
        console.error('[Order Service] RabbitMQ connection error:', err.message);
      });

      connection.on('close', () => {
        console.warn('[Order Service] RabbitMQ connection closed. Reconnecting in 3s...');
        channel = null;
        connection = null;
        setTimeout(() => connect(rabbitUrl), 3000);
      });

      channel = await connection.createChannel();

      channel.on('error', (err) => {
        console.error('[Order Service] RabbitMQ channel error:', err.message);
      });

      channel.on('close', () => {
        console.warn('[Order Service] RabbitMQ channel closed.');
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
          console.log('[Order Service] Received payment.completed event:', content);

          const { orderId, paymentId, status } = content;

          if (orderId && status === 'SUCCESS') {
            const updated = await Order.findOneAndUpdate(
              { orderId },
              {
                status: 'CONFIRMED',
                paymentId: paymentId,
              },
              { new: true }
            );

            if (updated) {
              console.log(`[Order Service] Order ${orderId} successfully updated to CONFIRMED with paymentId ${paymentId}`);
            } else {
              console.warn(`[Order Service] Order ${orderId} not found for payment confirmation`);
            }
          } else if (orderId && status === 'FAILED') {
            await Order.findOneAndUpdate(
              { orderId },
              { status: 'CANCELLED' },
              { new: true }
            );
            console.log(`[Order Service] Order ${orderId} updated to CANCELLED`);
          }

          channel.ack(msg);
        } catch (consumeErr) {
          console.error('[Order Service] Error handling payment.completed event:', consumeErr.message);
          channel.ack(msg);
        }
      });

      console.log(`[Order Service] RabbitMQ connected. Topic exchange '${EXCHANGE_NAME}' ready and consumer listening on '${QUEUE_NAME}'.`);
      isConnecting = false;
      return;
    } catch (err) {
      console.error(`[Order Service] RabbitMQ connection failed: ${err.message}. Retrying in 3s...`);
      channel = null;
      connection = null;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  isConnecting = false;
}

function publishOrderCreated(orderData) {
  if (!channel) {
    throw new Error('RabbitMQ channel not available to publish order.created event');
  }

  const payload = Buffer.from(JSON.stringify(orderData));
  const published = channel.publish(EXCHANGE_NAME, ROUTING_KEY_ORDER_CREATED, payload, {
    persistent: true,
    contentType: 'application/json',
  });

  console.log(`[Order Service] Emitted event '${ROUTING_KEY_ORDER_CREATED}' for Order ${orderData.orderId}`);
  return published;
}

function isConnected() {
  return connection !== null && channel !== null;
}

module.exports = {
  connect,
  publishOrderCreated,
  isConnected,
};
