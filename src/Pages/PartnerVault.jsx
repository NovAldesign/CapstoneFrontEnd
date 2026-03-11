import React from 'react';
import loginService from '../Services/loginService.js';
import "../Styles/PartnershipVault.css";

const PartnerVault = () => {
  const user = loginService.getCurrentUser();

  // Mock data for the Vault's executive features
  const vaultData = {
    partnershipTier: user?.tier || "Gold Partner",
    activeCampaigns: 2,
    totalReferrals: 48,
    nextBriefing: "March 25, 2026",
    resources: [
      { id: 1, title: "GFC Branding Kit 2026", type: "PDF" },
      { id: 2, title: "Quarterly Impact Report", type: "Document" },
      { id: 3, title: "Event Sponsorship Deck", type: "PowerPoint" }
    ]
  };

  return (
    <div className="vault-wrapper">
      <header className="vault-header">
        <div className="security-badge">Secure Partner Access</div>
        <h1 className="playfair">The Partner Vault</h1>
        <p className="vault-subtitle">Executive resources for {user?.name || "our Valued Partner"}</p>
      </header>

      <div className="vault-grid">
        {/* Metric Cards */}
        <section className="metric-card">
          <span className="metric-label">Partnership Status</span>
          <div className="metric-value">{vaultData.partnershipTier}</div>
          <p className="metric-sub">Renewal Date: Jan 2027</p>
        </section>

        <section className="metric-card">
          <span className="metric-label">Community Referrals</span>
          <div className="metric-value">{vaultData.totalReferrals}</div>
          <p className="metric-sub">↑ 12% from last month</p>
        </section>

        {/* Resource Downloads */}
        <section className="vault-main-content">
          <h3 className="playfair">Partner Resource Library</h3>
          <div className="resource-list">
            {vaultData.resources.map(file => (
              <div key={file.id} className="resource-item">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <strong>{file.title}</strong>
                  <span>{file.type}</span>
                </div>
                <button className="download-btn">Access</button>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar/Action Area */}
        <aside className="vault-sidebar">
          <div className="briefing-box">
            <h4>Next Strategy Briefing</h4>
            <p>{vaultData.nextBriefing}</p>
            <button className="calendar-btn">Add to Calendar</button>
          </div>
          
          <div className="support-box">
            <h4>Partner Concierge</h4>
            <p>Need custom assets or event data?</p>
            <button className="contact-btn">Message Liaison</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PartnerVault;