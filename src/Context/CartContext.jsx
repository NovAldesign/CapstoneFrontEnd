import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 1. Load cart items from local storage when the page boots up
  useEffect(() => {
    const savedCart = localStorage.getItem('gfc_event_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error reading cart from localStorage:", e);
      }
    }
  }, []);

  // 2. Save cart items to local storage whenever a user adds/removes something
  useEffect(() => {
    localStorage.setItem('gfc_event_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 3. Action: Add a ticket to the cart
  const addToCart = (event, ticketType) => {
    setCartItems((prevItems) => {
      // Check if this exact ticket tier for this specific event is already in the cart
      const existingIndex = prevItems.findIndex(
        (item) => item.eventId === event._id && item.ticketTypeId === ticketType._id
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      // If it's a new item, add it to the array matching our backend requirements
      return [
        ...prevItems,
        {
          eventId: event._id,
          eventName: event.name,
          ticketTypeId: ticketType._id,
          ticketTypeName: ticketType.name,
          priceInCents: ticketType.price, // Stored in cents (e.g. 3000 = $30.00)
          quantity: 1,
        },
      ];
    });
  };

  // 4. Action: Change item quantities or remove them completely
  const updateQuantity = (eventId, ticketTypeId, newQty) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter(item => !(item.eventId === eventId && item.ticketTypeId === ticketTypeId)));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.eventId === eventId && item.ticketTypeId === ticketTypeId
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const removeFromCart = (eventId, ticketTypeId) => {
    setCartItems((prev) => prev.filter(item => !(item.eventId === eventId && item.ticketTypeId === ticketTypeId)));
  };

  const clearCart = () => setCartItems([]);

  // 5. MATH LOGIC: Count how many UNIQUE events are in the cart to calculate bundle scales
  const uniqueEventCount = [...new Set(cartItems.map((item) => item.eventId))].length;

  let discountRate = 0;       // For UI display (0.10 = 10%)
  let discountMultiplier = 1.0;

  if (uniqueEventCount === 2) {
    discountRate = 0.10;
  } else if (uniqueEventCount >= 3) {
    discountRate = 0.15; // Max 15% discount cap
  }

  // Calculate Subtotal before discounts
  const subtotalInCents = cartItems.reduce(
    (sum, item) => sum + item.priceInCents * item.quantity,
    0
  );

  // Calculate how much money is saved
  const discountInCents = Math.round(subtotalInCents * discountRate);
  
  // Final total after bundle deduction
  const totalInCents = subtotalInCents - discountInCents;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        uniqueEventCount,
        discountRate,
        subtotalInCents,
        discountInCents,
        totalInCents,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to quickly tap into the cart anywhere on the site
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider element.');
  }
  return context;
};

