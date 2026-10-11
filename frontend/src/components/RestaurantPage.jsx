import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  ShoppingBag,
  Plus,
  Minus,
  Search,
  Tag,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  ChevronRight,
  Utensils,
  Share2,
} from 'lucide-react';
import { fetchRestaurantMenu } from '../api/client';
import { useCart } from '../context/CartContext';
import RestaurantReviews from './RestaurantReviews';

const RESTAURANT_OFFERS = {
  'rest-kfc': { tag: 'FLAT 30% OFF up to ₹75', code: 'CAMPUS20', desc: 'Valid on orders above ₹199' },
  'rest-bk': { tag: 'FLAT 25% OFF above ₹199', code: 'BKFEAST', desc: 'Free Crispy Fries on ₹349' },
  'rest-mcd': { tag: 'FREE McSpicy Fries on ₹299', code: 'FRIESFREE', desc: 'Valid across campus delivery' },
  'rest-dominos': { tag: '20% OFF on Gourmet Range', code: 'DOMINOS20', desc: 'Free Garlic Bread on ₹399' },
  'rest-pizzahut': { tag: 'BUY 1 GET 1 on Pan Pizzas', code: 'BOGOHUT', desc: 'Applicable on Medium Pan Pizzas' },
  'rest-behrouz': { tag: 'FLAT ₹100 OFF with code ROYAL', code: 'ROYAL', desc: 'Complimentary dessert with Biryani' },
  'rest-subway': { tag: 'SUB OF THE DAY at ₹179', code: 'SUBWAYDAY', desc: 'Upgrade to footlong for ₹120' },
};

export default function RestaurantPage({ restaurant, onBack, onSelectDish }) {
  const { addItem, updateQty, items: cartItems, restaurantId: cartRestId, restaurantName: cartRestName } = useCart();

  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'

  // Restaurant conflict dialog
  const [conflictItem, setConflictItem] = useState(null);

  // Copied offer code state
  const [copiedCode, setCopiedCode] = useState(false);

  const restId = restaurant?.id || restaurant?._id;
  const offer = RESTAURANT_OFFERS[restId] || {
    tag: 'Campus Student Special Available',
    code: 'CAMPUS20',
    desc: 'Free doorstep hostel delivery above ₹500',
  };

  // Browser back button support
  useEffect(() => {
    const handlePopState = () => {
      onBack();
    };

    window.history.pushState({ page: 'restaurant', id: restId }, '', `#restaurant/${restId}`);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [restId, onBack]);

  // Load menu items
  useEffect(() => {
    if (!restId) return;

    let mounted = true;
    async function loadMenu() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchRestaurantMenu(restId);
        if (mounted) {
          setMenuData(data);
        }
      } catch (err) {
        if (mounted) {
          console.error('[RestaurantPage] Error loading menu:', err);
          setError('Failed to load menu items from campus kitchen. Please try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMenu();
    return () => {
      mounted = false;
    };
  }, [restId]);

  // Veg/Non-Veg classifier helper
  const isItemVeg = (item) => {
    if (item.isVeg !== undefined) return Boolean(item.isVeg);
    const text = `${item.name} ${item.description || ''}`.toLowerCase();
    const nonVegKeywords = ['chicken', 'mutton', 'non-veg', 'fish', 'meat', 'prawn', 'zinger', 'beef', 'pepperoni'];
    for (const kw of nonVegKeywords) {
      if (text.includes(kw)) return false;
    }
    return true;
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    if (!menuData?.items) return [];

    return menuData.items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Veg filter
      const veg = isItemVeg(item);
      if (vegFilter === 'veg' && !veg) return false;
      if (vegFilter === 'non-veg' && veg) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesCat = (item.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [menuData, selectedCategory, vegFilter, searchQuery]);

  // Group filtered items by category
  const categoriesList = useMemo(() => {
    if (!menuData?.categories) return [];
    return menuData.categories;
  }, [menuData]);

  const itemsByCategory = useMemo(() => {
    const map = {};
    for (const item of filteredItems) {
      const cat = item.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    }
    return map;
  }, [filteredItems]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(offer.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Add to cart handler
  const handleAddItem = (dish, force = false) => {
    const itemToAdd = {
      id: dish.id || dish._id,
      name: dish.name,
      price: dish.price,
      imageUrl: dish.imageUrl,
      portion: 'regular',
      menuItemId: dish.id || dish._id,
    };

    const res = addItem(itemToAdd, { id: restaurant.id, name: restaurant.name }, force);
    if (res?.conflict) {
      setConflictItem(dish);
    }
  };

  const handleResolveConflict = () => {
    if (conflictItem) {
      handleAddItem(conflictItem, true);
      setConflictItem(null);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
      {/* 1. TOP BREADCRUMBS & BACK BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/80">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-slate-900 transition-colors"
          >
            Campus Restaurants
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 truncate max-w-[200px]">
            {restaurant.name}
          </span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn-tactile self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-slate-700 hover:text-slate-900 border border-stone-200/90 text-xs font-bold shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-orange-600" />
          <span>Back to Restaurants</span>
        </button>
      </div>

      {/* 2. RESTAURANT HERO SHOWCASE CARD */}
      <section className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm">
        {/* Banner with gradient overlay */}
        <div className="relative h-48 sm:h-64 lg:h-72 w-full bg-stone-900 overflow-hidden">
          <img
            src={restaurant.bannerImage}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Top floating pill */}
          <div className="absolute top-4 left-4 sm:left-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Delivery Active</span>
            </span>
          </div>

          {/* Bottom details on banner */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {restaurant.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-200 font-medium mt-1 drop-shadow-xs">
                {restaurant.cuisine} · VIT Vellore Direct Kitchen
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>{restaurant.rating || 4.7}</span>
                <span className="text-[10px] text-emerald-100 font-normal">(500+ ratings)</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{restaurant.deliveryTimeMinutes || 25} mins</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-300" />
                <span>Min Order: ₹{restaurant.minOrder || 100}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Offer Ribbon */}
        <div className="p-4 sm:px-6 sm:py-3.5 bg-orange-50/70 border-t border-orange-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-orange-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block sm:inline mr-2">
                {offer.tag}
              </span>
              <span className="text-slate-600 text-[11px]">
                {offer.desc}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyCode}
              className="btn-tactile px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-orange-700 hover:text-orange-900 font-mono text-[11px] font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
              title="Click to copy coupon code"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">COPIED</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>CODE: {offer.code}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 3. IN-MENU SEARCH & QUICK FILTERS BAR */}
      <section className="sticky top-20 z-20 bg-[#FAFAF9]/95 backdrop-blur-md py-3 -my-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search inside menu */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${restaurant.name} menu...`}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Veg / Non-Veg / Bestseller Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <button
              type="button"
              onClick={() => setVegFilter('all')}
              className={`btn-tactile px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                vegFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-slate-700 border border-stone-200'
              }`}
            >
              All Items
            </button>

            <button
              type="button"
              onClick={() => setVegFilter('veg')}
              className={`btn-tactile flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                vegFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Veg Only</span>
            </button>

            <button
              type="button"
              onClick={() => setVegFilter('non-veg')}
              className={`btn-tactile flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                vegFilter === 'non-veg'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-white hover:bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Navigator Pills */}
        {categoriesList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 border-t border-stone-200/60 pt-2.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-slate-700 border border-stone-200/80'
              }`}
            >
              <span>All Categories</span>
              <span className="ml-1.5 text-[10px] opacity-75">
                ({menuData?.items?.length || 0})
              </span>
            </button>

            {categoriesList.map((cat) => {
              const count = menuData?.menuByCategory?.[cat]?.length || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'bg-white hover:bg-stone-50 text-slate-700 border border-stone-200/80'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="ml-1.5 text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. DISHES MENU SECTION */}
      <section className="space-y-8 pb-20">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#EA580C]" />
            <span className="text-xs font-medium text-slate-500">
              Loading {restaurant.name} menu from campus kitchen...
            </span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-xs bg-red-50 rounded-3xl border border-red-200 max-w-lg mx-auto space-y-3">
            <AlertCircle className="w-6 h-6 mx-auto text-red-500" />
            <p className="font-medium">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-tactile px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No dishes found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No dishes matching "${searchQuery}" were found. Try clearing your search filter.`
                : 'No items match the selected vegetarian or category filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setVegFilter('all');
                setSelectedCategory('all');
              }}
              className="btn-tactile px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Render by Category Sections */
          Object.keys(itemsByCategory).map((catName) => {
            const itemsInCat = itemsByCategory[catName];
            if (!itemsInCat || itemsInCat.length === 0) return null;

            return (
              <div key={catName} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{catName}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      ({itemsInCat.length})
                    </span>
                  </h2>
                </div>

                {/* Grid of Dishes (2-columns on desktop) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {itemsInCat.map((item) => {
                    const itemId = item.id || item._id;
                    const isVeg = isItemVeg(item);

                    // Check if item is in tray
                    const cartMatch = cartItems.find(
                      (ci) => ci.id === itemId || ci.menuItemId === itemId
                    );
                    const qtyInCart = cartMatch ? cartMatch.quantity : 0;

                    return (
                      <div
                        key={itemId}
                        className="group bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-5 hover:border-orange-200 hover:shadow-md transition-all duration-200 flex items-start justify-between gap-4"
                      >
                        {/* Left Details */}
                        <div className="flex-1 min-w-0 pr-1">
                          
                          {/* Veg/Non-Veg & Bestseller Badges */}
                          <div className="flex items-center gap-2 mb-1.5">
                            {/* Veg / Non-Veg standard indicator */}
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isVeg
                                  ? 'border-emerald-600 bg-white'
                                  : 'border-red-600 bg-white'
                              }`}
                              title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                }`}
                              />
                            </div>

                            {item.isBestseller && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                <span>Bestseller</span>
                              </span>
                            )}
                          </div>

                          {/* Dish Name */}
                          <h3
                            onClick={() => {
                              if (onSelectDish) {
                                onSelectDish({
                                  ...item,
                                  restaurantId: restaurant.id,
                                  restaurantName: restaurant.name,
                                });
                              }
                            }}
                            className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors cursor-pointer leading-snug"
                          >
                            {item.name}
                          </h3>

                          {/* Price */}
                          <div className="font-extrabold text-slate-900 text-sm sm:text-base mt-1">
                            ₹{item.price}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Customize hint if applicable */}
                          <div className="mt-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectDish) {
                                  onSelectDish({
                                    ...item,
                                    restaurantId: restaurant.id,
                                    restaurantName: restaurant.name,
                                  });
                                }
                              }}
                              className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                            >
                              View Portions & Ingredients &gt;
                            </button>
                          </div>
                        </div>

                        {/* Right Photo & Interactive Add Button */}
                        <div className="relative shrink-0 w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden bg-stone-100 shadow-2xs">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          {/* Interactive Cart Button / Stepper */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] flex justify-center">
                            {qtyInCart > 0 ? (
                              <div className="w-full flex items-center justify-between bg-slate-900 text-white rounded-xl p-1 shadow-lg border border-slate-700 backdrop-blur-md">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQty(cartMatch.id, -1);
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-800 text-white transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" strokeWidth={2.5} />
                                </button>
                                <span className="font-bold text-xs text-white px-1">
                                  {qtyInCart}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQty(cartMatch.id, 1);
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-800 text-white transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddItem(item);
                                }}
                                className="btn-tactile w-full py-1.5 px-3 rounded-xl bg-white hover:bg-[#EA580C] text-[#EA580C] hover:text-white border border-stone-200/90 hover:border-[#EA580C] text-xs font-extrabold shadow-md flex items-center justify-center gap-1 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                                <span>ADD</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>
 
      {/* 5. RESTAURANT REVIEWS SECTION */}
      <RestaurantReviews restaurantId={restId} />

      {/* 6. RESTAURANT CONFLICT DIALOG MODAL */}
      {conflictItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Replace items in cart?</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Your tray currently contains dishes from <strong>{cartRestName}</strong>. A delivery order can only contain items from one restaurant at a time.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConflictItem(null)}
                className="btn-tactile flex-1 py-2.5 rounded-xl border border-stone-200 text-slate-700 hover:bg-stone-50 font-bold text-xs"
              >
                Keep Current Tray
              </button>
              <button
                type="button"
                onClick={handleResolveConflict}
                className="btn-tactile flex-1 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md shadow-orange-600/20"
              >
                Discard & Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
