import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  "http://localhost:3000";

const BlogPost = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="blog-loading">Loading article...</div>;
  if (error || !article) {
    return (
      <div className="blog-error">
        <h2>Article Not Found</h2>
        <p>We couldn't find the requested article.</p>
        <Link to="/blog">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <Link to="/blog" className="back-link">← Back to Articles</Link>
      
      <h1>{article.title}</h1>
      <p className="date">
        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}
      </p>

      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="blog-post-image"
        />
      )}

      <div className="blog-post-content">
        {article.content || article.body || article.excerpt}
      </div>
    </div>
  );
};

export default BlogPost;