import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../Context/CartContext.jsx';

const SuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id'); // Grabs ?session_id=cs_test_... from URL
    
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Immediately wipe out the client's shopping cart cache upon hitting this page
        clearCart();
        
        // 2. Stop loading indicator
        setLoading(false);
    }, [clearCart]);

    if (loading) {
        return (
            <div className="loader-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <div className="loader" style={{ fontSize: '18px', color: '#002147' }}>Confirming your connection passes...</div>
            </div>
        );
    }

    return (
        <div className="success-page-container" style={{ maxWidth: '600px', margin: '80px auto', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', color: '#C5A059', marginBottom: '20px' }}>✓</div>
            
            <h1 className="playfair" style={{ fontSize: '36px', color: '#002147', marginBottom: '15px' }}>
                Your Spot is Confirmed
            </h1>
            
            <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.6', marginBottom: '35px' }}>
                Thank you for choosing intentional real-world connection. Your multi-event bundle pass has been verified by Stripe. A receipt alongside entry details has been sent to your inbox.
            </p>
            
            <div 
                className="success-badge-box" 
                style={{ 
                    background: '#f9f9f9', 
                    border: '1px solid #EAEAEA', 
                    borderRadius: '8px', 
                    padding: '25px', 
                    marginBottom: '40px',
                    textAlign: 'left'
                }}
            >
                <h3 style={{ margin: '0 0 10px 0', color: '#002147', fontSize: '18px' }}>✨ Cultivating True Belonging</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                    We're preparing your Grown Folks Collective experience. Get ready to trade superficial networking for deep professional alignment and stress-free environments.
                </p>
                {sessionId && (
                    <div style={{ marginTop: '15px', fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}>
                        Session Ref: {sessionId.substring(0, 18)}...
                    </div>
                )}
            </div>

            <Link 
                to="/events" 
                className="btn-gold-card"
                style={{ 
                    display: 'inline-block', 
                    backgroundColor: '#002147', 
                    color: '#white', 
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '14px 30px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#C5A059')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#002147')}
            >
                Return to Gatherings
            </Link>
        </div>
    );
};

export default SuccessPage;