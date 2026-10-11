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

// Instance Tracking Middleware
app.use((req, res, next) => {
  res.setHeader('X-Served-By', process.env.HOSTNAME || 'unknown');
  next();
});

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

    console.log('[Restaurant Service] Seeding real restaurants and menus...');

    const demoRestaurants = [
      {
        id: 'rest-kfc',
        name: 'KFC',
        cuisine: 'Fast Food, Fried Chicken, Burgers',
        rating: 4.7,
        deliveryTimeMinutes: 20,
        minOrder: 150,
        bannerImage: '/images/photo-1513639776629-7b61b0ac49cb.jpg',
        isOpen: true,
      },
      {
        id: 'rest-bk',
        name: 'Burger King',
        cuisine: 'Burgers, American, Shakes',
        rating: 4.6,
        deliveryTimeMinutes: 25,
        minOrder: 120,
        bannerImage: '/images/photo-1568901346375-23c9450c58cd.jpg',
        isOpen: true,
      },
      {
        id: 'rest-mcd',
        name: "McDonald's",
        cuisine: 'Burgers, Fast Food, McCafe',
        rating: 4.8,
        deliveryTimeMinutes: 20,
        minOrder: 140,
        bannerImage: '/images/photo-1550547660-d9450f859349.jpg',
        isOpen: true,
      },
      {
        id: 'rest-dominos',
        name: "Domino's Pizza",
        cuisine: 'Pizzas, Italian, Pastas',
        rating: 4.7,
        deliveryTimeMinutes: 25,
        minOrder: 150,
        bannerImage: '/images/photo-1513104890138-7c749659a591.jpg',
        isOpen: true,
      },
      {
        id: 'rest-pizzahut',
        name: 'Pizza Hut',
        cuisine: 'Pizzas, Italian, Cheesy Pan',
        rating: 4.6,
        deliveryTimeMinutes: 30,
        minOrder: 180,
        bannerImage: '/images/photo-1590947132387-155cc02f3212.jpg',
        isOpen: true,
      },
      {
        id: 'rest-behrouz',
        name: 'Behrouz Biryani',
        cuisine: 'Biryani, Mughlai, Royal Indian',
        rating: 4.9,
        deliveryTimeMinutes: 30,
        minOrder: 250,
        bannerImage: '/images/photo-1563379091339-03b21ab4a4f8.jpg',
        isOpen: true,
      },
      {
        id: 'rest-subway',
        name: 'Subway',
        cuisine: 'Healthy, Subs, Salads',
        rating: 4.5,
        deliveryTimeMinutes: 20,
        minOrder: 130,
        bannerImage: '/images/photo-1509722747041-616f39b57569.jpg',
        isOpen: true,
      },
    ];

    await Restaurant.insertMany(demoRestaurants);

    const demoMenuItems = [
      // 1. KFC
      {
        id: 'item-kfc-1',
        restaurantId: 'rest-kfc',
        name: '8 Pcs Hot & Crispy Chicken Bucket',
        description: 'Signature juicy bone-in chicken marinated in secret 11 herbs & spices, fried to golden crunch. Served with 2 dips.',
        price: 649,
        category: 'Buckets',
        imageUrl: '/images/photo-1513639776629-7b61b0ac49cb.jpg',
        isAvailable: true,
      },
      {
        id: 'item-kfc-2',
        restaurantId: 'rest-kfc',
        name: 'Zinger Burger Meal with Fries & Drink',
        description: 'Signature crispy whole chicken fillet burger layered with fresh iceberg lettuce and creamy mayo, with medium fries and Pepsi.',
        price: 299,
        category: 'Burgers',
        imageUrl: '/images/photo-1625813506062-0aeb1d7a094b.jpg',
        isAvailable: true,
      },
      {
        id: 'item-kfc-3',
        restaurantId: 'rest-kfc',
        name: 'Popcorn Chicken (Medium)',
        description: 'Bite-sized tender chicken nuggets seasoned with fiery spices. Ultimate crunchy snack.',
        price: 169,
        category: 'Snacks',
        imageUrl: '/images/photo-1562967914-608f82629710.jpg',
        isAvailable: true,
      },
      {
        id: 'item-kfc-4',
        restaurantId: 'rest-kfc',
        name: 'Peri Peri 5 Pcs Boneless Strips',
        description: 'Tender 100% chicken breast strips coated with spicy peri-peri dust and served with garlic mayo dip.',
        price: 249,
        category: 'Snacks',
        imageUrl: '/images/photo-1585325701165-351af916e581.jpg',
        isAvailable: true,
      },
      {
        id: 'item-kfc-5',
        restaurantId: 'rest-kfc',
        name: 'Chilled Pepsi Black Can (330ml)',
        description: 'Zero calorie maximum taste refreshing chilled cola.',
        price: 57,
        category: 'Drinks',
        imageUrl: '/images/photo-1629203851122-3726ecdf080e.jpg',
        isAvailable: true,
      },

      // 2. Burger King
      {
        id: 'item-bk-1',
        restaurantId: 'rest-bk',
        name: 'Whopper® Meal (Burger + Fries + Coke)',
        description: 'Iconic flame-grilled patty topped with juicy tomatoes, crisp lettuce, creamy mayonnaise, ketchup, pickles, and sliced white onions on a toasted sesame seed bun.',
        price: 299,
        category: 'King Meals',
        imageUrl: '/images/photo-1568901346375-23c9450c58cd.jpg',
        isAvailable: true,
      },
      {
        id: 'item-bk-2',
        restaurantId: 'rest-bk',
        name: 'Fiery Chicken Whopper',
        description: 'Flame-grilled spicy chicken patty with molten pepper jack cheese, jalapeños, and ghost pepper relish.',
        price: 249,
        category: 'Burgers',
        imageUrl: '/images/photo-1550547660-d9450f859349.jpg',
        isAvailable: true,
      },
      {
        id: 'item-bk-3',
        restaurantId: 'rest-bk',
        name: 'Crispy Veg Double Patty Burger',
        description: 'Two crispy herb patties with melted cheddar slice, crunchy onions, and smoky tandoori sauce.',
        price: 159,
        category: 'Burgers',
        imageUrl: '/images/photo-1520072959219-c595dc870360.jpg',
        isAvailable: true,
      },
      {
        id: 'item-bk-4',
        restaurantId: 'rest-bk',
        name: 'King Peri Peri Fries (Large)',
        description: 'Golden crispy thick-cut potatoes tossed in fiery peri-peri spice mix.',
        price: 119,
        category: 'Sides',
        imageUrl: '/images/photo-1576107232684-1279f3908594.jpg',
        isAvailable: true,
      },
      {
        id: 'item-bk-5',
        restaurantId: 'rest-bk',
        name: 'Thick Chocolate Velvet Shake',
        description: 'Rich Belgian chocolate soft serve spun with chocolate fudge drizzle.',
        price: 139,
        category: 'Drinks',
        imageUrl: '/images/photo-1572490122747-3968b75cc699.jpg',
        isAvailable: true,
      },

      // 3. McDonald's
      {
        id: 'item-mcd-1',
        restaurantId: 'rest-mcd',
        name: 'McSpicy Chicken Burger Meal',
        description: 'Tender chicken patty marinated in spicy batter, shredded lettuce, spicy mayo, with World Famous Fries and drink.',
        price: 289,
        category: 'Meals',
        imageUrl: '/images/photo-1594212699903-ec8a3eca50f5.jpg',
        isAvailable: true,
      },
      {
        id: 'item-mcd-2',
        restaurantId: 'rest-mcd',
        name: 'McAloo Tikki Double Patty',
        description: 'Two crunchy spiced potato and pea patties with sweet tomato mayo, onions, and toasted bun.',
        price: 109,
        category: 'Burgers',
        imageUrl: '/images/photo-1586190848861-99aa4a171e90.jpg',
        isAvailable: true,
      },
      {
        id: 'item-mcd-3',
        restaurantId: 'rest-mcd',
        name: 'World Famous Fries (Large)',
        description: 'Golden, crispy potatoes made from premium Russet Burbank potatoes, perfectly salted.',
        price: 115,
        category: 'Sides',
        imageUrl: '/images/photo-1573080496219-bb080dd4f877.jpg',
        isAvailable: true,
      },
      {
        id: 'item-mcd-4',
        restaurantId: 'rest-mcd',
        name: 'Oreo McFlurry Cream Dessert',
        description: 'Creamy vanilla soft serve swirled with crunchy chocolate Oreo cookie pieces.',
        price: 129,
        category: 'Desserts',
        imageUrl: '/images/photo-1570197788417-0e82375c9371.jpg',
        isAvailable: true,
      },
      {
        id: 'item-mcd-5',
        restaurantId: 'rest-mcd',
        name: 'Iced Caramel Frappe McCafe',
        description: 'Rich coffee blended with ice, milk, and caramel drizzle, topped with whipped cream.',
        price: 169,
        category: 'Drinks',
        imageUrl: '/images/photo-1517701550927-30cf4ba1dba5.jpg',
        isAvailable: true,
      },

      // 4. Domino's Pizza
      {
        id: 'item-dominos-1',
        restaurantId: 'rest-dominos',
        name: 'Peppy Paneer Stuffed Crust Pizza',
        description: 'Chunky paneer cubes, crisp capsicum, spicy red paprika with cheese burst crust.',
        price: 389,
        category: 'Pizzas',
        imageUrl: '/images/photo-1513104890138-7c749659a591.jpg',
        isAvailable: true,
      },
      {
        id: 'item-dominos-2',
        restaurantId: 'rest-dominos',
        name: 'Indi Chicken Tikka Gourmet Pizza',
        description: 'Tandoori chicken tikka, mint drizzle, red paprika, and 100% real mozzarella cheese.',
        price: 449,
        category: 'Pizzas',
        imageUrl: '/images/photo-1565299624946-b28f40a0ae38.jpg',
        isAvailable: true,
      },
      {
        id: 'item-dominos-3',
        restaurantId: 'rest-dominos',
        name: 'Stuffed Garlic Breadsticks',
        description: 'Freshly baked garlic bread filled with melted mozzarella, jalapeños, and sweet corn.',
        price: 149,
        category: 'Sides',
        imageUrl: '/images/photo-1619881589721-a58933b9bb8e.jpg',
        isAvailable: true,
      },
      {
        id: 'item-dominos-4',
        restaurantId: 'rest-dominos',
        name: 'Choco Lava Molten Cake',
        description: 'Warm chocolate cake with decadent oozing molten dark chocolate fudge center.',
        price: 109,
        category: 'Desserts',
        imageUrl: '/images/photo-1606313564200-e75d5e30476c.jpg',
        isAvailable: true,
      },

      // 5. Pizza Hut
      {
        id: 'item-ph-1',
        restaurantId: 'rest-pizzahut',
        name: 'Supreme Cheesy Pan Pizza',
        description: 'Loaded with black olives, green bell peppers, red onions, mushrooms, and golden mozzarella on iconic buttery pan crust.',
        price: 419,
        category: 'Pan Pizzas',
        imageUrl: '/images/photo-1590947132387-155cc02f3212.jpg',
        isAvailable: true,
      },
      {
        id: 'item-ph-2',
        restaurantId: 'rest-pizzahut',
        name: 'Spiced Paneer Makhani Pan Pizza',
        description: 'Marinated paneer, buttery makhani sauce swirl, capsicum, red onion, and mozzarella cheese.',
        price: 369,
        category: 'Pan Pizzas',
        imageUrl: '/images/photo-1604382354936-07c5d9983bd3.jpg',
        isAvailable: true,
      },
      {
        id: 'item-ph-3',
        restaurantId: 'rest-pizzahut',
        name: 'Cheese Garlic Bread with Dip',
        description: 'Toasted baguette brushed with garlic butter and topped with bubbling melted cheese.',
        price: 139,
        category: 'Sides',
        imageUrl: '/images/photo-1573140247632-f8fd74997d5c.jpg',
        isAvailable: true,
      },
      {
        id: 'item-ph-4',
        restaurantId: 'rest-pizzahut',
        name: 'Creamy Tomato Veg Pasta',
        description: 'Penne pasta tossed in roasted garlic marinara and creamy cheese sauce.',
        price: 189,
        category: 'Sides',
        imageUrl: '/images/photo-1621996346565-e3d5d6281699.jpg',
        isAvailable: true,
      },

      // 6. Behrouz Biryani
      {
        id: 'item-behrouz-1',
        restaurantId: 'rest-behrouz',
        name: 'Dum Gosht Shahi Biryani (Boneless)',
        description: 'Tender boneless mutton pieces slow-cooked in aromatic spices, layered with aged basmati rice and saffron. Served with Gulab Jamun & Raita.',
        price: 449,
        category: 'Royal Biryanis',
        imageUrl: '/images/photo-1563379091339-03b21ab4a4f8.jpg',
        isAvailable: true,
      },
      {
        id: 'item-behrouz-2',
        restaurantId: 'rest-behrouz',
        name: 'Murgh Makhani Dum Biryani',
        description: 'Boneless chicken marinated in royal spices and buttery gravy, slow-dum cooked with basmati rice.',
        price: 389,
        category: 'Royal Biryanis',
        imageUrl: '/images/photo-1633945274405-b6c8069047b0.jpg',
        isAvailable: true,
      },
      {
        id: 'item-behrouz-3',
        restaurantId: 'rest-behrouz',
        name: 'Subz-e-Biryani (Royal Veg Dum)',
        description: 'Fresh vegetables, paneer cubes, and aromatic saffron basmati rice cooked on slow flame.',
        price: 299,
        category: 'Royal Biryanis',
        imageUrl: '/images/photo-1642821373181-696a54913e9a.jpg',
        isAvailable: true,
      },
      {
        id: 'item-behrouz-4',
        restaurantId: 'rest-behrouz',
        name: 'Murgh Kefta Kebab (6 pcs)',
        description: 'Minced chicken kebabs flavored with crushed coriander, green chili, and cardamom.',
        price: 289,
        category: 'Starters',
        imageUrl: '/images/photo-1610057099443-fde8c4d50f91.jpg',
        isAvailable: true,
      },
      {
        id: 'item-behrouz-5',
        restaurantId: 'rest-behrouz',
        name: 'Dastan-e-Kheer Rose Dessert',
        description: 'A royal rice pudding infused with rose water, crushed pistachios, and saffron.',
        price: 119,
        category: 'Desserts',
        imageUrl: '/images/photo-1601050690597-df0568f70950.jpg',
        isAvailable: true,
      },

      // 7. Subway
      {
        id: 'item-subway-1',
        restaurantId: 'rest-subway',
        name: 'Paneer Tikka Sub (6 inch)',
        description: 'Tender paneer cubes marinated in tandoori seasoning with crisp veggies, mint mayo, and honey mustard on multi-grain bread.',
        price: 219,
        category: 'Subs',
        imageUrl: '/images/photo-1509722747041-616f39b57569.jpg',
        isAvailable: true,
      },
      {
        id: 'item-subway-2',
        restaurantId: 'rest-subway',
        name: 'Roasted Chicken Breast Sub (6 inch)',
        description: 'Succulent roasted chicken slices with crunchy lettuce, cucumbers, bell peppers, and barbecue sweet onion dressing.',
        price: 249,
        category: 'Subs',
        imageUrl: '/images/photo-1554998171-7e599bc95ccd.jpg',
        isAvailable: true,
      },
      {
        id: 'item-subway-3',
        restaurantId: 'rest-subway',
        name: 'Double Dark Chocolate Chip Cookie',
        description: 'Soft-baked, chewy cookie loaded with rich dark chocolate chips.',
        price: 65,
        category: 'Cookies',
        imageUrl: '/images/photo-1499636136210-6f4ee915583e.jpg',
        isAvailable: true,
      },
      {
        id: 'item-subway-4',
        restaurantId: 'rest-subway',
        name: 'Crispy Toasted Hash Browns (4 pcs)',
        description: 'Golden seasoned potato patties oven-toasted to crunchy perfection.',
        price: 79,
        category: 'Sides',
        imageUrl: '/images/photo-1619881589721-a58933b9bb8e.jpg',
        isAvailable: true,
      },
    ];

    await MenuItem.insertMany(demoMenuItems);
    console.log(`[Restaurant Service] Successfully seeded ${demoRestaurants.length} restaurants and ${demoMenuItems.length} menu items.`);
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
    servedBy: process.env.HOSTNAME || 'unknown',
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
      const cachedData = JSON.parse(cached);
      return res.status(200).json({
        servedBy: process.env.HOSTNAME || 'unknown',
        restaurants: Array.isArray(cachedData) ? cachedData : (cachedData.restaurants || []),
      });
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
    return res.status(200).json({
      servedBy: process.env.HOSTNAME || 'unknown',
      restaurants,
    });
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

    const restaurantObj = restaurant.toObject ? restaurant.toObject() : restaurant;
    return res.status(200).json({
      ...restaurantObj,
      servedBy: process.env.HOSTNAME || 'unknown',
    });
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
