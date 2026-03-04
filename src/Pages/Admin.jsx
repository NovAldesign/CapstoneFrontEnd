import React, { useState, useEffect } from 'react';
import { getAllApplicants, deleteApplicant } from '../Services/adminService';
import "../Styles/Admin.css";

const Admin = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null); // For details view
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAllApplicants();
      setApplicants(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

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
            {applicants.map((app) => (
              <tr key={app._id} className="admin-row">
                <td className="clickable-name" onClick={() => setSelectedApplicant(app)}>
                  {app.name}
                </td>
                <td>{app.industry}</td>
                <td>{app.tier}</td>
                <td><span className={`status-${app.status}`}>{app.status}</span></td>
                <td>
                  <button onClick={() => handleDelete(app._id)} className="btn-delete">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* DETAILS PANEL: Only shows when a name is clicked */}
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