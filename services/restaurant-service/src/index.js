const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const cors = require('cors');
const morgan = require('morgan');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const app = express();
const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/restaurant_db';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Redis Client Setup
const redis = new Redis(REDIS_URL, {
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log(`[Restaurant Service] Connected to Redis at ${REDIS_URL}`);
});

redis.on('error', (err) => {
  console.error('[Restaurant Service] Redis error:', err.message);
});

// Auto-seed Demo Restaurants and Menus
async function seedDemoCatalog() {
  try {
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount > 0) {
      console.log(`[Restaurant Service] Catalog already seeded (${restaurantCount} restaurants exist).`);
      return;
    }

    console.log('[Restaurant Service] Seeding demo restaurants and menus...');

    const demoRestaurants = [
      {
        id: 'rest-1',
        name: 'Pizza Corner',
        cuisine: 'Italian',
        rating: 4.6,
        deliveryTimeMinutes: 25,
        minOrder: 150,
        bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        isOpen: true,
      },
      {
        id: 'rest-2',
        name: 'Burger Hub',
        cuisine: 'American',
        rating: 4.4,
        deliveryTimeMinutes: 20,
        minOrder: 120,
        bannerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
        isOpen: true,
      },
      {
        id: 'rest-3',
        name: 'Biryani Palace',
        cuisine: 'Indian',
        rating: 4.8,
        deliveryTimeMinutes: 30,
        minOrder: 200,
        bannerImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
        isOpen: true,
      },
    ];

    await Restaurant.insertMany(demoRestaurants);

    const demoMenuItems = [
      // 1. Pizza Corner
      {
        id: 'item-pc-1',
        restaurantId: 'rest-1',
        name: 'Margherita Pizza',
        description: 'Classic mozzarella cheese and rich San Marzano tomato sauce on crispy thin crust',
        price: 249,
        category: 'Pizzas',
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
        isAvailable: true,
      },
      {
        id: 'item-pc-2',
        restaurantId: 'rest-1',
        name: 'Farmhouse Special',
        description: 'Loaded with crisp bell peppers, red onions, mushrooms, and golden corn',
        price: 349,
        category: 'Pizzas',
        imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500',
        isAvailable: true,
      },
      {
        id: 'item-pc-3',
        restaurantId: 'rest-1',
        name: 'Garlic Breadsticks',
        description: 'Warm, oven-baked breadsticks brushed with garlic herb butter and parmesan',
        price: 129,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1619881589721-a58933b9bb8e?w=500',
        isAvailable: true,
      },
      {
        id: 'item-pc-4',
        restaurantId: 'rest-1',
        name: 'Choco Lava Cake',
        description: 'Warm chocolate cake with molten fudge core',
        price: 99,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
        isAvailable: true,
      },
      {
        id: 'item-pc-5',
        restaurantId: 'rest-1',
        name: 'Iced Peach Tea',
        description: 'Chilled brewed black tea with natural peach nectar',
        price: 79,
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
        isAvailable: true,
      },

      // 2. Burger Hub
      {
        id: 'item-bh-1',
        restaurantId: 'rest-2',
        name: 'Classic Cheeseburger',
        description: 'Grilled beef patty, melted Wisconsin cheddar, lettuce, tomato, pickles & signature sauce',
        price: 189,
        category: 'Burgers',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        isAvailable: true,
      },
      {
        id: 'item-bh-2',
        restaurantId: 'rest-2',
        name: 'Crispy Chicken Burger',
        description: 'Golden spiced chicken fillet topped with crunchy slaw and spicy garlic mayo',
        price: 219,
        category: 'Burgers',
        imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500',
        isAvailable: true,
      },
      {
        id: 'item-bh-3',
        restaurantId: 'rest-2',
        name: 'Peri-Peri Fries',
        description: 'Double-fried crispy French fries dusted with zesty African bird’s eye chili seasoning',
        price: 99,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500',
        isAvailable: true,
      },
      {
        id: 'item-bh-4',
        restaurantId: 'rest-2',
        name: 'Crunchy Onion Rings',
        description: 'Crispy beer-battered sweet onion rings served with barbecue dipping sauce',
        price: 89,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1639024471287-032f6670112b?w=500',
        isAvailable: true,
      },
      {
        id: 'item-bh-5',
        restaurantId: 'rest-2',
        name: 'Cold Brew Vanilla Milkshake',
        description: 'Rich vanilla bean ice cream spun with cold brew espresso',
        price: 119,
        category: 'Drinks',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
        isAvailable: true,
      },

      // 3. Biryani Palace
      {
        id: 'item-bp-1',
        restaurantId: 'rest-3',
        name: 'Chicken Dum Biryani',
        description: 'Slow-cooked authentic Hyderabadi basmati rice layered with succulent spiced chicken and fried onions',
        price: 299,
        category: 'Biryanis',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
        isAvailable: true,
      },
      {
        id: 'item-bp-2',
        restaurantId: 'rest-3',
        name: 'Paneer Dum Biryani',
        description: 'Long grain saffron basmati rice with marinated cottage cheese cubes, mint, and whole spices',
        price: 249,
        category: 'Biryanis',
        imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=500',
        isAvailable: true,
      },
      {
        id: 'item-bp-3',
        restaurantId: 'rest-3',
        name: 'Mirchi Ka Salan',
        description: 'Traditional slow-simmered peanut, sesame, and coconut gravy with roasted green chillies',
        price: 79,
        category: 'Sides',
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500',
        isAvailable: true,
      },
      {
        id: 'item-bp-4',
        restaurantId: 'rest-3',
        name: 'Chicken 65',
        description: 'Crispy deep-fried chicken cubes tossed in yogurt, curry leaves, and spicy red masala',
        price: 199,
        category: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500',
        isAvailable: true,
      },
      {
        id: 'item-bp-5',
        restaurantId: 'rest-3',
        name: 'Gulab Jamun (2 pcs)',
        description: 'Melt-in-mouth milk solids dumplings soaked in warm rose and cardamom sugar syrup',
        price: 69,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
        isAvailable: true,
      },
    ];

    await MenuItem.insertMany(demoMenuItems);
    console.log('[Restaurant Service] Successfully seeded 3 restaurants and 15 menu items.');
  } catch (err) {
    console.error('[Restaurant Service] Error seeding catalog:', err.message);
  }
}

// Router Definition
const router = express.Router();

// 1. Health check
router.get('/health', async (req, res) => {
  let redisStatus = 'DISCONNECTED';
  try {
    const ping = await redis.ping();
    if (ping === 'PONG') redisStatus = 'CONNECTED';
  } catch (e) {
    redisStatus = 'DISCONNECTED';
  }

  const mongoStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';

  return res.status(200).json({
    status: 'UP',
    service: 'restaurant-service',
    database: mongoStatus,
    cache: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

// 2. List all restaurants (with filters and Redis Cache-Aside)
router.get('/', async (req, res) => {
  const { cuisine, search } = req.query;

  const isDefaultQuery = !cuisine && !search;
  const cacheKey = isDefaultQuery ? 'cache:restaurants' : `cache:restaurants:${cuisine || ''}:${search || ''}`;

  // Step 1: Check Redis Cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(JSON.parse(cached));
    }
  } catch (cacheErr) {
    console.warn('[Restaurant Service] Cache read error, falling back to DB:', cacheErr.message);
  }

  // Step 2: Fetch from MongoDB
  try {
    const query = {};
    if (cuisine) {
      query.cuisine = new RegExp(cuisine, 'i');
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { cuisine: new RegExp(search, 'i') },
      ];
    }

    const restaurants = await Restaurant.find(query).sort({ rating: -1 });

    // Step 3: Populate Redis cache with 60s TTL
    try {
      await redis.set(cacheKey, JSON.stringify(restaurants), 'EX', 60);
    } catch (cacheSetErr) {
      console.warn('[Restaurant Service] Cache write error:', cacheSetErr.message);
    }

    res.set('X-Cache', 'MISS');
    return res.status(200).json(restaurants);
  } catch (dbErr) {
    console.error('[Restaurant Service] Database query error:', dbErr);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve restaurants',
    });
  }
});

// 3. Get detailed restaurant info
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant && mongoose.Types.ObjectId.isValid(id)) {
      restaurant = await Restaurant.findById(id);
    }

    if (!restaurant) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Restaurant not found with id: ${id}`,
      });
    }

    return res.status(200).json(restaurant);
  } catch (err) {
    console.error('[Restaurant Service] Get restaurant error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// 4. Get categorized menu items for a restaurant
router.get('/:id/menu', async (req, res) => {
  try {
    const { id } = req.params;
    let restaurant = await Restaurant.findOne({ id });
    if (!restaurant && mongoose.Types.ObjectId.isValid(id)) {
      restaurant = await Restaurant.findById(id);
    }

    const restIdentifier = restaurant ? restaurant.id : id;
    const items = await MenuItem.find({
      $or: [{ restaurantId: restIdentifier }, { restaurantId: id }],
      isAvailable: true,
    });

    if (!restaurant && items.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Restaurant or menu not found for id: ${id}`,
      });
    }

    // Group items by category
    const categories = [...new Set(items.map((i) => i.category))];
    const menuByCategory = {};
    for (const cat of categories) {
      menuByCategory[cat] = items.filter((i) => i.category === cat);
    }

    return res.status(200).json({
      restaurantId: restIdentifier,
      restaurantName: restaurant ? restaurant.name : 'Unknown',
      categories,
      items,
      menuByCategory,
    });
  } catch (err) {
    console.error('[Restaurant Service] Get menu error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

// Mount router on both '/api/restaurants' (gateway path) and '/' (direct service path)
app.use('/api/restaurants', router);
app.use('/', router);

// MongoDB and Redis Startup
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Restaurant Service] Connected to MongoDB at ${MONGO_URI}`);

    try {
      await redis.connect();
    } catch (e) {
      console.warn('[Restaurant Service] Initial Redis connection deferred/failed:', e.message);
    }

    await seedDemoCatalog();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Restaurant Service] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Restaurant Service] Startup error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
