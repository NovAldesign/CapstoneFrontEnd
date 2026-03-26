import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import CheckoutForm from '../Components/CheckoutForm.jsx'; 
import { createPaymentIntent } from '../Services/stripeService.js';

// Initialize Stripe with your Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getEventAndIntent = async () => {
            try {
                // 1. Fetch Event Details from your backend
                const eventRes = await axios.get(`http://localhost:3000/api/events/${eventId}`);
                setEvent(eventRes.data);

                // 2. Create Payment Intent
                // Note: Replace hardcoded user info with real user data from your Auth state if available
                const intentData = await createPaymentIntent({
                    eventId: eventRes.data._id,
                    ticketType: "General Admission",
                    quantity: 1,
                    buyerName: "GFC Guest", 
                    buyerEmail: "guest@example.com",
                    unitPrice: eventRes.data.price // Ensure price is in cents
                });

                setClientSecret(intentData.clientSecret);
                setLoading(false);
            } catch (err) {
                console.error("Initialization Error:", err);
                setError("Could not initialize checkout. Please try again.");
                setLoading(false);
            }
        };

        if (eventId) getEventAndIntent();
    }, [eventId]);

    if (loading) return <div className="loading-screen">Preparing your GFC experience...</div>;
    if (error) return <div className="error-screen">{error}</div>;

    const options = {
        clientSecret,
        appearance: { theme: 'stripe' },
    };

    return (
        <div className="checkout-page-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
            <h1 className="playfair">Checkout</h1>
            
            {event && (
                <div className="order-summary" style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
                    <h3>{event.title}</h3>
                    <p>{new Date(event.date).toLocaleDateString()} | {event.location}</p>
                    <p style={{ fontWeight: 'bold' }}>Total: ${(event.price / 100).toFixed(2)}</p>
                </div>
            )}

            {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            )}
        </div>
    );
};

export default CheckoutPage;