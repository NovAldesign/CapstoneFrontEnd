import React, { useState, useEffect, useMemo } from 'react';
import { getAllMembership, deleteMembership, updateMembershipStatus } from '../Services/adminService';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../Services/eventService';
import "../Styles/Admin.css";

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const EMPTY_TICKET = { name: '', price: 0, quantity: 0, description: '' };
const EMPTY_PROMO  = { code: '', discountType: 'percent', discountValue: 0, maxUses: '', expiresAt: '', active: true };

const EMPTY_FORM = {
  name: '', description: '', date: '', endDate: '',
  locationName: '', locationAddress: '', locationCity: 'Atlanta', locationState: 'GA',
  capacity: 36, status: 'published', eventType: 'Other', isFree: false, featuredSponsor: '',
};

const EVENT_TYPES = [
  'Game Night', 'Spades Tournament', 'Luxury Bingo',
  'Intentional Conversations Over Dinner', 'Social Mixer', 'Group Travel', 'Other',
];

// ── CSV Export Utility ──────────────────────────────────────────────────────
const exportToCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h] ?? '';
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div className="stat-card" style={{ '--accent': accent || 'var(--gold)' }}>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

// ── Mini Badge ──────────────────────────────────────────────────────────────
const Badge = ({ text, type }) => (
  <span className={`status-pill status-${type}`}>{text}</span>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab]           = useState('overview');
  const [membership, setMembership]         = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [isUpdating, setIsUpdating]         = useState(false);
  const [memberSearch, setMemberSearch]     = useState('');
  const [memberFilter, setMemberFilter]     = useState('all');

  const [events, setEvents]             = useState([]);
  const [eventForm, setEventForm]       = useState(EMPTY_FORM);
  const [ticketTypes, setTicketTypes]   = useState([{ ...EMPTY_TICKET }]);
  const [promoCodes, setPromoCodes]     = useState([]);
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventSearch, setEventSearch]   = useState('');

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

  // ── Computed Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalMembers    = membership.length;
    const activeMembers   = membership.filter(m => m.status === 'accepted').length;
    const waitlisted      = membership.filter(m => m.status === 'waitlisted').length;
    const pending         = membership.filter(m => m.status === 'pending').length;

    const totalEvents     = events.length;
    const publishedEvents = events.filter(e => e.status === 'published').length;
    const totalCapacity   = events.reduce((a, e) => a + (e.capacity || 0), 0);
    const totalSold       = events.reduce((a, e) => a + (e.totalSold || 0), 0);

    const totalRevenue    = events.reduce((a, e) => {
      const eventRev = (e.ticketTypes || []).reduce((ta, t) => {
        const sold = Math.min(t.quantity || 0, e.totalSold || 0);
        return ta + (sold * (t.price || 0));
      }, 0);
      return a + eventRev;
    }, 0);

    const fillRate = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

    // Member industry breakdown
    const industries = membership.reduce((acc, m) => {
      const ind = m.industry || 'Unknown';
      acc[ind] = (acc[ind] || 0) + 1;
      return acc;
    }, {});
    const topIndustry = Object.entries(industries).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    // Recent signups (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentSignups = membership.filter(m => new Date(m.createdAt) > thirtyDaysAgo).length;

    return {
      totalMembers, activeMembers, waitlisted, pending,
      totalEvents, publishedEvents, totalCapacity, totalSold,
      totalRevenue, fillRate, topIndustry, recentSignups, industries,
    };
  }, [membership, events]);

  // ── Filtered Members ────────────────────────────────────────────────────
  const filteredMembers = useMemo(() => {
    return membership.filter(m => {
      const matchSearch = memberSearch === '' ||
        `${m.firstName} ${m.lastName} ${m.email} ${m.industry}`.toLowerCase().includes(memberSearch.toLowerCase());
      const matchFilter = memberFilter === 'all' || m.status === memberFilter;
      return matchSearch && matchFilter;
    });
  }, [membership, memberSearch, memberFilter]);

  // ── Filtered Events ─────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    return events.filter(e =>
      eventSearch === '' ||
      e.name?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.eventType?.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [events, eventSearch]);

  // ── Members ─────────────────────────────────────────────────────────────
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    return Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
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

  const exportMembers = () => {
    const data = filteredMembers.map(m => ({
      'First Name': m.firstName,
      'Last Name': m.lastName,
      'Email': m.email,
      'Phone': m.phone || '',
      'Industry': m.industry || '',
      'Tier': m.tier || '',
      'Status': m.status,
      'Age': calculateAge(m.dob),
      'Gender': m.gender || '',
      'Passport': m.hasPassport ? 'Yes' : 'No',
      'Shirt Size': m.preferences?.apparelSize || '',
      'Dietary': (m.preferences?.dietaryRestrictions || []).join('; '),
      'Joined': m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
    }));
    exportToCSV(data, `gfc-members-${new Date().toISOString().slice(0,10)}.csv`);
  };

  // ── Events ──────────────────────────────────────────────────────────────
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

  const updateTicket = (i, field, value) =>
    setTicketTypes(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  const addTicket    = () => setTicketTypes(prev => [...prev, { ...EMPTY_TICKET }]);
  const removeTicket = (i) => setTicketTypes(prev => prev.filter((_, idx) => idx !== i));

  const updatePromo  = (i, field, value) =>
    setPromoCodes(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  const addPromo     = () => setPromoCodes(prev => [...prev, { ...EMPTY_PROMO }]);
  const removePromo  = (i) => setPromoCodes(prev => prev.filter((_, idx) => idx !== i));

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setActiveTab('create-event');
    setEventForm({
      name: event.name, description: event.description,
      date: event.date?.slice(0, 16), endDate: event.endDate?.slice(0, 16),
      locationName: event.location?.name || '',
      locationAddress: event.location?.address || '',
      locationCity: event.location?.city || 'Atlanta',
      locationState: event.location?.state || 'GA',
      capacity: event.capacity, status: event.status,
      eventType: event.eventType, isFree: event.isFree,
      featuredSponsor: event.featuredSponsor || '',
    });
    setTicketTypes(event.ticketTypes?.length ? event.ticketTypes : [{ ...EMPTY_TICKET }]);
    setPromoCodes(event.promoCodes || []);
    setImagePreview(event.coverImage ? `${API}${event.coverImage}` : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setEventLoading(true);
    try {
      const formData = new FormData();
      Object.entries(eventForm).forEach(([k, v]) => {
        if (!['locationName','locationAddress','locationCity','locationState'].includes(k)) {
          formData.append(k, v);
        }
      });
      formData.append('location', JSON.stringify({
        name: eventForm.locationName, address: eventForm.locationAddress,
        city: eventForm.locationCity, state: eventForm.locationState,
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
      setActiveTab('events');
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
        if (selectedEvent?._id === id) setSelectedEvent(null);
      } catch (err) { console.error(err); }
    }
  };

  const exportEventAttendees = (event) => {
    const attendees = event.attendees || [];
    if (!attendees.length) return alert('No attendees to export yet.');
    const data = attendees.map(a => ({
      'First Name': a.firstName || '',
      'Last Name': a.lastName || '',
      'Email': a.email || '',
      'Phone': a.phone || '',
      'Ticket Type': a.ticketType || '',
      'Amount Paid': a.amountPaid ? `$${(a.amountPaid / 100).toFixed(2)}` : '$0',
      'Checked In': a.checkedIn ? 'Yes' : 'No',
      'Purchase Date': a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '',
    }));
    exportToCSV(data, `${event.name.replace(/\s+/g,'-')}-attendees.csv`);
  };

  if (loading) return (
    <div className="admin-loading">
      <div className="loading-spinner" />
      <p>Loading Executive Suite...</p>
    </div>
  );

  const TABS = [
    { id: 'overview',      label: '📊 Overview' },
    { id: 'members',       label: '👥 Members' },
    { id: 'events',        label: '🎟 Events' },
    { id: 'create-event',  label: editingEvent ? '✏️ Edit Event' : '＋ New Event' },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header-section">
        <div>
          <h1 className="playfair">Executive Dashboard</h1>
          <p>Grown Folks Collective · Command Center</p>
        </div>
        <div className="admin-header-meta">
          <span className="live-badge">● LIVE</span>
          <span className="header-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="overview-tab">

          {/* Primary stats */}
          <div className="stats-section">
            <h3 className="section-heading">Membership</h3>
            <div className="stats-grid">
              <StatCard label="Total Members"   value={stats.totalMembers}   sub={`+${stats.recentSignups} this month`} accent="#C9A84C" />
              <StatCard label="Active Members"  value={stats.activeMembers}  sub="Approved & active"                    accent="#4CAF7D" />
              <StatCard label="Waitlisted"      value={stats.waitlisted}     sub="Awaiting review"                      accent="#E8A838" />
              <StatCard label="Pending Review"  value={stats.pending}        sub="Action required"                      accent="#E05C5C" />
            </div>
          </div>

          <div className="stats-section">
            <h3 className="section-heading">Events & Revenue</h3>
            <div className="stats-grid">
              <StatCard label="Total Events"    value={stats.totalEvents}                                                  accent="#C9A84C" />
              <StatCard label="Published"       value={stats.publishedEvents}  sub="Live & bookable"                       accent="#4CAF7D" />
              <StatCard label="Tickets Sold"    value={stats.totalSold}        sub={`of ${stats.totalCapacity} capacity`}  accent="#7B68EE" />
              <StatCard label="Fill Rate"       value={`${stats.fillRate}%`}   sub="Across all events"                     accent="#E8A838" />
              <StatCard label="Est. Revenue"    value={`$${(stats.totalRevenue / 100).toLocaleString()}`} sub="Gross ticket sales" accent="#4CAF7D" />
              <StatCard label="Top Industry"    value={stats.topIndustry}      sub="Among members"                         accent="#C9A84C" />
            </div>
          </div>

          {/* Industry Breakdown */}
          <div className="stats-section">
            <h3 className="section-heading">Member Industries</h3>
            <div className="industry-breakdown">
              {Object.entries(stats.industries)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([industry, count]) => {
                  const pct = stats.totalMembers > 0 ? Math.round((count / stats.totalMembers) * 100) : 0;
                  return (
                    <div key={industry} className="industry-row">
                      <span className="industry-name">{industry}</span>
                      <div className="industry-bar-wrap">
                        <div className="industry-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="industry-count">{count} <span className="industry-pct">({pct}%)</span></span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Recent Events Summary */}
          <div className="stats-section">
            <h3 className="section-heading">Event Performance</h3>
            <div className="event-perf-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th><th>Type</th><th>Date</th>
                    <th>Sold</th><th>Capacity</th><th>Fill %</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 && (
                    <tr><td colSpan={7} className="empty-cell">No events yet — create your first!</td></tr>
                  )}
                  {events.map(ev => {
                    const sold = ev.totalSold || 0;
                    const cap  = ev.capacity  || 0;
                    const fill = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                    return (
                      <tr key={ev._id} className="admin-row">
                        <td className="clickable-name" onClick={() => { setSelectedEvent(ev); setActiveTab('events'); }}>
                          {ev.name}
                        </td>
                        <td>{ev.eventType}</td>
                        <td>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td>{sold}</td>
                        <td>{cap}</td>
                        <td>
                          <div className="mini-bar-wrap">
                            <div className="mini-bar" style={{ width: `${fill}%`, background: fill >= 80 ? '#4CAF7D' : fill >= 50 ? '#E8A838' : '#E05C5C' }} />
                            <span>{fill}%</span>
                          </div>
                        </td>
                        <td><Badge text={ev.status} type={ev.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MEMBERS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="admin-layout">
          <div className="table-container">

            {/* Toolbar */}
            <div className="table-toolbar">
              <input
                className="search-input"
                placeholder="Search by name, email, industry…"
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
              />
              <select className="filter-select" value={memberFilter} onChange={e => setMemberFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="waitlisted">Waitlisted</option>
              </select>
              <button className="export-btn" onClick={exportMembers}>
                ↓ Export CSV ({filteredMembers.length})
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Industry</th>
                  <th>Tier</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 && (
                  <tr><td colSpan={7} className="empty-cell">No members match your search.</td></tr>
                )}
                {filteredMembers.map((member) => (
                  <tr key={member._id} className="admin-row">
                    <td className="clickable-name" onClick={() => setSelectedMember(member)}>
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="td-muted">{member.email}</td>
                    <td>{member.industry}</td>
                    <td><span className={`tier-badge ${member.tier?.toLowerCase()}`}>{member.tier}</span></td>
                    <td><Badge text={member.status} type={member.status} /></td>
                    <td className="td-muted">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                    </td>
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

              <section className="detail-group contact-card">
                <h4 className="detail-heading">Contact</h4>
                <div className="detail-item"><label>Email</label>
                  <a href={`mailto:${selectedMember.email}`} className="detail-link">{selectedMember.email}</a>
                </div>
                <div className="detail-item"><label>Phone</label>
                  <a href={`tel:${selectedMember.phone}`} className="detail-link">{selectedMember.phone || '—'}</a>
                </div>
              </section>

              <section className="detail-group">
                <h4 className="detail-heading">Identity</h4>
                <div className="demo-grid">
                  <div className="detail-item"><label>Age</label> {calculateAge(selectedMember.dob)}</div>
                  <div className="detail-item"><label>Gender</label> {selectedMember.gender || '—'}</div>
                </div>
                <div className="detail-item"><label>Joined</label> {selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</div>
              </section>

              <section className="detail-group">
                <h4 className="detail-heading">Community Profile</h4>
                <div className="detail-item"><label>Primary Interest</label> {selectedMember.connectionGoals?.primaryInterest || 'Networking'}</div>
                <div className="detail-item"><label>Founder Status</label> {selectedMember.isFirstTimeFounder ? 'First-Time Founder' : 'Serial Entrepreneur'}</div>
              </section>

              <section className="detail-group">
                <h4 className="detail-heading">Event Logistics</h4>
                <div className="demo-grid">
                  <div className="detail-item"><label>Shirt Size</label> {selectedMember.preferences?.apparelSize || 'N/A'}</div>
                  <div className="detail-item"><label>Passport</label> {selectedMember.hasPassport ? '✓ Yes' : '✗ No'}</div>
                </div>
                <div className="detail-item">
                  <label>Dietary Restrictions</label>
                  <div className="tag-container">
                    {selectedMember.preferences?.dietaryRestrictions?.length > 0
                      ? selectedMember.preferences.dietaryRestrictions.map((d, i) => <span key={i} className="diet-tag">{d}</span>)
                      : 'None'}
                  </div>
                </div>
              </section>

              <div className="panel-actions">
                <button className="gold-fill-btn"
                  disabled={selectedMember.status === 'accepted' || isUpdating}
                  onClick={() => handleStatusUpdate(selectedMember._id, 'accepted')}>
                  {isUpdating ? 'Processing...' : '✓ Approve'}
                </button>
                <button className="waitlist-action-btn"
                  disabled={selectedMember.status === 'waitlisted' || isUpdating}
                  onClick={() => handleStatusUpdate(selectedMember._id, 'waitlisted')}>
                  {isUpdating ? 'Processing...' : 'Waitlist'}
                </button>
                <button className="btn-delete"
                  onClick={() => handleDelete(selectedMember._id)}>
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EVENTS TAB ───────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="admin-layout">

          {/* Event detail panel */}
          {selectedEvent ? (
            <div className="event-detail-panel">
              <div className="event-detail-header">
                <button className="close-btn" onClick={() => setSelectedEvent(null)}>←</button>
                <div>
                  <h2 className="playfair">{selectedEvent.name}</h2>
                  <p className="subtitle">{selectedEvent.eventType} · {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="gold-spacer-v2" />

              {/* Event stats */}
              <div className="stats-grid mini">
                <StatCard label="Tickets Sold"  value={selectedEvent.totalSold || 0}    accent="#C9A84C" />
                <StatCard label="Capacity"       value={selectedEvent.capacity || 0}     accent="#7B68EE" />
                <StatCard label="Fill Rate"
                  value={selectedEvent.capacity > 0 ? `${Math.round(((selectedEvent.totalSold||0) / selectedEvent.capacity) * 100)}%` : '0%'}
                  accent="#4CAF7D"
                />
                <StatCard label="Est. Revenue"
                  value={`$${((selectedEvent.ticketTypes || []).reduce((a, t) => a + ((t.price||0) * Math.min(t.quantity||0, selectedEvent.totalSold||0)), 0) / 100).toLocaleString()}`}
                  accent="#E8A838"
                />
              </div>

              {/* Ticket types breakdown */}
              {selectedEvent.ticketTypes?.length > 0 && (
                <section className="detail-group">
                  <h4 className="detail-heading">Ticket Types</h4>
                  <table className="admin-table">
                    <thead><tr><th>Type</th><th>Price</th><th>Qty</th><th>Description</th></tr></thead>
                    <tbody>
                      {selectedEvent.ticketTypes.map((t, i) => (
                        <tr key={i} className="admin-row">
                          <td>{t.name}</td>
                          <td>{t.price ? `$${(t.price / 100).toFixed(2)}` : 'Free'}</td>
                          <td>{t.quantity}</td>
                          <td className="td-muted">{t.description || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Promo codes */}
              {selectedEvent.promoCodes?.length > 0 && (
                <section className="detail-group">
                  <h4 className="detail-heading">Promo Codes</h4>
                  <table className="admin-table">
                    <thead><tr><th>Code</th><th>Discount</th><th>Max Uses</th><th>Expires</th><th>Active</th></tr></thead>
                    <tbody>
                      {selectedEvent.promoCodes.map((p, i) => (
                        <tr key={i} className="admin-row">
                          <td><code className="promo-code">{p.code}</code></td>
                          <td>{p.discountType === 'percent' ? `${p.discountValue}%` : `$${p.discountValue}`}</td>
                          <td>{p.maxUses || 'Unlimited'}</td>
                          <td className="td-muted">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : '—'}</td>
                          <td>{p.active ? <span className="dot-green">●</span> : <span className="dot-red">●</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Attendees */}
              <section className="detail-group">
                <div className="section-row">
                  <h4 className="detail-heading">Attendees</h4>
                  <button className="export-btn" onClick={() => exportEventAttendees(selectedEvent)}>
                    ↓ Export CSV
                  </button>
                </div>
                {!selectedEvent.attendees?.length ? (
                  <p className="empty-hint">No attendees registered yet.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Phone</th><th>Ticket</th><th>Paid</th><th>Checked In</th></tr>
                    </thead>
                    <tbody>
                      {selectedEvent.attendees.map((a, i) => (
                        <tr key={i} className="admin-row">
                          <td>{a.firstName} {a.lastName}</td>
                          <td className="td-muted"><a href={`mailto:${a.email}`} className="detail-link">{a.email}</a></td>
                          <td className="td-muted">{a.phone || '—'}</td>
                          <td>{a.ticketType || '—'}</td>
                          <td>{a.amountPaid ? `$${(a.amountPaid / 100).toFixed(2)}` : 'Free'}</td>
                          <td>{a.checkedIn ? <span className="dot-green">● In</span> : <span className="dot-red">● No</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <div className="panel-actions">
                <button className="gold-fill-btn" onClick={() => handleEditEvent(selectedEvent)}>Edit Event</button>
                <button className="btn-delete" onClick={() => handleDeleteEvent(selectedEvent._id)}>Delete Event</button>
              </div>
            </div>
          ) : (
            <div className="table-container full-width">
              <div className="table-toolbar">
                <input
                  className="search-input"
                  placeholder="Search events…"
                  value={eventSearch}
                  onChange={e => setEventSearch(e.target.value)}
                />
                <button className="gold-fill-btn" onClick={() => { resetEventForm(); setActiveTab('create-event'); }}>
                  + New Event
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Date</th><th>Sold</th><th>Cap</th><th>Fill</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 && (
                    <tr><td colSpan={8} className="empty-cell">No events yet — create your first one!</td></tr>
                  )}
                  {filteredEvents.map(ev => {
                    const sold = ev.totalSold || 0;
                    const cap  = ev.capacity  || 0;
                    const fill = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                    return (
                      <tr key={ev._id} className="admin-row">
                        <td className="clickable-name" onClick={() => setSelectedEvent(ev)}>{ev.name}</td>
                        <td>{ev.eventType}</td>
                        <td>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td>{sold}</td>
                        <td>{cap}</td>
                        <td>
                          <div className="mini-bar-wrap">
                            <div className="mini-bar" style={{ width: `${fill}%`, background: fill >= 80 ? '#4CAF7D' : fill >= 50 ? '#E8A838' : '#C9A84C' }} />
                            <span>{fill}%</span>
                          </div>
                        </td>
                        <td><Badge text={ev.status} type={ev.status} /></td>
                        <td style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="waitlist-action-btn" onClick={() => setSelectedEvent(ev)}>View</button>
                          <button className="waitlist-action-btn" onClick={() => handleEditEvent(ev)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDeleteEvent(ev._id)}>Del</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT EVENT TAB ───────────────────────────────────── */}
      {activeTab === 'create-event' && (
        <div className="event-form-panel">
          <div className="form-panel-header">
            <h3 className="playfair">{editingEvent ? `Editing: ${editingEvent.name}` : 'Create New Event'}</h3>
            {editingEvent && (
              <button className="waitlist-action-btn" onClick={() => { resetEventForm(); setActiveTab('events'); }}>
                Cancel
              </button>
            )}
          </div>
          <div className="gold-spacer-v2"></div>

          <form onSubmit={handleEventSubmit} className="event-form">

            <h4 className="form-section-heading">Core Info</h4>
            <div className="form-group">
              <label>Event Name *</label>
              <input name="name" value={eventForm.name} onChange={handleEventFormChange} required placeholder="e.g. Luxury Bingo Night" />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={eventForm.description} onChange={handleEventFormChange} rows={4} required placeholder="Tell people what makes this event special…" />
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

            <h4 className="form-section-heading">Location</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Venue Name *</label>
                <input name="locationName" value={eventForm.locationName} onChange={handleEventFormChange} required placeholder="e.g. The Gathering Spot" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input name="locationAddress" value={eventForm.locationAddress} onChange={handleEventFormChange} placeholder="123 Peachtree St" />
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

            <h4 className="form-section-heading">
              Tickets
              <button type="button" className="add-row-btn" onClick={addTicket}>+ Add Ticket Type</button>
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
                    <label>Price in cents (5000 = $50)</label>
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
                    <input value={ticket.description} onChange={e => updateTicket(i, 'description', e.target.value)} placeholder="What's included…" />
                  </div>
                </div>
              </div>
            ))}

            <h4 className="form-section-heading">
              Promo Codes
              <button type="button" className="add-row-btn" onClick={addPromo}>+ Add Code</button>
            </h4>
            {promoCodes.length === 0 && <p className="empty-hint">No promo codes yet.</p>}
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
                    <label>Value</label>
                    <input type="number" value={promo.discountValue} onChange={e => updatePromo(i, 'discountValue', Number(e.target.value))} min="0" />
                  </div>
                  <div className="form-group">
                    <label>Max Uses</label>
                    <input type="number" value={promo.maxUses} onChange={e => updatePromo(i, 'maxUses', e.target.value)} placeholder="Unlimited" />
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
                {eventLoading ? 'Saving…' : editingEvent ? '✓ Update Event' : '✓ Publish Event'}
              </button>
              {editingEvent && (
                <button type="button" className="waitlist-action-btn" onClick={() => { resetEventForm(); setActiveTab('events'); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;