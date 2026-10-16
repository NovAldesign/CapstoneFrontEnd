import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getDownloads, downloadUrl } from '../Services/shopApi';
import '../Styles/Shop.css';

// /downloads/:token — a buyer's private page for their printable Karaoke Bingo files
const Downloads = () => {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDownloads(token).then(setOrder).catch((e) => setError(e.message));
  }, [token]);

  const editions = order?.files.filter((f) => f.label !== 'Host Guide') || [];
  const guide = order?.files.find((f) => f.label === 'Host Guide');

  return (
    <div className="shop-page">
      <Helmet>
        <title>Your downloads | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="shop-main dl-main">
        <p className="shop-label">Printable Karaoke Bingo</p>
        <h1 className="playfair shop-h2">Your downloads</h1>
        {error && <p className="shop-error" role="alert">{error}</p>}
        {!order && !error && <p className="shop-muted">Loading…</p>}

        {order && (
          <>
            <p className="shop-sub">Order {order.orderNumber}. Bookmark this page or keep the email; you can come back and print again any time.</p>

            {guide && (
              <a className="dl-row dl-guide" href={downloadUrl(token, guide.file)} target="_blank" rel="noreferrer">
                <span>
                  <strong>Start here: Host Guide</strong>
                  <small>How to run the night, printing tips, and the hunt-song twist</small>
                </span>
                <span className="dl-go">Open PDF</span>
              </a>
            )}

            <ul className="dl-list">
              {editions.map((f) => (
                <li key={f.file}>
                  <a className="dl-row" href={downloadUrl(token, f.file)} target="_blank" rel="noreferrer">
                    <span>
                      <strong>{f.label}</strong>
                      <small>40 cards · Letter size</small>
                    </span>
                    <span className="dl-go">Open PDF</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="shop-card dl-tips">
              <h2 className="playfair shop-h3">Printing tips</h2>
              <ul>
                <li>Print at Actual size (100%), Letter paper.</li>
                <li>Pages are numbered Round 1 and Round 2. Print two-sided, flip on long edge, for 20 sheets.</li>
                <li>Print pages 1–2 first and hold them to the light to check the sides line up.</li>
                <li>Colored card stock looks sharp. Laminate the set and use dry-erase markers to reuse them all season.</li>
              </ul>
            </div>
            <p className="shop-fine">{order.license}</p>
            <p className="shop-fine">Need help? Email <strong>events@grownfolkscollective.com</strong> with your order number.</p>
          </>
        )}
        <div className="shop-actions">
          <Link to="/shop#bingo" className="shop-btn shop-btn-ghost">More editions</Link>
          <Link to="/events" className="shop-btn shop-btn-navy">Play with us in Atlanta</Link>
        </div>
        <p className="shop-tagline playfair">Where grown folks come out to play.™</p>
      </main>
    </div>
  );
};

export default Downloads;
