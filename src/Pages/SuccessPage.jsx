import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const SuccessPage = () => {
    const { piId } = useParams(); // Grabs the ID from the URL
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                // Adjust the URL if your backend is hosted on a different domain
                const response = await fetch(`/api/checkout/order-status/${piId}`);
                const data = await response.json();
                setOrder(data);
            } catch (err) {
                console.error("Error fetching order:", err);
            } finally {
                setLoading(false);
            }
        };

        if (piId) fetchOrderStatus();
    }, [piId]);

    if (loading) return <div className="p-10 text-center">Loading your order details...</div>;

    if (!order) return <div className="p-10 text-center">Order not found.</div>;

    return (
        <div className="max-w-2xl mx-auto p-8 text-center">
            <h1 className="text-3xl font-bold text-navy mb-4">Success!</h1>
            <p className="text-lg mb-6">Thank you for joining us. Your spot is confirmed!</p>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gold mb-6">
                <h2 className="text-xl font-semibold mb-2">{order.event?.title}</h2>
                <p className="text-gray-600">{new Date(order.event?.date).toLocaleDateString()}</p>
                <p className="text-gray-600">{order.event?.location}</p>
            </div>

            <Link 
                to="/events" 
                className="inline-block bg-navy text-white px-6 py-2 rounded hover:bg-opacity-90 transition"
            >
                Back to Events
            </Link>
        </div>
    );
};

export default SuccessPage;