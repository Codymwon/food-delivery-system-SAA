const amqp = require('amqplib');
const Payment = require('./models/Payment');

const EXCHANGE_NAME = 'food_delivery_events';
const QUEUE_NAME = 'payment_orders_queue';
const ROUTING_KEY_ORDER_CREATED = 'order.created';
const ROUTING_KEY_PAYMENT_COMPLETED = 'payment.completed';

let connection = null;
let channel = null;
let isConnecting = false;

// Helper to generate unique Payment Transaction ID (e.g. TXN-391820)
function generatePaymentId() {
  return `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function connect(url) {
  if (channel) return;
  if (isConnecting) return;
  isConnecting = true;

  const rabbitUrl = url || process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  while (!channel) {
    try {
      console.log(`[Payment Service] Connecting to RabbitMQ at ${rabbitUrl}...`);
      connection = await amqp.connect(rabbitUrl);

      connection.on('error', (err) => {
        console.error('[Payment Service] RabbitMQ connection error:', err.message);
      });

      connection.on('close', () => {
        console.warn('[Payment Service] RabbitMQ connection closed. Reconnecting in 3s...');
        channel = null;
        connection = null;
        setTimeout(() => connect(rabbitUrl), 3000);
      });

      channel = await connection.createChannel();

      channel.on('error', (err) => {
        console.error('[Payment Service] RabbitMQ channel error:', err.message);
      });

      channel.on('close', () => {
        console.warn('[Payment Service] RabbitMQ channel closed.');
        channel = null;
      });

      // Assert topic exchange
      await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

      // Assert competing consumer queue and bind to order.created
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY_ORDER_CREATED);

      // Fair dispatch across competing consumer workers
      await channel.prefetch(1);

      // Consume order.created events
      await channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`[Payment Service] Received order.created event for Order ${content.orderId} (Amount: ${content.totalAmount})`);

          // Idempotency check: see if a transaction already exists for this orderId
          let payment = await Payment.findOne({ orderId: content.orderId });

          if (!payment) {
            // Simulate payment authorization delay (~800ms)
            console.log(`[Payment Service] Simulating payment processing delay (800ms) for Order ${content.orderId}...`);
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Generate unique payment ID
            let paymentId = generatePaymentId();
            while (await Payment.findOne({ paymentId })) {
              paymentId = generatePaymentId();
            }

            payment = new Payment({
              paymentId,
              orderId: content.orderId,
              userId: content.userId,
              amount: content.totalAmount,
              method: content.paymentMethod || 'UPI',
              status: 'SUCCESS',
            });

            await payment.save();
            console.log(`[Payment Service] Payment record persisted: ${payment.paymentId} for Order ${payment.orderId}`);
          } else {
            console.log(`[Payment Service] Existing payment record found: ${payment.paymentId} for Order ${payment.orderId}`);
          }

          // Publish payment.completed event
          const paymentCompletedEvent = {
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            userId: payment.userId,
            amount: payment.amount,
            status: payment.status,
          };

          channel.publish(
            EXCHANGE_NAME,
            ROUTING_KEY_PAYMENT_COMPLETED,
            Buffer.from(JSON.stringify(paymentCompletedEvent)),
            {
              persistent: true,
              contentType: 'application/json',
            }
          );

          console.log(`[Payment Service] Published payment.completed event: ${payment.paymentId} for Order ${payment.orderId}`);
          channel.ack(msg);
        } catch (consumeErr) {
          console.error('[Payment Service] Error processing order.created event:', consumeErr.message);
          channel.ack(msg);
        }
      });

      console.log(`[Payment Service] RabbitMQ connected. Topic exchange '${EXCHANGE_NAME}' ready and worker consuming from '${QUEUE_NAME}'.`);
      isConnecting = false;
      return;
    } catch (err) {
      console.error(`[Payment Service] RabbitMQ connection failed: ${err.message}. Retrying in 3s...`);
      channel = null;
      connection = null;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  isConnecting = false;
}

function isConnected() {
  return connection !== null && channel !== null;
}

module.exports = {
  connect,
  isConnected,
};
