import React, { useState } from 'react';
import '../Styles/Applicant.css';
import MembershipService from '../Services/membershipService';
import membershipService from '../Services/membershipService';

const Membership = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    industry: '',
    tier: 'Silver',
    connectionGoals: {
      socialSatisfaction: 5,
      primaryInterest: 'Meet New People',
      isolationBarrier: ''
    },
    preferences: {
      dietaryRestrictions: '',
      apparelSize: 'M',
      favoriteMocktail: '',
      golfSkillLevel: 'Never Played'
    },
    hasPassport: false
  });

  const [showPassword, setShowPassword] = useState(false);

  // Optimized handler for flat and nested schema objects
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [outer, inner] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [outer]: { ...prev[outer], [inner]: value }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mapping the dietaryRestrictions string to an array if needed by backend
      const submissionData = {
        ...formData,
        preferences: {
          ...formData.preferences,
          dietaryRestrictions: formData.preferences.dietaryRestrictions ? [formData.preferences.dietaryRestrictions] : []
        }
      };
      
      await membershipService.createMembership(submissionData);
      alert("Application Received. We look forward to exploring the world with you.");
      
      // Optional: Reset form or redirect
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Submission error. Please check your password strength and try again.";
      alert(errorMsg);
    }
  };

  return (
    <div className="membership-page">
      <header className="membership-hero">
        <div className="hero-content-right">
          <span className="location-tag">A Life of Joy</span>
          <h1 className="luxe-title">The <br/> Collective</h1>
          <div className="gold-spacer-bar"></div>
          <div className="mission-narrative">
            <p className="narrative-lead">Adventure is better when shared.</p>
            <p className="narrative-body">
              Adulthood shouldn't mean the end of play. The <strong>Grown Folks Collective</strong> is 
              centered around the pure joy of discovery and intentional <strong>connection</strong>.
            </p>
          </div>
        </div>
      </header>

      <section className="benefits-showcase">
        <h2 className="playfair section-title">Your Member Journey</h2>
        <div className="benefit-grid">
          <div className="benefit-item"><h3>Global Exploration</h3><p>Curated journeys focusing on fun and shared beauty.</p></div>
          <div className="benefit-item"><h3>Authentic Ties</h3><p>Real friendships through alcohol-free connection.</p></div>
          <div className="benefit-item"><h3>Dedicated Service</h3><p>Every interaction is an opportunity to serve you.</p></div>
        </div>
      </section>

      <section className="form-section">
        <div className="applicant-container">
          <h2 className="playfair">Request Membership</h2>
          <p className="form-intro">Let's start the conversation. We value your presence.</p>
          
          <form onSubmit={handleSubmit} className="luxe-form">
            {/* --- BASIC DEMOGRAPHICS --- */}
            <div className="form-row">
              <div className="input-group">
                <label>First Name</label>
                <input type="text" name="firstName" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" name="lastName" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" name="email" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Industry</label>
                <input type="text" name="industry" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Secure Password</label>
                <div style={{position: 'relative'}}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Min. 8 chars, 1 Uppercase, 1 Symbol"
                    onChange={handleChange} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{position: 'absolute', right: '10px', top: '25%', background: 'none', border: 'none', cursor: 'pointer'}}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
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

            {/* --- EXPERIENCE PROFILE (THE "QUESTIONS") --- */}
            <div className="form-divider" style={{margin: '30px 0 20px', borderBottom: '1px solid #d4af37', paddingBottom: '10px', color: '#d4af37', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px'}}>
              Experience Profile
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Primary Interest</label>
                <select name="connectionGoals.primaryInterest" onChange={handleChange}>
                  <option value="Meet New People">Meet New People</option>
                  <option value="Play/Games">Play/Games</option>
                  <option value="Travel">Travel</option>
                  <option value="Local Events">Local Events</option>
                </select>
              </div>
              <div className="input-group">
                <label>Golf Skill Level</label>
                <select name="preferences.golfSkillLevel" onChange={handleChange}>
                  <option value="Never Played">Never Played</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Apparel Size</label>
                <select name="preferences.apparelSize" onChange={handleChange}>
                  <option value="S">S</option><option value="M">M</option><option value="L">L</option>
                  <option value="XL">XL</option><option value="2XL">2XL</option><option value="3XL">3XL</option>
                </select>
              </div>
              <div className="input-group">
                <label>Favorite Mocktail / Flavor Profile</label>
                <input type="text" name="preferences.favoriteMocktail" placeholder="e.g. Ginger, Citrus, Botanical" onChange={handleChange} />
              </div>
            </div>

            <div className="input-group" style={{width: '100%', marginBottom: '20px'}}>
              <label>What is your biggest barrier to social connection lately?</label>
              <textarea 
                name="connectionGoals.isolationBarrier" 
                style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px'}}
                placeholder="e.g. Work-life balance, new to the city..." 
                onChange={handleChange}
              />
            </div>

            <div className="checkbox-group" style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
              <input type="checkbox" name="hasPassport" id="passport" onChange={handleChange} />
              <label htmlFor="passport" style={{fontSize: '0.9rem'}}>I have a valid passport for international adventures</label>
            </div>

            <button type="submit" className="gold-submit-btn">Apply to the Collective</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Membership;