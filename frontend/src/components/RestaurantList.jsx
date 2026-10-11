import React, { useState, useEffect, useRef } from 'react';
import PromoBanner from './PromoBanner';
import CuisinePills from './CuisinePills';
import PopularPicksRow from './PopularPicksRow';
import RestaurantGrid from './RestaurantGrid';
import DishDetailModal from './DishDetailModal';
import RestaurantPage from './RestaurantPage';
import { fetchRestaurants } from '../api/client';
import { useCart } from '../context/CartContext';

const FALLBACK_RESTAURANTS = {
  'rest-kfc': { id: 'rest-kfc', name: 'KFC', cuisine: 'Burgers, Biryani, Fast Food', rating: 4.7, deliveryTimeMinutes: 20, minOrder: 150, bannerImage: '/images/photo-1513639776629-7b61b0ac49cb.jpg' },
  'rest-bk': { id: 'rest-bk', name: 'Burger King', cuisine: 'Burgers, American, Shakes', rating: 4.6, deliveryTimeMinutes: 25, minOrder: 120, bannerImage: '/images/photo-1568901346375-23c9450c58cd.jpg' },
  'rest-mcd': { id: 'rest-mcd', name: "McDonald's", cuisine: 'Burgers, Fast Food, McCafe', rating: 4.8, deliveryTimeMinutes: 20, minOrder: 140, bannerImage: '/images/photo-1550547660-d9450f859349.jpg' },
  'rest-dominos': { id: 'rest-dominos', name: "Domino's Pizza", cuisine: 'Pizzas, Italian, Desserts', rating: 4.7, deliveryTimeMinutes: 25, minOrder: 180, bannerImage: '/images/photo-1513104890138-7c749659a591.jpg' },
  'rest-pizzahut': { id: 'rest-pizzahut', name: 'Pizza Hut', cuisine: 'Pizzas, Pasta, Fast Food', rating: 4.5, deliveryTimeMinutes: 30, minOrder: 160, bannerImage: '/images/photo-1590947132387-155cc02f3212.jpg' },
  'rest-behrouz': { id: 'rest-behrouz', name: 'Behrouz Biryani', cuisine: 'Biryani, Mughlai, Royal Indian', rating: 4.9, deliveryTimeMinutes: 30, minOrder: 250, bannerImage: '/images/photo-1563379091339-03b21ab4a4f8.jpg' },
  'rest-subway': { id: 'rest-subway', name: 'Subway', cuisine: 'Healthy Food, Sandwiches, Salads', rating: 4.6, deliveryTimeMinutes: 20, minOrder: 130, bannerImage: '/images/photo-1509722747041-616f39b57569.jpg' },
};

export default function RestaurantList({ onOpenRestaurant, onSelectDish }) {
  const { addItem } = useCart();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback internal restaurant state if not controlled by parent App
  const [internalRestaurant, setInternalRestaurant] = useState(null);
  const [internalDish, setInternalDish] = useState(null);

  const catalogRef = useRef(null);

  const handleRestaurantClick = onOpenRestaurant || setInternalRestaurant;
  const handleDishClick = onSelectDish || setInternalDish;

  const loadRestaurants = async (categoryQuery = null, search = '') => {
    setLoading(true);
    try {
      const params = {};
      if (categoryQuery && categoryQuery !== 'all') {
        params.cuisine = categoryQuery;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await fetchRestaurants(params);
      setRestaurants(res.restaurants);
    } catch (err) {
      console.error('[RestaurantList] Error loading restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const handleSelectCategory = (catId, query) => {
    setActiveCategory(catId);
    loadRestaurants(query, searchQuery);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    loadRestaurants(activeCategory === 'all' ? null : activeCategory, query);
  };

  const handleOrderNowScroll = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add dish from Popular Picks directly to cart & navigate to restaurant page
  const handleAddPopularPick = (dish) => {
    const found =
      restaurants.find((r) => (r.id || r._id) === dish.restaurantId) ||
      FALLBACK_RESTAURANTS[dish.restaurantId] || {
        id: dish.restaurantId,
        name: dish.restaurantName,
      };

    const itemToAdd = {
      id: dish.id,
      name: dish.name,
      price: dish.price,
      imageUrl: dish.imageUrl,
      portion: 'regular',
      menuItemId: dish.id,
    };

    const res = addItem(itemToAdd, { id: found.id, name: found.name }, false);
    if (res?.conflict) {
      // If conflict with another restaurant, open modal to show conflict resolution dialog
      if (handleDishClick) {
        handleDishClick(dish);
      }
      return;
    }

    // Successfully added: navigate straight to corresponding restaurant page!
    if (handleRestaurantClick) {
      handleRestaurantClick(found);
    }
  };

  // If internal restaurant is active and not controlled by parent
  if (internalRestaurant && !onOpenRestaurant) {
    return (
      <div className="w-full">
        <RestaurantPage
          restaurant={internalRestaurant}
          onBack={() => setInternalRestaurant(null)}
          onSelectDish={handleDishClick}
        />

        {internalDish && (
          <DishDetailModal
            dish={internalDish}
            onClose={() => setInternalDish(null)}
            onOpenRestaurantMenu={(rest) => {
              setInternalDish(null);
              const found = restaurants.find((r) => (r.id || r._id) === rest.id) || FALLBACK_RESTAURANTS[rest.id] || rest;
              setInternalRestaurant(found);
            }}
            onAddedToCart={(rest) => {
              setInternalDish(null);
              const found = restaurants.find((r) => (r.id || r._id) === rest.id) || FALLBACK_RESTAURANTS[rest.id] || rest;
              setInternalRestaurant(found);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* SECTION 1: WARM AMBIENT HERO & CATEGORY ZONE (Option 1 + Option 2 Blend) */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 px-4 sm:px-6 lg:px-8 pt-8 pb-10 rounded-b-[40px] bg-gradient-to-b from-orange-100/60 via-orange-50/30 to-[#FAF7F2]/0 border-b border-orange-200/50 shadow-xs mb-10 overflow-hidden">
        
        {/* Subtle diffuse radial glow centered behind hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          {/* 1. Slim Promotional Hero Banner (Spacious Full-Width Desktop Layout) */}
          <PromoBanner onOrderNow={handleOrderNowScroll} />

          {/* 2. Horizontal Category Pills with Circular Food Photos */}
          <CuisinePills
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      </div>

      {/* SECTION 2: DISCOVERY CATALOG FEED (Popular Campus Picks & Restaurant Grid) */}
      <div className="space-y-12">
        {/* 3. Popular Campus Picks Horizontally Scrolling Row */}
        <PopularPicksRow
          onSelectDish={(dish) => handleDishClick(dish)}
          onAddDishAndNavigate={handleAddPopularPick}
        />

        {/* 4. Campus Restaurants Grid with Search */}
        <div ref={catalogRef}>
          <RestaurantGrid
            restaurants={restaurants}
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            onOpenMenu={(restaurant) => handleRestaurantClick(restaurant)}
          />
        </div>
      </div>

      {/* DISH DETAIL / PORTION MODAL (Internal fallback if not controlled by parent) */}
      {internalDish && !onSelectDish && (
        <DishDetailModal
          dish={internalDish}
          onClose={() => setInternalDish(null)}
          onOpenRestaurantMenu={(rest) => {
            setInternalDish(null);
            const found = restaurants.find((r) => (r.id || r._id) === rest.id) || FALLBACK_RESTAURANTS[rest.id] || rest;
            handleRestaurantClick(found);
          }}
          onAddedToCart={(rest) => {
            setInternalDish(null);
            const found = restaurants.find((r) => (r.id || r._id) === rest.id) || FALLBACK_RESTAURANTS[rest.id] || rest;
            handleRestaurantClick(found);
          }}
        />
      )}
    </div>
  );
}
