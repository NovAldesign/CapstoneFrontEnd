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

  if (loading) return <div className="blog-post-page" style={{ padding: "80px 6vw", color: "#fff" }}>Loading article...</div>;
  if (!article) return <div className="blog-post-page" style={{ padding: "80px 6vw", color: "#fff" }}>Article not found.</div>;

  return (
    <div className="blog-post-page">
      <div className="article-container">
        <Link to="/blog" className="back-link">← Back to Articles</Link>

        <h1 className="article-title">{article.title}</h1>
        
        <p className="article-meta">
          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '9/9/2026'}
        </p>

        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="article-hero-image"
          />
        )}

        {/* Dangerously set HTML parses the raw <p> and <h3> tags */}
        <div 
          className="editorial-content"
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />
      </div>
    </div>
  );
};

export default BlogPost;