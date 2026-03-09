import React, { useState } from 'react';
import '../Styles/Applicant.css';
import applicantService from '../Services/applicantService';

const Applicant = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    tier: 'Silver',
    isFirstTimeFounder: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await applicantService.createApplicant(formData);
      alert("Application Received. We look forward to exploring the world with you.");
    } catch (err) {
      alert("Submission error. Please try again.");
    }
  };

  return (
    <div className="membership-page">
      {/* THE BOLD HEADER & NARRATIVE */}
     <header className="membership-hero">
  <div className="hero-content-right">
    <span className="location-tag">A Life of Joy</span>
    <h1 className="luxe-title">The <br/> Collective</h1>
    
    <div className="gold-spacer-bar"></div>
    
    <div className="mission-narrative">
      <p className="narrative-lead">
        Adventure is better when shared.
      </p>
      <p className="narrative-body">
        We believe that adulthood shouldn't mean the end of play. The <strong>Grown Folks Collective</strong> is 
        centered around the pure joy of discovery. From spontaneous games that spark laughter to 
        grand adventures in far-off lands, we create the space for you to truly <strong>connect</strong>.
      </p>
      <p className="narrative-impact">
        Experience a life of happiness through shared sunsets, local explorations, and the 
        thrill of new experiences. We aren't just traveling; we are reclaiming our sense of wonder, 
        together.
      </p>
    </div>
  </div>
</header>

      {/* THE BENEFITS (Focus on Connection & Fun) */}
      <section className="benefits-showcase">
        <h2 className="playfair section-title">Your Member Journey</h2>
        <div className="benefit-grid">
          <div className="benefit-item">
            <span className="gold-num"></span>
            <h3>Global Exploration</h3>
            <p>Travel is for the soul. We curate journeys that focus on fun, adventure, and seeing the beauty of the world together.</p>
          </div>
          <div className="benefit-item">
            <span className="gold-num"></span>
            <h3>Authentic Ties</h3>
            <p>Skip the business cards. We build real friendships through shared experiences and intentional, alcohol-free connection.</p>
          </div>
          <div className="benefit-item">
            <span className="gold-num"></span>
            <h3>Dedicated Service</h3>
            <p>Every interaction is an opportunity for us to serve you. You aren't just a member; you are part of the family.</p>
          </div>
        </div>
      </section>

      {/* THE INTAKE FORM */}
      <section className="form-section">
        <div className="applicant-container">
          <h2 className="playfair">Request Membership</h2>
          <p className="form-intro">Let's start the conversation. We value your presence.</p>
          
          <form onSubmit={handleSubmit} className="luxe-form">
            <div className="form-row">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="name" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" name="email" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Industry</label>
                <input type="text" name="industry" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Membership Tier</label>
                <select name="tier" onChange={handleChange}>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>

            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="founder"
                name="isFirstTimeFounder" 
                onChange={handleChange} 
              />
              <label htmlFor="founder">I am a first-time founder</label>
            </div>

            <button type="submit" className="gold-submit-btn">Apply to the Collective</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Applicant;