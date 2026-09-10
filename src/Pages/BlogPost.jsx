import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../Styles/BlogPost.css';

const API_BASE = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  "http://localhost:3000";

const BlogPost = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/articles/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Article not found");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching article:", err);
        setLoading(false);
      });
  }, [slug]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  if (loading) return <div className="editorial-page-loading">Loading article...</div>;
  if (!article) {
    return (
      <div className="editorial-page-loading">
        <h2>Article Not Found</h2>
        <Link to="/blog" className="back-link">← Back to Articles</Link>
      </div>
    );
  }

  // Format date to full string (e.g., September 10, 2026)
  const formattedDate = article.publishedAt 
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'September 10, 2026';

  const authorDisplay = "Vaughn W.";

  return (
    <div className="editorial-page">
      {/* Editorial Header Banner */}
      <header className="gathering-header">
        <Link to="/blog" className="editorial-back">← Back to Articles</Link>
        <h1 className="publication-title">The Gathering Table</h1>
        <p className="publication-subtitle">
          Notes on ending social isolation, one game night at a time — from the people building real community for grown folks in Atlanta.
        </p>
        <div className="header-divider" />
      </header>

      {/* Main Article Section */}
      <main className="editorial-container">
        <article>
          {/* Article Header & Byline */}
          <div className="article-meta-block">
            <span className="author-dropcap">V</span>
            <div className="author-details">
              <span className="author-name">{authorDisplay}</span>
              <span className="meta-separator">&middot;</span>
              <span className="publish-date">{formattedDate}</span>
            </div>
          </div>

          <h2 className="editorial-article-title">{article.title}</h2>

          {/* Hero Image */}
          {article.imageUrl && (
            <div className="hero-image-wrap">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="editorial-hero-image"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="editorial-body-content"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          {/* Author Sign-off Box */}
          <div className="author-signoff">
            <div className="signoff-avatar">V</div>
            <p>Written by <strong>{authorDisplay}</strong>, founder of Grown Folks Collective.</p>
          </div>

          {/* Upcoming Events & Partnership Links */}
          <div className="editorial-cta-card">
            <h3>Pull Up a Chair</h3>
            <p>Ready to connect in person or collaborate with us?</p>
            <div className="cta-actions">
              <Link to="/events" className="btn-primary">See Upcoming Events</Link>
              <Link to="/partnerships" className="btn-secondary">Partner With Us</Link>
            </div>
          </div>

          {/* Newsletter Subscription Component */}
          <section className="newsletter-section">
            <h3>Get the next post in your inbox</h3>
            <p>New stories on connection, community, and belonging — plus a heads-up before events sell out.</p>
            
            {subscribed ? (
              <div className="subscribe-success">
                Thanks for joining! Welcome to the table.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="you@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">Join the table</button>
              </form>
            )}
            <span className="newsletter-note">No spam. Just the table talk and the next invite.</span>
          </section>
        </article>
      </main>
    </div>
  );
};

export default BlogPost;