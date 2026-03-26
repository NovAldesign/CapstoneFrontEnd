import axios from 'axios';

// Set the base URL for your API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Communicates with the GFC Backend to create a Payment Intent
 * @param {Object} orderData - { eventId, ticketType, quantity, buyerName, buyerEmail, unitPrice }
 * @returns {Promise<Object>} - Returns { clientSecret, orderId }
 */
export const createPaymentIntent = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/checkout/create-intent`, orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to initialize payment');
  }
};

/**
 * Optional: Fetch public key if you want to keep it dynamic, 
 * though usually, you just put this in your .env
 */
export const getStripePublishableKey = () => {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
};