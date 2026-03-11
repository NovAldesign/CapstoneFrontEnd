import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Membership.css';
import membershipService from '../Services/membershipService';

const Membership = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    industry: '',
    tier: 'Silver',
    securityQuestion: "What was the name of your first pet?",
    securityAnswer: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    // Handling nested objects (connectionGoals and preferences)
    if (name.includes('.')) {
      const [outer, inner] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [outer]: { ...prev[outer], [inner]: val }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Transforming dietary restrictions into an array for the backend schema
      const submissionData = {
        ...formData,
        preferences: {
          ...formData.preferences,
          dietaryRestrictions: formData.preferences.dietaryRestrictions 
            ? formData.preferences.dietaryRestrictions.split(',').map(s => s.trim()) 
            : []
        }
      };

      await membershipService.createMembership(submissionData);
      
      alert("Application Received. Your journey with the Collective begins now.");
      navigate('/login'); 
      
    } catch (err) {
      // Detailed error logging to help you debug in the browser console
      console.error("Submission Error Details:", err.response?.data);
      const errorMsg = err.response?.data?.error || "Submission error. Please check your details.";
      alert(`Entry Refined: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="membership-page">
      {/* HERO SECTION */}
      <header className="membership-hero">
        <div className="hero-content-right">
          <span className="location-tag">A Life of Joy & Adventure</span>
          <h1 className="luxe-title">The <br/> Collective</h1>
          <div className="gold-spacer-bar"></div>
          <div className="mission-narrative">
            <p className="narrative-lead">Success shouldn't be a solo journey.</p>
            <p className="narrative-body">
              The <strong>Grown Folks Collective</strong> is centered around 
              authentic connection and ending social isolation.
            </p>
            <p className="narrative-impact">
              Join a collective where excellence meets genuine connection.
            </p>
          </div>
        </div>
      </header>

      {/* FORM SECTION */}
      <section className="form-section">
        <div className="applicant-container">
          <h2 className="section-header-font">Request Membership</h2>
          <p className="form-intro-font">Let's start the conversation.</p>
          
          <form onSubmit={handleSubmit} className="luxe-form">
            {/* Identity Group */}
            <div className="form-row">
              <div className="input-group">
                <label className="label-font">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label className="label-font">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label className="label-font">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label className="label-font">Industry</label>
                <input type="text" name="industry" value={formData.industry} onChange={handleChange} required />
              </div>
            </div>

            {/* Security Group */}
            <div className="form-divider-font">Account Security</div>
            <div className="form-row">
              <div className="input-group">
                <label className="label-font">Secure Password</label>
                <div className="password-input-container">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-text"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="label-font">Membership Tier</label>
                <select name="tier" value={formData.tier} onChange={handleChange}>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="label-font">Security Question</label>
                <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange} required>
                  <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                  <option value="What city did you meet your best friend in?">What city did you meet your best friend in?</option>
                  <option value="What was your favorite childhood board game?">What was your favorite childhood board game?</option>
                  <option value="What was the make of your first car?">What was the make of your first car?</option>
                </select>
              </div>
              <div className="input-group">
                <label className="label-font">Security Answer</label>
                <input type="text" name="securityAnswer" value={formData.securityAnswer} onChange={handleChange} required />
              </div>
            </div>

            {/* Experience Group */}
            <div className="form-divider-font">Experience Profile</div>
            <div className="form-row">
              <div className="input-group">
                <label className="label-font">Primary Interest</label>
                <select name="connectionGoals.primaryInterest" value={formData.connectionGoals.primaryInterest} onChange={handleChange}>
                  <option value="Meet New People">Meet New People</option>
                  <option value="Play/Games">Play/Games</option>
                  <option value="Travel">Travel</option>
                  <option value="Local Events">Local Events</option>
                </select>
              </div>
              <div className="input-group">
                <label className="label-font">Golf Skill Level</label>
                <select name="preferences.golfSkillLevel" value={formData.preferences.golfSkillLevel} onChange={handleChange}>
                  <option value="Never Played">Never Played</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Preferences Group */}
            <div className="form-divider-font">Preferences & Travel</div>
            <div className="form-row">
              <div className="input-group">
                <label className="label-font">Favorite Mocktail</label>
                <input type="text" name="preferences.favoriteMocktail" value={formData.preferences.favoriteMocktail} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="label-font">Apparel Size</label>
                <select name="preferences.apparelSize" value={formData.preferences.apparelSize} onChange={handleChange}>
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="label-font">Dietary Restrictions (Comma separated)</label>
              <input 
                type="text" 
                name="preferences.dietaryRestrictions" 
                value={formData.preferences.dietaryRestrictions} 
                onChange={handleChange} 
                placeholder="e.g. Vegan, No Shellfish" 
              />
            </div>

            <div className="input-group">
              <label className="label-font">What is your biggest barrier to social connection lately?</label>
              <textarea 
                name="connectionGoals.isolationBarrier" 
                className="luxe-textarea"
                value={formData.connectionGoals.isolationBarrier}
                onChange={handleChange}
                placeholder="Share your story..."
              />
            </div>

            <div className="checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                name="hasPassport" 
                id="passport" 
                checked={formData.hasPassport} 
                onChange={handleChange} 
              />
              <label htmlFor="passport" className="label-font" style={{ marginBottom: 0 }}>
                I have a valid passport
              </label>
            </div>

            <button type="submit" className="gold-submit-btn-font gold-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Processing Application..." : "Apply to the Collective"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Membership;