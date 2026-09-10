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

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch(`${API_BASE}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.log("Newsletter submission received locally:", email);
    }

    setSubscribed(true);
    setEmail('');
  };

  if (loading) return <div className="editorial-page-loading">Loading article...</div>;
  if (!article) {
    return (
      <div className="editorial-page-loading">
        <h2>Article Not Found</h2>
        <Link to="/blog" className="editorial-back">← Back to Articles</Link>
      </div>
    );
  }

  const formattedDate = article.publishedAt 
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'September 9, 2026';

  const authorDisplay = "Vaughn W.";

  return (
    <div className="editorial-page">
      <div className="editorial-nav-bar">
        <Link to="/blog" className="editorial-back">← Back to Articles</Link>
      </div>

      {/* Main Grid Layout */}
      <div className="editorial-layout-grid">
        
        {/* Main Article Content */}
        <main className="editorial-main-content">
          <article>
            <h1 className="editorial-article-title">{article.title}</h1>

            <div className="article-meta-block">
              <span className="author-name">{authorDisplay}</span>
              <span className="meta-separator">&middot;</span>
              <span className="publish-date">{formattedDate}</span>
            </div>

            {/* Crisp Hero Image */}
            {article.imageUrl && (
              <div className="hero-image-wrap">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="editorial-hero-image"
                />
              </div>
            )}

            {/* Article Body */}
            <div 
              className="editorial-body-content"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />

            {/* Author Sign-off */}
            <div className="author-signoff">
              <div className="signoff-avatar">V</div>
              <p>Written by <strong>{authorDisplay}</strong>, founder of Grown Folks Collective.</p>
            </div>

            {/* Gold CTA Card with Navy Stripe */}
            <div className="editorial-cta-card">
              <h3>Pull Up a Chair</h3>
              <p>Ready to connect in person or collaborate with us?</p>
              <div className="cta-actions">
                <Link to="/events" className="btn-cta-navy">See Upcoming Events</Link>
                <Link to="/partnerships" className="btn-cta-outline">Partner With Us</Link>
              </div>
            </div>

            {/* Newsletter Form */}
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

        {/* Right Sidebar Widget */}
        <aside className="editorial-sidebar">
          <div className="membership-sidebar-card">
            <h3>Become a Member</h3>
            <p>Get exclusive access to events, priority RSVPing, and private community gatherings across Atlanta.</p>
            <Link to="/membership" className="btn-sidebar-membership">Join Our Membership</Link>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BlogPost;