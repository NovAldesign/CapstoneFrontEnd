import React, { useState, useEffect } from 'react';
import { getAllMembership, deleteMembership, updateMembershipStatus } from '../Services/adminService';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../Services/eventService';
import "../Styles/Admin.css";

const EMPTY_TICKET = { name: '', price: 0, quantity: 0, description: '' };
const EMPTY_PROMO  = { code: '', discountType: 'percent', discountValue: 0, maxUses: '', expiresAt: '', active: true };

const EMPTY_FORM = {
  name:            '',
  description:     '',
  date:            '',
  endDate:         '',
  locationName:    '',
  locationAddress: '',
  locationCity:    'Atlanta',
  locationState:   'GA',
  capacity:        36,
  status:          'published',
  eventType:       'Other',
  isFree:          false,
  featuredSponsor: '',
};

const EVENT_TYPES = [
  'Game Night', 'Spades Tournament', 'Luxury Bingo',
  'Intentional Conversations Over Dinner', 'Social Mixer',
  'Group Travel', 'Other',
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab]           = useState('members');
  const [membership, setMembership]         = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [isUpdating, setIsUpdating]         = useState(false);

  const [events, setEvents]           = useState([]);
  const [eventForm, setEventForm]     = useState(EMPTY_FORM);
  const [ticketTypes, setTicketTypes] = useState([{ ...EMPTY_TICKET }]);
  const [promoCodes, setPromoCodes]   = useState([]);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [memberData, eventData] = await Promise.all([
        getAllMembership(), getAllEvents()
      ]);
      setMembership(memberData);
      setEvents(eventData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Members (unchanged) ─────────────────────────────
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setIsUpdating(true);
    try {
      const updated = await updateMembershipStatus(id, newStatus);
      setMembership(prev => prev.map(m => m._id === id ? updated : m));
      setSelectedMember(updated);
    } catch { alert("Update failed"); }
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

  // ── Event helpers ───────────────────────────────────
  const resetEventForm = () => {
    setEventForm(EMPTY_FORM);
    setTicketTypes([{ ...EMPTY_TICKET }]);
    setPromoCodes([]);
    setImageFile(null);
    setImagePreview(null);
    setEditingEvent(null);
  };

  const handleEventFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Ticket type handlers
  const updateTicket = (i, field, value) =>
    setTicketTypes(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  const addTicket    = () => setTicketTypes(prev => [...prev, { ...EMPTY_TICKET }]);
  const removeTicket = (i) => setTicketTypes(prev => prev.filter((_, idx) => idx !== i));

  // Promo code handlers
  const updatePromo  = (i, field, value) =>
    setPromoCodes(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  const addPromo     = () => setPromoCodes(prev => [...prev, { ...EMPTY_PROMO }]);
  const removePromo  = (i) => setPromoCodes(prev => prev.filter((_, idx) => idx !== i));

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      name:            event.name,
      description:     event.description,
      date:            event.date?.slice(0, 16),
      endDate:         event.endDate?.slice(0, 16),
      locationName:    event.location?.name || '',
      locationAddress: event.location?.address || '',
      locationCity:    event.location?.city || 'Atlanta',
      locationState:   event.location?.state || 'GA',
      capacity:        event.capacity,
      status:          event.status,
      eventType:       event.eventType,
      isFree:          event.isFree,
      featuredSponsor: event.featuredSponsor || '',
    });
    setTicketTypes(event.ticketTypes?.length ? event.ticketTypes : [{ ...EMPTY_TICKET }]);
    setPromoCodes(event.promoCodes || []);
    setImagePreview(event.coverImage ? `${process.env.REACT_APP_API_URL}${event.coverImage}` : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setEventLoading(true);
    try {
      const formData = new FormData();

      // Flat fields
      formData.append('name',            eventForm.name);
      formData.append('description',     eventForm.description);
      formData.append('date',            eventForm.date);
      formData.append('endDate',         eventForm.endDate);
      formData.append('capacity',        eventForm.capacity);
      formData.append('status',          eventForm.status);
      formData.append('eventType',       eventForm.eventType);
      formData.append('isFree',          eventForm.isFree);
      formData.append('featuredSponsor', eventForm.featuredSponsor);

      // Nested objects as JSON strings
      formData.append('location', JSON.stringify({
        name:    eventForm.locationName,
        address: eventForm.locationAddress,
        city:    eventForm.locationCity,
        state:   eventForm.locationState,
      }));
      formData.append('ticketTypes', JSON.stringify(ticketTypes));
      formData.append('promoCodes',  JSON.stringify(promoCodes));

      if (imageFile) formData.append('coverImage', imageFile);

      if (editingEvent) {
        const updated = await updateEvent(editingEvent._id, formData);
        setEvents(prev => prev.map(ev => ev._id === editingEvent._id ? updated : ev));
      } else {
        const created = await createEvent(formData);
        setEvents(prev => [...prev, created]);
      }
      resetEventForm();
    } catch (err) {
      alert("Failed to save event");
      console.error(err);
    } finally { setEventLoading(false); }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Delete this event permanently?")) {
      try {
        await deleteEvent(id);
        setEvents(prev => prev.filter(ev => ev._id !== id));
        if (editingEvent?._id === id) resetEventForm();
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

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
        <button className={`admin-tab ${activeTab === 'events'  ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
      </div>

      {/* ── MEMBERS TAB (unchanged) ── */}
      {activeTab === 'members' && (
        <div className="admin-layout">
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Industry</th><th>Tier</th><th>Status</th><th>Actions</th></tr>
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
                    <td><button onClick={() => handleDelete(member._id)} className="btn-delete">Remove</button></td>
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
              <section className="detail-group contact-card">
                <h4 className="detail-heading">Member Identity</h4>
                <div className="demo-grid">
                  <div className="detail-item"><label>Age</label> {calculateAge(selectedMember.dob)}</div>
                  <div className="detail-item"><label>Gender</label> {selectedMember.gender || "Not specified"}</div>
                </div>
                <div className="detail-item"><label>Email</label> {selectedMember.email}</div>
                <div className="detail-item"><label>Phone</label> {selectedMember.phone}</div>
              </section>
              <section className="detail-group">
                <h4 className="detail-heading">Community Profile</h4>
                <div className="detail-item"><label>Primary Interest</label> {selectedMember.connectionGoals?.primaryInterest || "Networking"}</div>
                <div className="detail-item"><label>Founder Status</label> {selectedMember.isFirstTimeFounder ? "First-Time Founder" : "Serial Entrepreneur"}</div>
              </section>
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
                <button className="gold-fill-btn" disabled={selectedMember.status === 'accepted' || isUpdating} onClick={() => handleStatusUpdate(selectedMember._id, 'accepted')}>
                  {isUpdating ? "Processing..." : "Approve Member"}
                </button>
                <button className="waitlist-action-btn" disabled={selectedMember.status === 'waitlisted' || isUpdating} onClick={() => handleStatusUpdate(selectedMember._id, 'waitlisted')}>
                  {isUpdating ? "Processing..." : "Waitlist"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EVENTS TAB ── */}
      {activeTab === 'events' && (
        <div className="admin-layout">
          <div className="event-form-panel">
            <h3 className="playfair">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
            <div className="gold-spacer-v2"></div>
            <form onSubmit={handleEventSubmit} className="event-form">

              {/* Core info */}
              <div className="form-group">
                <label>Event Name *</label>
                <input name="name" value={eventForm.name} onChange={handleEventFormChange} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" value={eventForm.description} onChange={handleEventFormChange} rows={4} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date & Time *</label>
                  <input type="datetime-local" name="date" value={eventForm.date} onChange={handleEventFormChange} required />
                </div>
                <div className="form-group">
                  <label>End Date & Time *</label>
                  <input type="datetime-local" name="endDate" value={eventForm.endDate} onChange={handleEventFormChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Event Type</label>
                  <select name="eventType" value={eventForm.eventType} onChange={handleEventFormChange}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={eventForm.status} onChange={handleEventFormChange}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <h4 className="form-section-heading">Location</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Venue Name *</label>
                  <input name="locationName" value={eventForm.locationName} onChange={handleEventFormChange} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input name="locationAddress" value={eventForm.locationAddress} onChange={handleEventFormChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input name="locationCity" value={eventForm.locationCity} onChange={handleEventFormChange} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input name="locationState" value={eventForm.locationState} onChange={handleEventFormChange} />
                </div>
              </div>

              {/* Ticket Types */}
              <h4 className="form-section-heading">
                Ticket Types
                <button type="button" className="add-row-btn" onClick={addTicket}>+ Add Ticket</button>
              </h4>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isFree" checked={eventForm.isFree} onChange={handleEventFormChange} />
                  This is a free event
                </label>
              </div>
              {ticketTypes.map((ticket, i) => (
                <div key={i} className="sub-card">
                  <div className="sub-card-header">
                    <span>Ticket {i + 1}</span>
                    {ticketTypes.length > 1 && (
                      <button type="button" className="remove-row-btn" onClick={() => removeTicket(i)}>Remove</button>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name</label>
                      <input value={ticket.name} onChange={e => updateTicket(i, 'name', e.target.value)} placeholder="General Admission" />
                    </div>
                    <div className="form-group">
                      <label>Price (cents — 5000 = $50)</label>
                      <input type="number" value={ticket.price} onChange={e => updateTicket(i, 'price', Number(e.target.value))} min="0" disabled={eventForm.isFree} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" value={ticket.quantity} onChange={e => updateTicket(i, 'quantity', Number(e.target.value))} min="0" />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input value={ticket.description} onChange={e => updateTicket(i, 'description', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Codes */}
              <h4 className="form-section-heading">
                Promo Codes
                <button type="button" className="add-row-btn" onClick={addPromo}>+ Add Code</button>
              </h4>
              {promoCodes.length === 0 && (
                <p className="empty-hint">No promo codes yet.</p>
              )}
              {promoCodes.map((promo, i) => (
                <div key={i} className="sub-card">
                  <div className="sub-card-header">
                    <span>Promo {i + 1}</span>
                    <button type="button" className="remove-row-btn" onClick={() => removePromo(i)}>Remove</button>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Code</label>
                      <input value={promo.code} onChange={e => updatePromo(i, 'code', e.target.value.toUpperCase())} placeholder="GFCVIP" />
                    </div>
                    <div className="form-group">
                      <label>Discount Type</label>
                      <select value={promo.discountType} onChange={e => updatePromo(i, 'discountType', e.target.value)}>
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed ($)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Discount Value</label>
                      <input type="number" value={promo.discountValue} onChange={e => updatePromo(i, 'discountValue', Number(e.target.value))} min="0" />
                    </div>
                    <div className="form-group">
                      <label>Max Uses (blank = unlimited)</label>
                      <input type="number" value={promo.maxUses} onChange={e => updatePromo(i, 'maxUses', e.target.value)} min="0" placeholder="Unlimited" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expires At</label>
                      <input type="datetime-local" value={promo.expiresAt} onChange={e => updatePromo(i, 'expiresAt', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ justifyContent: 'flex-end', paddingTop: '1.5rem' }}>
                      <label className="checkbox-label">
                        <input type="checkbox" checked={promo.active} onChange={e => updatePromo(i, 'active', e.target.checked)} />
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {/* Misc */}
              <h4 className="form-section-heading">Additional Details</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" name="capacity" value={eventForm.capacity} onChange={handleEventFormChange} min="1" />
                </div>
                <div className="form-group">
                  <label>Featured Sponsor</label>
                  <input name="featuredSponsor" value={eventForm.featuredSponsor} onChange={handleEventFormChange} placeholder="Optional" />
                </div>
              </div>
              <div className="form-group">
                <label>Cover Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
              </div>

              <div className="form-actions">
                <button type="submit" className="gold-fill-btn" disabled={eventLoading}>
                  {eventLoading ? 'Saving...' : editingEvent ? 'Update Event' : 'Publish Event'}
                </button>
                {editingEvent && (
                  <button type="button" className="waitlist-action-btn" onClick={resetEventForm}>Cancel Edit</button>
                )}
              </div>
            </form>
          </div>

          {/* Events table */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Type</th><th>Date</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No events yet</td></tr>
                )}
                {events.map(ev => (
                  <tr key={ev._id} className="admin-row">
                    <td>{ev.name}</td>
                    <td>{ev.eventType}</td>
                    <td>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>{ev.totalSold ?? 0} / {ev.capacity}</td>
                    <td><span className={`status-pill status-${ev.status}`}>{ev.status}</span></td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="waitlist-action-btn" onClick={() => handleEditEvent(ev)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteEvent(ev._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;