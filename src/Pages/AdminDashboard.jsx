import React, { useState, useEffect } from 'react';
import { getAllMembership, deleteMembership, updateMembershipStatus } from '../Services/adminService';
import "../Styles/Admin.css";

const AdminDashboard = () => {
  const [membership, setMembership] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAllMembership();
      setMembership(data);
    } catch (err) { 
      console.error("Error loading data:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // Function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setIsUpdating(true);
    try {
      const updatedMember = await updateMembershipStatus(id, newStatus);
      setMembership(prev => prev.map(m => m._id === id ? updatedMember : m));
      setSelectedMember(updatedMember);
    } catch (err) { alert("Update failed"); } 
    finally { setIsUpdating(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this member from the GFC database?")) {
      try {
        await deleteMembership(id);
        setMembership(prev => prev.filter(item => item._id !== id));
        if (selectedMember?._id === id) setSelectedMember(null);
      } catch (err) { console.error(err); }
    }
  };

  if (loading) return <div className="admin-loading">Loading Executive Suite...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header-section">
        <h1 className="playfair">Executive Dashboard</h1>
        <p>Grown Folks Collective • Member Management</p>
      </div>

      <div className="admin-layout">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {membership.map((member) => (
                <tr key={member._id} className="admin-row">
                  <td className="clickable-name" onClick={() => setSelectedMember(member)}>
                    {member.firstName} {member.lastName}
                  </td>
                  <td>{member.industry}</td>
                  <td><span className={`tier-badge ${member.tier?.toLowerCase()}`}>{member.tier}</span></td>
                  <td><span className={`status-pill status-${member.status}`}>{member.status}</span></td>
                  <td>
                    <button onClick={() => handleDelete(member._id)} className="btn-delete">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedMember && (
          <div className="details-panel">
            <button className="close-btn" onClick={() => setSelectedMember(null)}>×</button>
            <h2 className="playfair">{selectedMember.firstName} {selectedMember.lastName}</h2>
            <p className="subtitle">{selectedMember.industry} Professional</p>
            <div className="gold-spacer-v2"></div>
            
            {/* 1. Demographics & Essential Contact */}
            <section className="detail-group contact-card">
              <h4 className="detail-heading">Member Identity</h4>
              <div className="demo-grid">
                <div className="detail-item"><label>Age</label> {calculateAge(selectedMember.dob)}</div>
                <div className="detail-item"><label>Gender</label> {selectedMember.gender || "Not specified"}</div>
              </div>
              <div className="detail-item"><label>Email</label> {selectedMember.email}</div>
              <div className="detail-item"><label>Phone</label> {selectedMember.phone}</div>
            </section>

            {/* 2. Connection Metrics */}
            <section className="detail-group">
              <h4 className="detail-heading">Community Profile</h4>
              <div className="detail-item">
                <label>Primary Interest</label> 
                {selectedMember.connectionGoals?.primaryInterest || "Networking"}
              </div>
              <div className="detail-item">
                <label>Founder Status</label> 
                {selectedMember.isFirstTimeFounder ? "First-Time Founder" : "Serial Entrepreneur"}
              </div>
            </section>

            {/* 3. Logistics */}
            <section className="detail-group">
              <h4 className="detail-heading">Event Logistics</h4>
              <div className="demo-grid">
                <div className="detail-item"><label>Shirt Size</label> {selectedMember.preferences?.apparelSize || "N/A"}</div>
                <div className="detail-item"><label>Passport</label> {selectedMember.hasPassport ? "Yes" : "No"}</div>
              </div>
              <div className="detail-item">
                <label>Dietary Restrictions</label>
                <div className="tag-container">
                  {selectedMember.preferences?.dietaryRestrictions?.length > 0 
                    ? selectedMember.preferences.dietaryRestrictions.map((d, i) => <span key={i} className="diet-tag">{d}</span>)
                    : "None"}
                </div>
              </div>
            </section>

            <div className="panel-actions">
              <button 
                className="gold-fill-btn" 
                disabled={selectedMember.status === 'accepted' || isUpdating}
                onClick={() => handleStatusUpdate(selectedMember._id, 'accepted')}
              >
                {isUpdating ? "Processing..." : "Approve Member"}
              </button>
              <button 
                className="outline-btn"
                disabled={selectedMember.status === 'waitlisted' || isUpdating}
                onClick={() => handleStatusUpdate(selectedMember._id, 'waitlisted')}
              >
                Waitlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;