import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getShopOrder, longDate } from '../Services/shopApi';
import '../Styles/Shop.css';

// /gift/success and /shop/success — thank-you page after Stripe
const ShopSuccess = ({ kind = 'gift' }) => {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id') || '';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    let tries = 0;
    let timer;
    const load = () =>
      getShopOrder(sessionId)
        .then((o) => {
          // The payment confirmation can take a few seconds to arrive
          if (o.type === 'pending' && tries++ < 6) timer = setTimeout(load, 2000);
          else setOrder(o);
        })
        .catch(() => setOrder({ type: 'pending' }));
    load();
    return () => clearTimeout(timer);
  }, [sessionId]);

  const scheduled = order?.isGift && order.sendAt && new Date(order.sendAt) > new Date(Date.now() + 60000);

  return (
    <div className="shop-page">
      <Helmet>
        <title>Thank you | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="shop-main shop-center shop-thanks">
        <div className="shop-check" aria-hidden="true">✓</div>
        {kind === 'merch' ? (
          <>
            <h1 className="playfair">Your pre-order is in.</h1>
            <p className="shop-lead-dark">
              {order?.orderNumber ? `Order ${order.orderNumber}. ` : ''}Your receipt is on its way by email.
              Every piece is made to order after the pre-sale closes, and we'll email tracking when it ships.
            </p>
          </>
        ) : order?.isGift ? (
          <>
            <h1 className="playfair">Gift {scheduled ? 'scheduled' : 'sent'}!</h1>
            <p className="shop-lead-dark">
              {scheduled
                ? `We'll email ${order.recipientName || 'them'} their ${order.label} on ${longDate(order.sendAt)}.`
                : `${order.recipientName || 'They'} will have their ${order.label} in their inbox in a minute.`}{' '}
              Your receipt with the code is on its way too.
            </p>
          </>
        ) : (
          <>
            <h1 className="playfair">You're all set!</h1>
            {order?.code ? (
              <div className="shop-code-box">
                <span>{order.label}</span>
                <strong>{order.code}</strong>
              </div>
            ) : null}
            <p className="shop-lead-dark">
              Your code is in your email too. Add tickets to your bag, tap "Have a code or gift card?" and enter it.
            </p>
          </>
        )}
        {order?.bonus && (
          <div className="shop-code-box shop-code-gold">
            <span>{order.bonus.label} for you</span>
            <strong>{order.bonus.code}</strong>
          </div>
        )}
        <div className="shop-actions">
          <Link to="/events" className="shop-btn shop-btn-navy">See upcoming events</Link>
          <Link to={kind === 'merch' ? '/gift' : '/gift'} className="shop-btn shop-btn-ghost">Send another gift</Link>
        </div>
        <p className="shop-tagline playfair">Where grown folks come out to play.™</p>
      </main>
    </div>
  );
};

export default ShopSuccess;
