const amqp = require('amqplib');

const EXCHANGE_NAME = 'food_delivery_events';
const QUEUE_NAME = 'notification_events_queue';
const BINDING_KEYS = ['order.*', 'payment.*', 'delivery.*'];

const MAX_NOTIFICATIONS = 100;
const ringBuffer = [];

let connection = null;
let channel = null;
let isConnecting = false;

function addNotification(item) {
  ringBuffer.push(item);
  if (ringBuffer.length > MAX_NOTIFICATIONS) {
    ringBuffer.shift();
  }
}

function getNotificationsByUser(userId) {
  if (!userId) return [];
  return ringBuffer.filter((n) => String(n.userId) === String(userId));
}

function getNotificationsByOrder(orderId) {
  if (!orderId) return [];
  return ringBuffer.filter((n) => String(n.orderId) === String(orderId));
}

function getAllNotifications() {
  return [...ringBuffer];
}

function formatNotificationMessage(routingKey, data) {
  const orderId = data.orderId || 'Unknown';

  if (routingKey === 'order.created') {
    return `Order #${orderId} placed! Waiting for payment...`;
  }

  if (routingKey === 'payment.completed') {
    const amount = data.amount !== undefined ? data.amount : '';
    return `Payment of ₹${amount} confirmed! Food is being prepared.`;
  }

  if (routingKey === 'delivery.assigned') {
    const partner = data.partnerName || 'Ramesh Kumar';
    const eta = data.etaMinutes || 25;
    return `Rider ${partner} assigned! ETA: ${eta} mins.`;
  }

  if (routingKey === 'delivery.status_updated') {
    if (data.status === 'OUT_FOR_DELIVERY') {
      return `Order #${orderId} is out for delivery! Rider Ramesh Kumar is en route.`;
    }
    if (data.status === 'DELIVERED') {
      return `Order #${orderId} delivered! Enjoy your meal.`;
    }
    return `Delivery update for Order #${orderId}: Status is now ${data.status}.`;
  }

  return `Update for Order #${orderId}: Event ${routingKey}`;
}

async function connect(url) {
  if (channel) return;
  if (isConnecting) return;
  isConnecting = true;

  const rabbitUrl = url || process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  while (!channel) {
    try {
      console.log(`[Notification Service] Connecting to RabbitMQ at ${rabbitUrl}...`);
      connection = await amqp.connect(rabbitUrl);

      connection.on('error', (err) => {
        console.error('[Notification Service] RabbitMQ connection error:', err.message);
      });

      connection.on('close', () => {
        console.warn('[Notification Service] RabbitMQ connection closed. Reconnecting in 3s...');
        channel = null;
        connection = null;
        setTimeout(() => connect(rabbitUrl), 3000);
      });

      channel = await connection.createChannel();

      channel.on('error', (err) => {
        console.error('[Notification Service] RabbitMQ channel error:', err.message);
      });

      channel.on('close', () => {
        console.warn('[Notification Service] RabbitMQ channel closed.');
        channel = null;
      });

      // Assert topic exchange
      await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

      // Assert queue and bind to wildcard event patterns
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      for (const routingKey of BINDING_KEYS) {
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, routingKey);
        console.log(`[Notification Service] Bound queue '${QUEUE_NAME}' to '${routingKey}'`);
      }

      // Consume all domain events
      await channel.consume(QUEUE_NAME, (msg) => {
        if (!msg) return;

        try {
          const routingKey = msg.fields.routingKey;
          const content = JSON.parse(msg.content.toString());
          console.log(`[Notification Service] Received event '${routingKey}':`, content);

          const formattedMessage = formatNotificationMessage(routingKey, content);

          const notificationRecord = {
            id: `NOTIF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            eventType: routingKey,
            orderId: content.orderId || null,
            userId: content.userId || null,
            message: formattedMessage,
            data: content,
            timestamp: new Date().toISOString(),
          };

          addNotification(notificationRecord);
          console.log(`[Notification Service] Alert logged: "${formattedMessage}"`);

          channel.ack(msg);
        } catch (consumeErr) {
          console.error('[Notification Service] Error processing message:', consumeErr.message);
          channel.ack(msg);
        }
      });

      console.log(`[Notification Service] RabbitMQ connected. Consumer active on '${QUEUE_NAME}'.`);
      isConnecting = false;
      return;
    } catch (err) {
      console.error(`[Notification Service] RabbitMQ connection failed: ${err.message}. Retrying in 3s...`);
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
  getNotificationsByUser,
  getNotificationsByOrder,
  getAllNotifications,
};
