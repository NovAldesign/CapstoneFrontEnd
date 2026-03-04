import React from "react";
import './Home.css';

import { Link } from "react-router-dom"; // Don't forget this import!

const Home = () => {
  return (
    <main className="home-wrapper"> 
      {/* Hero Section */}
      <div className="hero-content">
        <h1>
          More Than an Event. <span className="gold-text">A Connection.</span>
        </h1>
        <p>
          I'm hosting curated spaces for the 35+ community to break the cycle of
          social isolation. Come for the conversation, stay for the genuine
          friendships.
        </p>

        <div className="hero-btns">
          <Link to="/events" className="btn-gold">
            Find Your Next Connection
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <div className="icon"></div>
          <h3>Thought-Provoking</h3>
          <p>We skip the small talk. Our events are centered around deep, meaningful conversations that matter.</p>
        </div>
        <div className="feature-card">
          <div className="icon"></div>
          <h3>Genuine Friendship</h3>
          <p>In a world of digital noise, we provide a physical space to build real-life, lasting bonds.</p>
        </div>
        <div className="feature-card">
          <div className="icon"></div>
          <h3>Community-Led</h3>
          <p>I’m there at every event, ensuring every voice is heard and every guest feels welcome.</p>
        </div>
      </section>
      <section className="host-note">
  <div className="host-container">
    <div className="host-text">
      <h2 className="gold-text">A Note from Your Host</h2>
      <p>
        "I started the Grown Folks Collective because I saw too many 35+ entrepreneurs 
        crushing their business goals but feeling isolated in their personal lives. 
        I'm at every event because I believe the best business strategies start 
        with a genuine human connection. Let’s stop the scroll and start the conversation."
      </p>
      <p className="signature">— Founder, GFC</p>
    </div>
  </div>
</section>
    </main>
  );
};

export default Home;