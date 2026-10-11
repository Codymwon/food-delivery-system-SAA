import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fooddash_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [restaurantId, setRestaurantId] = useState(() => {
    return localStorage.getItem('fooddash_cart_restaurant_id') || null;
  });

  const [restaurantName, setRestaurantName] = useState(() => {
    return localStorage.getItem('fooddash_cart_restaurant_name') || null;
  });

  useEffect(() => {
    localStorage.setItem('fooddash_cart', JSON.stringify(items));
    if (restaurantId) {
      localStorage.setItem('fooddash_cart_restaurant_id', restaurantId);
    } else {
      localStorage.removeItem('fooddash_cart_restaurant_id');
    }
    if (restaurantName) {
      localStorage.setItem('fooddash_cart_restaurant_name', restaurantName);
    } else {
      localStorage.removeItem('fooddash_cart_restaurant_name');
    }
  }, [items, restaurantId, restaurantName]);

  const addItem = (dish, restaurant, forceReset = false) => {
    const dishRestId = restaurant?.id || restaurant?._id || restaurantId;
    const dishRestName = restaurant?.name || restaurantName;

    if (restaurantId && dishRestId && restaurantId !== dishRestId && !forceReset) {
      return {
        conflict: true,
        currentRestaurant: restaurantName,
        newRestaurant: dishRestName,
      };
    }

    if (forceReset || (restaurantId && dishRestId && restaurantId !== dishRestId)) {
      setItems([{ ...dish, quantity: 1 }]);
      setRestaurantId(dishRestId);
      setRestaurantName(dishRestName);
      return { success: true, count: 1 };
    }

    setRestaurantId(dishRestId);
    setRestaurantName(dishRestName);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => (i.id || i._id || i.menuItemId) === (dish.id || dish._id || dish.menuItemId)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      return [...prevItems, { ...dish, quantity: 1 }];
    });

    return { success: true };
  };

  const removeItem = (dishId) => {
    setItems((prev) => {
      const next = prev.filter((i) => (i.id || i._id || i.menuItemId) !== dishId);
      if (next.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return next;
    });
  };

  const updateQty = (dishId, delta) => {
    setItems((prev) => {
      const next = prev
        .map((item) => {
          if ((item.id || item._id || item.menuItemId) === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      if (next.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    localStorage.removeItem('fooddash_cart');
    localStorage.removeItem('fooddash_cart_restaurant_id');
    localStorage.removeItem('fooddash_cart_restaurant_name');
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const deliveryFee = items.length === 0 ? 0 : subtotal >= 500 ? 0 : 30;
  const platformFee = items.length === 0 ? 0 : 15;
  const total = items.length === 0 ? 0 : subtotal + deliveryFee + platformFee;

  const value = {
    items,
    restaurantId,
    restaurantName,
    totalItemsCount,
    subtotal,
    deliveryFee,
    platformFee,
    total,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
