import React, { useState, useEffect } from 'react';
// Fixed the import name (was "getAllMembersship" with an extra 's')
import { getAllMembership, deleteMembership } from '../Services/adminService';
import "../Styles/Admin.css";

const Admin = () => {
  const [membership, setMembership] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null); // Synced name
  const [loading, setLoading] = useState(true);

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

  // --- Delete applicant/member ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this record from the Collective?")) {
      try {
        await deleteMembership(id);
        
        // Update the UI
        setMembership(prev => prev.filter(item => item._id !== id));
        
        // Clear side panel if deleted item was selected
        if (selectedMember?._id === id) {
          setSelectedMember(null);
        }
      } catch (err) {
        console.error("Failed to delete record:", err);
        alert("There was an error deleting the record.");
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading Dashboard...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header-section">
        <h1 className="playfair">Executive Dashboard</h1>
        <p>Managing the 35+ Professional Collective</p>
      </div>

      <div className="admin-layout">
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
            {membership.length > 0 ? (
              membership.map((member) => (
                <tr key={member._id} className="admin-row">
                  <td 
                    className="clickable-name" 
                    onClick={() => setSelectedMember(member)}
                  >
                    {member.firstName} {member.lastName}
                  </td>
                  <td>{member.industry}</td>
                  <td>{member.tier}</td>
                  <td>
                    <span className={`status-${member.status.toLowerCase()}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(member._id)} 
                      className="btn-delete"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  No members or applicants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* SIDE DETAILS PANEL */}
        {selectedMember && (
          <div className="details-panel">
            <button className="close-btn" onClick={() => setSelectedMember(null)}>×</button>
            <h3 className="playfair">Profile Detail</h3>
            <div className="gold-spacer-v2" style={{ margin: '10px 0' }}></div>
            
            <div className="detail-item"><label>Email:</label> {selectedMember.email}</div>
            <div className="detail-item"><label>Phone:</label> {selectedMember.phone}</div>
            <div className="detail-item">
              <label>DOB:</label> {new Date(selectedMember.dob).toLocaleDateString()}
            </div>
            <div className="detail-item">
              <label>Founder:</label> {selectedMember.isFirstTimeFounder ? "Yes" : "No"}
            </div>
            <div className="detail-item"><label>Tier:</label> {selectedMember.tier}</div>
            
            {/* Added a status toggle for quick admin actions */}
            <div className="panel-actions">
              <button className="gold-fill-btn" style={{ fontSize: '0.8rem', marginTop: '20px' }}>
                Update Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;