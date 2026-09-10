import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const SingleArticle = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching article:', err));
  }, [slug]);

  if (loading) return <div>Loading article...</div>;
  if (!article) return <div>Article not found.</div>;

  return (
    <div className="article-container">
      <Link to="/blog">&larr; Back to all articles</Link>
      <h1>{article.title}</h1>
      <p className="meta">
        Published on {new Date(article.publishedAt).toLocaleDateString()}
      </p>

      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="article-hero-image"
        />
      )}
      
      <div 
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.content }} 
      />
    </div>
  );
};

export default SingleArticle;