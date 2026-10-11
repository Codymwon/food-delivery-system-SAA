import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Navbar from './components/Navbar';
import ProfileDrawer from './components/ProfileDrawer';
import CartDrawer from './components/CartDrawer';
import RestaurantList from './components/RestaurantList';
import RestaurantPage from './components/RestaurantPage';
import DishDetailModal from './components/DishDetailModal';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import OrdersView from './components/OrdersView';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { UtensilsCrossed } from 'lucide-react';

export default function App() {
  const { isAuthenticated } = useAuth();
  const { totalItemsCount } = useCart();

  const [activeTab, setActiveTab] = useState('restaurants');
  const [activeOrderId, setActiveOrderId] = useState(() => {
    return localStorage.getItem('fooddash_active_order_id') || null;
  });
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  // Navigation & modals state
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);

  // Drawer visibility states
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync active order ID with localStorage
  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('fooddash_active_order_id', activeOrderId);
    } else {
      localStorage.removeItem('fooddash_active_order_id');
    }
  }, [activeOrderId]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#restaurant/')) {
        const id = hash.replace('#restaurant/', '');
        if (id) {
          const names = {
            'rest-kfc': 'KFC Campus Express',
            'rest-bk': 'Burger King VIT',
            'rest-dominos': "Domino's Pizza Hub",
          };
          setSelectedRestaurant({ id, name: names[id] || 'Campus Restaurant' });
          setActiveTab('restaurants');
        }
      } else if (hash.startsWith('#tracker/')) {
        const id = hash.replace('#tracker/', '');
        if (id) {
          setActiveOrderId(id);
          setActiveTab('tracker');
        }
      } else if (hash === '#orders') {
        setActiveTab('orders');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // FIRST SCREEN GATEWAY: User MUST go through Login/Register Screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // ONCE AUTHENTICATED: Main Food Delivery Application
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FAF7F2] text-slate-900 font-sans relative selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      
      {/* Ambient Warm Atmosphere & Micro-Pattern Dot Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-micro-pattern" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.14),rgba(254,215,170,0.06)_50%,transparent_75%)] blur-2xl" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.05),transparent_70%)] blur-3xl" />
      </div>

      {/* Persistent Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'restaurants') {
            setSelectedRestaurant(null);
          }
        }}
        activeOrderId={activeOrderId}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
        onOpenCartDrawer={() => setIsCartDrawerOpen((prev) => !prev)}
      />

      {/* Customer Profile Slide-Over Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />

      {/* Floating Corner Pop-up Cart & Persistent Bottom Pill */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onToggle={() => setIsCartDrawerOpen((prev) => !prev)}
        onClose={() => setIsCartDrawerOpen(false)}
        onCheckout={() => {
          setIsCartDrawerOpen(false);
          setIsCheckoutModalOpen(true);
        }}
      />

      {/* Screen 3: Instant Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderPlaced={(newOrderId) => {
          setActiveOrderId(newOrderId);
          setActiveTab('tracker');
        }}
      />

      {/* Dish Portion / Customization Modal */}
      {selectedDish && (
        <DishDetailModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          onOpenRestaurantMenu={(rest) => {
            setSelectedDish(null);
            setSelectedRestaurant(rest);
          }}
          onAddedToCart={(rest) => {
            setSelectedDish(null);
            const targetId = rest?.id || selectedDish?.restaurantId;
            const targetName = rest?.name || selectedDish?.restaurantName;
            if (targetId) {
              setSelectedRestaurant({
                id: targetId,
                name: targetName,
              });
            }
          }}
        />
      )}

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'restaurants' ? (
          /* VIEW 1: Screen 2 - Restaurant Discovery or Dedicated Restaurant Page */
          selectedRestaurant ? (
            <RestaurantPage
              restaurant={selectedRestaurant}
              onBack={() => {
                setSelectedRestaurant(null);
                if (window.location.hash.startsWith('#restaurant')) {
                  window.history.replaceState(null, '', window.location.pathname);
                }
              }}
              onSelectDish={(dish) => setSelectedDish(dish)}
            />
          ) : (
            <RestaurantList
              onOpenRestaurant={(restaurant) => setSelectedRestaurant(restaurant)}
              onSelectDish={(dish) => setSelectedDish(dish)}
            />
          )
        ) : activeTab === 'tracker' ? (
          /* VIEW 2: Screen 4 - Live Order Tracker & Status Stepper */
          activeOrderId ? (
            <OrderTracker
              orderId={activeOrderId}
              onBackToRestaurants={() => {
                setActiveTab('restaurants');
                setSelectedRestaurant(null);
              }}
              onOpenOrders={() => setActiveTab('orders')}
            />
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm text-center max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                No Active Order Tracking
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Place an order from any campus kitchen or select an order from your history to track live delivery.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('restaurants')}
                  className="btn-tactile px-6 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md shadow-orange-600/20"
                >
                  Browse Campus Restaurants
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="btn-tactile px-6 py-3 rounded-full bg-white hover:bg-stone-50 text-slate-700 border border-stone-200 font-bold text-xs"
                >
                  View Order History
                </button>
              </div>
            </div>
          )
        ) : (
          /* VIEW 3: My Orders List */
          <OrdersView
            onSelectOrder={(selectedId) => {
              setActiveOrderId(selectedId);
              setActiveTab('tracker');
            }}
            onBrowseRestaurants={() => {
              setActiveTab('restaurants');
              setSelectedRestaurant(null);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/70 bg-white/80 backdrop-blur-xs py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-xs text-slate-500 font-medium text-center">
          <span>&copy; 2026 FoodDash · Fast food delivery to your hostel room</span>
        </div>
      </footer>

    </div>
  );
}
