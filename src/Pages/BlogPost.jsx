import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../Styles/BlogPost.css';

const API_BASE = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  "http://localhost:3000";

const CLOUDINARY_HERO_IMAGE = "https://res.cloudinary.com/vyarbhlp/image/upload/v1789087406/grown-folks-collective-group-photo-navygold.jpg";
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

  const displayImageUrl = article.imageUrl || CLOUDINARY_HERO_IMAGE;
  const imageAltText = article.imageAlt || "Grown Folks Collective members and attendees gathered together at Aromas Tea Bar for game night.";
  const imageCaptionText = article.imageCaption || "GFC members and attendees gathering for a group picture at game night at Aromas Tea Bar.";

  return (
    <div className="editorial-page">
      <div className="editorial-nav-bar">
        <Link to="/blog" className="editorial-back">← Back to Articles</Link>
      </div>

      <main className="editorial-container">
        <article>
          <h1 className="editorial-article-title">{article.title}</h1>

          <div className="article-meta-block">
            <span className="author-name">{authorDisplay}</span>
            <span className="meta-separator">&middot;</span>
            <span className="publish-date">{formattedDate}</span>
          </div>

          {/* Protected High-Res Hero Image & Caption */}
          <figure className="hero-image-wrap">
            <img 
              src={displayImageUrl} 
              alt={imageAltText} 
              className="editorial-hero-image"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <figcaption className="editorial-hero-caption">
              {imageCaptionText}
            </figcaption>
          </figure>

          {/* Article Body Content */}
          <div 
            className="editorial-body-content"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          {/* Full-Width Navy Banner */}
          <div className="editorial-cta-card">
            <h3>Pull Up a Chair</h3>
            <p>Ready to connect in person, join our community, or collaborate with us?</p>
            <div className="cta-actions">
              <Link to="/events" className="btn-cta-unified">Upcoming Events</Link>
              <Link to="/membership" className="btn-cta-unified">Join Membership</Link>
              <Link to="/partnerships" className="btn-cta-unified">Partner With Us</Link>
            </div>
          </div>

          {/* Centered Newsletter Signup */}
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