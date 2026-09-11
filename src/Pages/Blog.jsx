import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Blog.css';

const API_BASE = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  "http://localhost:3000";

const FALLBACK_IMAGE = "https://res.cloudinary.com/vyarbhlp/image/upload/v1789087406/grown-folks-collective-group-photo-navygold.jpg";

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/articles`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load articles");
        return res.json();
      })
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching articles:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="blog-index-page">
      {/* Brand Header Section */}
      <header className="blog-header">
        <div className="blog-header-container">
          <h1 className="blog-main-title">The Gathering Table</h1>
          <p className="blog-subtitle">
            Notes on ending social isolation, one game night at a time — from the people building real community for grown folks in Atlanta.
          </p>
          <div className="blog-header-divider"></div>
        </div>
      </header>

      {/* Articles Container */}
      <main className="blog-container">
        {loading ? (
          <div className="blog-loading">Loading stories...</div>
        ) : articles.length === 0 ? (
          <div className="blog-empty">
            <h3>No articles published yet.</h3>
            <p>Check back soon for new stories from the table.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {articles.map((article, index) => {
              const formattedDate = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : '9/9/2026';

              // Strip HTML tags for clean snippet preview
              const cleanSnippet = article.excerpt || article.content?.replace(/<[^>]+>/g, '').substring(0, 160) + '...';

              return (
                <article 
                  key={article._id || article.slug || index} 
                  className={`blog-card ${index === 0 ? 'featured-card' : ''}`}
                >
                  <Link to={`/blog/${article.slug}`} className="blog-card-image-link">
                    <img 
                      src={article.featuredImage || FALLBACK_IMAGE} 
                      alt={article.title} 
                      className="blog-card-image"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </Link>
                  <div className="blog-card-content">
                    <span className="blog-card-date">{formattedDate}</span>
                    <h2 className="blog-card-title">
                      <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                    </h2>
                    <p className="blog-card-excerpt">{cleanSnippet}</p>
                    <Link to={`/blog/${article.slug}`} className="read-full-link">
                      Read Full Article →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;