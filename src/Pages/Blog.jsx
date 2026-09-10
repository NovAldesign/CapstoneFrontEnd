import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching articles:', err));
  }, []);

  if (loading) return <div>Loading posts...</div>;

  return (
    <div className="blog-container">
      <h1>Grown Folks Collective Journal</h1>
      <div className="articles-grid">
        {articles.map((article) => (
          <article key={article._id} className="article-card">
            {article.imageUrl && (
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="article-card-image"
              />
            )}
            <h2>{article.title}</h2>
            <p className="date">
              {new Date(article.publishedAt).toLocaleDateString()}
            </p>
            <p>{article.excerpt}</p>
            <Link to={`/blog/${article.slug}`} className="read-more">
              Read Full Article
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;