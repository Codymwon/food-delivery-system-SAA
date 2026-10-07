const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const net = require('net');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Upstream Infrastructure Config
const INFRA_CONFIG = {
  mongodb: {
    host: process.env.MONGO_HOST || 'mongodb',
    port: parseInt(process.env.MONGO_PORT || '27017', 10),
  },
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'rabbitmq',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
};

// Microservice Route Table Mapping
const ROUTES = {
  '/api/auth': process.env.AUTH_SERVICE_URL || 'http://auth-service:5001',
  '/api/users': process.env.USER_SERVICE_URL || 'http://user-service:5002',
  '/api/restaurants': process.env.RESTAURANT_SERVICE_URL || 'http://restaurant-service:5003',
  '/api/orders': process.env.ORDER_SERVICE_URL || 'http://order-service:5004',
  '/api/payments': process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5005',
  '/api/delivery': process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:5006',
  '/api/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5007',
  '/api/reviews': process.env.REVIEW_SERVICE_URL || 'http://review-service:5008',
};

// TCP Connectivity Checker Helper
function checkTcpConnection(host, port, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve('CONNECTED');
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve('DISCONNECTED');
      }
    });

    socket.on('error', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve('DISCONNECTED');
      }
    });

    socket.connect(port, host);
  });
}

// 1. Root Metadata Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Online Food Delivery System - API Gateway',
    version: '1.0.0',
    status: 'UP',
    architecture: 'Microservices with Database-per-Service Pattern',
    endpoints: {
      root: '/',
      health: '/api/health',
    },
    routes: ROUTES,
  });
});

// 2. Health & Diagnostics Endpoint
const handleHealthCheck = async (req, res) => {
  const [mongoStatus, rabbitmqStatus, redisStatus] = await Promise.all([
    checkTcpConnection(INFRA_CONFIG.mongodb.host, INFRA_CONFIG.mongodb.port),
    checkTcpConnection(INFRA_CONFIG.rabbitmq.host, INFRA_CONFIG.rabbitmq.port),
    checkTcpConnection(INFRA_CONFIG.redis.host, INFRA_CONFIG.redis.port),
  ]);

  const getHostAndPort = (urlStr, defaultHost, defaultPort) => {
    try {
      const u = new URL(urlStr);
      return { host: u.hostname, port: parseInt(u.port || defaultPort, 10) };
    } catch {
      return { host: defaultHost, port: defaultPort };
    }
  };

  const serviceChecks = {};
  const activeServices = {
    auth: getHostAndPort(ROUTES['/api/auth'], 'auth-service', 5001),
    user: getHostAndPort(ROUTES['/api/users'], 'user-service', 5002),
    restaurant: getHostAndPort(ROUTES['/api/restaurants'], 'restaurant-service', 5003),
    order: getHostAndPort(ROUTES['/api/orders'], 'order-service', 5004),
    payment: getHostAndPort(ROUTES['/api/payments'], 'payment-service', 5005),
  };

  await Promise.all(
    Object.entries(activeServices).map(async ([name, target]) => {
      const conn = await checkTcpConnection(target.host, target.port, 1500);
      serviceChecks[name] = conn === 'CONNECTED' ? 'UP' : 'DOWN';
    })
  );

  const payload = {
    gateway: 'UP',
    status: 'UP',
    timestamp: new Date().toISOString(),
    architecture: 'Microservices with Database-per-Service Pattern',
    infrastructure: {
      mongodb: mongoStatus,
      rabbitmq: rabbitmqStatus,
      redis: redisStatus,
    },
    services: serviceChecks,
    routes: ROUTES,
  };

  res.status(200).json(payload);
};

app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// 3. Register Reverse Proxy Handlers for All 8 Microservices
const proxyErrorHandler = (err, req, res) => {
  console.error(`[Proxy Error] ${req.method} ${req.originalUrl || req.url}:`, err.message);
  if (!res.headersSent) {
    res.status(503).json({
      error: 'Service Unavailable',
      message: `Downstream service for path ${req.baseUrl || req.url} is currently unavailable.`,
      targetError: err.code || err.message,
      timestamp: new Date().toISOString(),
    });
  }
};

for (const [routePath, targetUrl] of Object.entries(ROUTES)) {
  app.use(
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathFilter: routePath,
      on: {
        proxyReq: fixRequestBody,
        error: proxyErrorHandler,
      },
      onError: proxyErrorHandler,
    })
  );
}

// 4. Catch-all for unmatched endpoints
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.originalUrl || req.url} was not found on this API Gateway.`,
    availableRoutes: Object.keys(ROUTES),
    healthCheck: '/api/health',
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API Gateway] Running on port ${PORT}`);
  console.log(`[API Gateway] Health check available at http://localhost:${PORT}/api/health`);
  console.log('[API Gateway] Registered microservice routes:');
  for (const [route, target] of Object.entries(ROUTES)) {
    console.log(`  ${route}/* -> ${target}`);
  }
});

module.exports = app;
