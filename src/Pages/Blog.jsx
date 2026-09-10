import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic API URL detection:
  // Uses VITE_API_BASE_URL if configured, otherwise falls back to local Express port 3000
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    fetch(`${API_BASE}/api/articles`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching articles:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [API_BASE]);

  if (loading) return <div className="blog-loading">Loading posts...</div>;
  if (error) return <div className="blog-error">Unable to load articles: {error}</div>;

  return (
    <div className="blog-container">
      <h1>Grown Folks Collective Blog</h1>

      {articles.length === 0 ? (
        <p className="no-articles">No articles published yet.</p>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <article key={article._id || article.slug} className="article-card">
              {article.imageUrl && (
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="article-card-image"
                />
              )}
              <h2>{article.title}</h2>
              <p className="date">
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}
              </p>
              <p>{article.excerpt}</p>
              <Link to={`/blog/${article.slug}`} className="read-more">
                Read Full Article
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;