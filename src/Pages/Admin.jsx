import React, { useState, useEffect } from 'react';
import { getAllApplicants, deleteApplicant } from '../Services/adminService';
import "../Styles/Admin.css";

const Admin = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAllApplicants();
      setApplicants(data);
    } catch (err) { 
      console.error("Error loading data:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- Delete applicant ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this applicant from the Collective?")) {
      try {
        await deleteApplicant(id); // Call the API
        
        // Update the UI by filtering out the deleted applicant
        setApplicants(prev => prev.filter(app => app._id !== id));
        
        // If the deleted person was currently being viewed in the side panel, close it
        if (selectedApplicant?._id === id) {
          setSelectedApplicant(null);
        }
      } catch (err) {
        console.error("Failed to delete applicant:", err);
        alert("There was an error deleting the applicant.");
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading Dashboard...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header-section">
        <h1>Admin Dashboard</h1>
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
            {applicants.length > 0 ? (
              applicants.map((app) => (
                <tr key={app._id} className="admin-row">
                  <td className="clickable-name" onClick={() => setSelectedApplicant(app)}>
                    {app.name}
                  </td>
                  <td>{app.industry}</td>
                  <td>{app.tier}</td>
                  <td><span className={`status-${app.status}`}>{app.status}</span></td>
                  <td>
                    <button 
                      onClick={() => handleDelete(app._id)} 
                      className="btn-delete"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No applicants found.</td></tr>
            )}
          </tbody>
        </table>

        {selectedApplicant && (
          <div className="details-panel">
            <button className="close-btn" onClick={() => setSelectedApplicant(null)}>×</button>
            <h3>Applicant Profile</h3>
            <div className="detail-item"><label>Email:</label> {selectedApplicant.email}</div>
            <div className="detail-item"><label>DOB:</label> {new Date(selectedApplicant.dob).toLocaleDateString()}</div>
            <div className="detail-item"><label>Founder:</label> {selectedApplicant.isFirstTimeFounder ? "Yes" : "No"}</div>
            <div className="detail-item"><label>Tier:</label> {selectedApplicant.tier}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;