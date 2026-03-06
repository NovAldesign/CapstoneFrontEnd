import React, { useState } from 'react';
import '../Styles/Partnership.css';
import partnershipService from '../Services/partnershipService.js';

const Partnership = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    tierRequested: 'Founding Partner',
    contributionType: 'Financial',
    details: '',
    missionAligned: true,
    contractStart: '',
    contractEnd: '',
    status: 'pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await partnershipService.createInquiry(formData);
      alert("Strategic Proposal Submitted. Thank you for joining the mission.");
    } catch (err) {
      alert("Submission failed. Please check your connection and dates.");
    }
  };

  return (
    <div className="partnership-page">
      {/* HEADER & NARRATIVE */}
      <header className="partner-hero">
        <span className="location-tag">Atlanta & Surrounding Cities</span>
        <h1 className="playfair luxe-title">Strategic <br/> Alignment</h1>
        
        <div className="gold-spacer-bar"></div>
        
        <div className="mission-narrative">
          <p className="narrative-lead">
            For the 35+ professional, success often comes at a silent cost: <strong>Social Isolation.</strong> 
          </p>
          <p className="narrative-body">
            Despite being more "connected" than ever, Atlanta’s seasoned entrepreneurs and professionals are 
            experiencing a profound lack of true community. This "Quiet Epidemic" of loneliness directly 
            impacts mental health, professional longevity, and personal joy. 
          </p>
          <p className="narrative-impact">
            Partnership with the Collective is an active investment in <strong>Social Wellness. </strong> 
            By providing the venues and resources required to host our alcohol-free sanctuaries, our 
            partners help us turn "networking" back into <strong>belonging.</strong>
          </p>
        </div>
      </header>

      {/* SECTION 2: THE ROI IMPACT STATS */}
      <section className="impact-stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h4>35+</h4>
            <p>Targeted age demographic of high-earning professionals.</p>
          </div>
          <div className="stat-card">
            <h4>$150k+</h4>
            <p>Average household income of our core membership base.</p>
          </div>
          <div className="stat-card">
            <h4>85%</h4>
            <p>Member retention rate, ensuring long-term brand familiarity.</p>
          </div>
          <div className="stat-card">
            <h4>0%</h4>
            <p>Alcohol-focused events, ensuring high-clarity professional engagement.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE THREE TIERS */}
      <section className="tier-showcase">
        <h2 className="playfair section-title">Partnership Tiers</h2>
        <div className="tier-grid">
          <div className="tier-item">
            <span className="tier-label">Tier I</span>
            <h3>Founding Partner</h3>
            <p>The highest level of alignment. Shaping the future of the Collective as a cornerstone of our community.</p>
          </div>
          <div className="tier-item">
            <span className="tier-label">Tier II</span>
            <h3>Title Sponsor</h3>
            <p>Directly power our monthly experiences and gain high-impact visibility among our vetted 35+ professionals.</p>
          </div>
          <div className="tier-item">
            <span className="tier-label">Tier III</span>
            <h3>In-Kind Donor</h3>
            <p>Provide the sanctuary or the service. We welcome venue partners and luxury service providers.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE STRATEGIC PROPOSAL FORM */}
      <section className="form-section">
        <div className="proposal-container">
          <h2 className="playfair">Initiate Proposal</h2>
          <p className="form-intro">Define the parameters of your alignment with the Collective.</p>
          
          <form onSubmit={handleSubmit} className="luxe-form">
            <div className="form-row">
              <div className="input-group">
                <label>Company Name</label>
                <input type="text" name="companyName" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Industry</label>
                <input type="text" name="industry" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Tier Requested</label>
                <select name="tierRequested" onChange={handleChange}>
                  <option value="Founding Partner">Founding Partner</option>
                  <option value="Title Sponsor">Title Sponsor</option>
                  <option value="In-Kind Donor">In-Kind Donor</option>
                </select>
              </div>
              <div className="input-group">
                <label>Contribution Type</label>
                <select name="contributionType" onChange={handleChange}>
                  <option value="Financial">Financial</option>
                  <option value="Venue">Venue</option>
                  <option value="Service">Service</option>
                  <option value="Product">Product</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Contract Start</label>
                <input type="date" name="contractStart" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Contract End</label>
                <input type="date" name="contractEnd" onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group full-width">
              <label>Alignment Details</label>
              <textarea 
                name="details" 
                placeholder="How does your mission meet ours?" 
                onChange={handleChange} 
                required 
              />
            </div>

            <button type="submit" className="gold-submit-btn">Submit Strategic Proposal</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Partnership