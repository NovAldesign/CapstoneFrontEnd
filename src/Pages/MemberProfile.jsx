import React from "react";
import loginService from "../Services/loginService";
import "../Styles/MemberProfile.css";

const MemberProfile = () => {
  const user = loginService.getCurrentUser();

  // Fallback data if user info isn't fully populated yet
  const profileData = {
    tier: user?.tier || "Silver",
    memberSince: "2026",
    interests: ["Spades", "Networking", "Mocktails"],
    bio: "Passionate about building authentic community connections.",
    socialPassportId: `GFC-${user?.id?.substring(0, 6).toUpperCase() || "TEMP"}`,
  };

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <div className="passport-id">{profileData.socialPassportId}</div>
        <h1 className="playfair">Welcome, {user?.name}</h1>
        <p className="member-tagline">
          Grown Folks Collective • {profileData.tier} Member
        </p>
      </header>

      <main className="profile-grid">
        {/* Profile Card */}
        <section className="profile-card">
          <div className="tier-badge">{profileData.tier} Status</div>
          <div className="profile-info">
            <h3>Profile Summary</h3>
            <p>
              <strong>Email:</strong> {user?.email || "N/A"}
            </p>
            <p>
              <strong>Location:</strong> Atlanta, GA
            </p>
            <p>
              <strong>Member Since:</strong> {profileData.memberSince}
            </p>
          </div>
        </section>

        {/* Social Interests Section */}
        <section className="interests-card">
          <h3>Your Social Interests</h3>
          <p>We use these to match you at our curated dinners.</p>
          <div className="interest-tags">
            {profileData.interests.map((interest, index) => (
              <span key={index} className="tag">
                {interest}
              </span>
            ))}
          </div>
          <button className="edit-interests-btn">Update Interests</button>
        </section>

        {/* Connection Passport Stats */}
        <section className="stats-card">
          <h3>Connection Progress</h3>
          <div className="stat-item">
            <span>Events Attended</span>
            <div className="progress-bar">
              <div className="fill" style={{ width: "40%" }}></div>
            </div>
          </div>
          <p className="stat-note">
            Attend 3 more events to unlock Gold status!
          </p>
        </section>
        <section className="events-card">
          <h3>Your Upcoming Collective Events</h3>
          {reservations.length > 0 ? (
            <ul className="reservation-list">
              {reservations.map((event) => (
                <li key={event.id}>
                  <strong>{event.name}</strong> — {event.date}
                  <span className="status-confirmed">Confirmed</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No events joined yet.{" "}
              <Link to="/events">Find your next connection.</Link>
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default MemberProfile;
