import React, { useState } from 'react';
import '../Styles/Partnership.css';
import partnershipService from '../Services/partnershipService.js';

const Partnership = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    tierRequested: 'Title Sponsor',
    contributionType: 'Financial',
    contractStart: '',
    contractEnd: '',
    details: '',
    status: 'pending'
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Date validation
    if (new Date(formData.contractEnd) <= new Date(formData.contractStart)) {
      alert("Contract End Date must be after the Start Date.");
      return;
    }

    try {
      await partnershipService.createInquiry(formData);
      alert("Strategic Proposal Submitted. Thank you for joining the mission.");
      
      // Reset state
      setFormData({
        companyName: '',
        industry: '',
        contactPerson: '',
        email: '',
        phone: '',
        password: '',
        tierRequested: 'Title Sponsor',
        contributionType: 'Financial',
        contractStart: '',
        contractEnd: '',
        details: '',
        status: 'pending'
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Submission failed. Please check your password strength (8+ chars, Uppercase, Number, Symbol).";
      alert(errorMsg);
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
            Atlanta’s seasoned entrepreneurs and professionals are experiencing a profound lack of true community. 
            Partnership with the Collective is an active investment in <strong>Social Wellness.</strong> 
          </p>
          <p className="narrative-impact">
            By providing resources to host our alcohol-free sanctuaries, our partners help us turn "networking" back into <strong>belonging.</strong>
          </p>
        </div>
      </header>

      {/* ROI IMPACT STATS */}
      <section className="impact-stats-section">
        <div className="stats-grid">
          <div className="stat-card"><h4>35+</h4><p>High-earning demographic.</p></div>
          <div className="stat-card"><h4>$150k+</h4><p>Average household income.</p></div>
          <div className="stat-card"><h4>85%</h4><p>Member retention rate.</p></div>
          <div className="stat-card"><h4>0%</h4><p>Alcohol-focused events.</p></div>
        </div>
      </section>

      {/* STRATEGIC PROPOSAL FORM */}
      <section className="form-section">
        <div className="proposal-container">
          <h2 className="playfair">Initiate Proposal</h2>
          <p className="form-intro">Define the parameters of your alignment and create your partner portal account.</p>
          
          <form onSubmit={handleSubmit} className="luxe-form">
            <div className="form-divider">Company Information</div>
            <div className="form-row">
              <div className="input-group">
                <label>Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Industry</label>
                <input type="text" name="industry" value={formData.industry} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-divider">Primary Contact & Portal Security</div>
            <div className="form-row">
              <div className="input-group">
                <label>Contact Person Name</label>
                <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Contact Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Portal Email (Username)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Portal Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password}
                    placeholder="Min. 8 chars, 1 Uppercase, 1 Symbol"
                    onChange={handleChange} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '25%', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-divider">Partnership Logistics</div>
            <div className="form-row">
              <div className="input-group">
                <label>Partnership Tier</label>
                <select name="tierRequested" value={formData.tierRequested} onChange={handleChange}>
                  <option value="Founding Partner">Founding Partner</option>
                  <option value="Title Sponsor">Title Sponsor</option>
                  <option value="In-Kind Donor">In-Kind Donor</option>
                </select>
              </div>
              <div className="input-group">
                <label>Contribution Type</label>
                <select name="contributionType" value={formData.contributionType} onChange={handleChange}>
                  <option value="Financial">Financial</option>
                  <option value="Venue">Venue</option>
                  <option value="Service">Service</option>
                  <option value="Product">Product</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Contract Start Date</label>
                <input type="date" name="contractStart" value={formData.contractStart} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Contract End Date</label>
                <input type="date" name="contractEnd" value={formData.contractEnd} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group full-width">
              <label>Alignment Details</label>
              <textarea 
                name="details" 
                value={formData.details}
                placeholder="Briefly describe your goals for this alignment..." 
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

export default Partnership;