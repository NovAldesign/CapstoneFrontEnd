import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../Services/eventService';
import { adminApi, adminLegacy } from '../Services/adminApi';
import AdminReviews from "../Components/AdminReviews.jsx";
import AdminSelect from "../Components/AdminSelect.jsx";
import AdminToday from "../Components/admin/AdminToday.jsx";
import AdminShowcases from "../Components/admin/AdminShowcases.jsx";
import AdminCodes from "../Components/admin/AdminCodes.jsx";
import { AdminInboxList, AdminPerks, AdminSubscribers } from "../Components/admin/AdminLists.jsx";
import AdminPartners from "../Components/admin/AdminPartners.jsx";
import AdminGuests from "../Components/admin/AdminGuests.jsx";
import AdminReports from "../Components/admin/AdminReports.jsx";
import AdminGifts from "../Components/admin/AdminGifts.jsx";
import AdminTestMember from "../Components/admin/AdminTestMember.jsx";
import AdminBlog from "../Components/admin/AdminBlog.jsx";
import "../Styles/Admin.css";
import "../Styles/AdminShell.css";

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
  const [activeTab, setActiveTab]           = useState(() => {
    try { return sessionStorage.getItem('gfc_admin_tab') || 'today'; } catch { return 'today'; }
  });
  const [counts, setCounts]                 = useState({});
  const [guestEvent, setGuestEvent]         = useState('');
  const [membership, setMembership]         = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading]               = useState(true);
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

  // Remember the open tab when the page reloads
  useEffect(() => {
    try { sessionStorage.setItem('gfc_admin_tab', activeTab); } catch { /* private mode */ }
  }, [activeTab]);

  // Sidebar badges (what's waiting on you)
  useEffect(() => {
    adminApi('/inbox').then((d) => setCounts(d.counts || {})).catch(() => {});
  }, []);
  const handleCounts = useCallback((c) => setCounts(c || {}), []);

  const loadData = async () => {
    const [memberData, eventData] = await Promise.all([
      adminLegacy('/membership').catch((err) => { console.error(err); return []; }),
      getAllEvents(),
    ]);
    setMembership(Array.isArray(memberData) ? memberData : []);
    setEvents(Array.isArray(eventData) ? eventData : []);
    setLoading(false);
  };

  // ── Filtered Members ────────────────────────────────────────────────────
  const filteredMembers = useMemo(() => {
    return membership.filter(m => {
      const matchSearch = memberSearch === '' ||
        `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(memberSearch.toLowerCase());
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

  // ── Members Handlers ────────────────────────────────────────────────────
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    return Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this member from the GFC database?")) {
      try {
        await adminLegacy(`/membership/${id}`, { method: 'DELETE' });
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

  // ── Events Handlers ─────────────────────────────────────────────────────
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
      <p>Loading your dashboard…</p>
    </div>
  );

  // Sidebar: grouped so related work sits together
  const NAV = [
    { group: null, items: [{ id: 'today', icon: '☀️', label: 'Today' }] },
    { group: 'Events', items: [
      { id: 'events', icon: '🎟', label: 'Events' },
      { id: 'guests', icon: '✅', label: 'Guest lists & check-in' },
      { id: 'showcases', icon: '🎤', label: 'Showcases', count: (counts.artists || 0) + (counts.hosts || 0) },
      { id: 'create-event', icon: '＋', label: editingEvent ? 'Edit event' : 'New event' },
    ] },
    { group: 'Sales', items: [
      { id: 'reports', icon: '📈', label: 'Reports' },
      { id: 'codes', icon: '🏷️', label: 'Discount codes' },
      { id: 'gifts', icon: '🎁', label: 'Gifts & merch' },
    ] },
    { group: 'Partnerships', items: [
      { id: 'partners', icon: '🤝', label: 'Partners', count: counts.partners },
      { id: 'perks', icon: '💳', label: 'Member Perks', count: counts.perks },
      { id: 'private', icon: '🥂', label: 'Private events', count: counts.hosting },
      { id: 'groups', icon: '🎉', label: 'Group bookings', count: counts.groups },
    ] },
    { group: 'People', items: [
      { id: 'messages', icon: '✉️', label: 'Messages', count: counts.messages },
      { id: 'members', icon: '👥', label: 'Members' },
      { id: 'subscribers', icon: '📬', label: 'Subscribers' },
      { id: 'blog', icon: '📝', label: 'Blog' },
      { id: 'select', icon: '🎭', label: 'GFC Select™', count: counts.select },
      { id: 'reviews', icon: '⭐', label: 'Reviews', count: counts.reviews },
    ] },
  ];
  const TITLES = {
    today: ['Today', 'Everything waiting on you, in one place.'],
    events: ['Events', 'Every event, tickets sold and attendees.'],
    showcases: ['Showcases', 'Lineups, artist and host applications, ticket codes and payouts.'],
    'create-event': [editingEvent ? 'Edit event' : 'New event', 'Set the details, tickets and photo.'],
    codes: ['Discount codes', 'Create, edit and pause codes. No coding needed.'],
    guests: ['Guest lists & check-in', 'Every ticket from every platform, and the door link for event day.'],
    gifts: ['Gifts & merch', 'Holiday Passes, gift cards and merch pre-orders.'],
    reports: ['Reports', 'Tickets, revenue, who showed up and where tickets came from.'],
    partners: ['Partners', 'Sponsor inquiries and partner portal progress.'],
    perks: ['Member Perks', 'Businesses offering discounts to members.'],
    private: ['Private events', 'Hosting requests from the /host page.'],
    groups: ['Group bookings', 'Birthdays, celebrations and groups.'],
    messages: ['Messages', 'Notes from the contact form.'],
    members: ['Members', 'Memberships and their status.'],
    subscribers: ['Subscribers', 'Your newsletter list.'],
    blog: ['Blog', 'Write, edit and remove posts on The Gathering Table.'],
    select: ['GFC Select™', 'Applications, doors and matching.'],
    reviews: ['Reviews', 'Guest reviews for the home page.'],
  };
  const [title, subtitle] = TITLES[activeTab] || TITLES.today;
  const go = (tab) => { setActiveTab(tab); window.scrollTo({ top: 0 }); };
  const openGuests = (eventId) => { setGuestEvent(eventId || ''); go('guests'); };

  return (
    <div className="gfc-admin">
      <nav className="ga-side" aria-label="Dashboard">
        <div className="ga-brand">
          <div className="ga-brand-name">Grown Folks™</div>
          <div className="ga-brand-sub">Command Center</div>
        </div>
        {NAV.map((g) => (
          <React.Fragment key={g.group || 'top'}>
            {g.group && <div className="ga-nav-group">{g.group}</div>}
            {g.items.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`ga-nav-btn ${activeTab === t.id ? 'active' : ''}`}
                aria-current={activeTab === t.id ? 'page' : undefined}
                onClick={() => go(t.id)}
              >
                <span className="ga-nav-icon" aria-hidden="true">{t.icon}</span>
                <span className="ga-nav-label">{t.label}</span>
                {t.count > 0 && <span className="ga-count" aria-label={`${t.count} waiting`}>{t.count}</span>}
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>

      <main className="ga-main">
      <div className="ga-topbar">
        <div>
          <h1 className="ga-title">{title}</h1>
          <p className="ga-subtitle">{subtitle}</p>
        </div>
        <span className="ga-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>

      {activeTab === 'today' && <AdminToday go={go} onCounts={handleCounts} openGuests={openGuests} />}
      {activeTab === 'guests' && <AdminGuests startEventId={guestEvent} onOpen={setGuestEvent} />}
      {activeTab === 'reports' && <AdminReports openGuests={openGuests} />}
      {activeTab === 'showcases' && <AdminShowcases />}
      {activeTab === 'codes' && <AdminCodes events={events} />}
      {activeTab === 'gifts' && <AdminGifts />}
      {activeTab === 'perks' && <AdminPerks />}
      {activeTab === 'partners' && <AdminPartners />}
      {['private', 'groups', 'messages'].includes(activeTab) && <AdminInboxList kind={activeTab} />}
      {activeTab === 'subscribers' && <AdminSubscribers />}
      {activeTab === 'blog' && <AdminBlog />}
      {activeTab === 'reviews' && <AdminReviews />}
      {activeTab === 'select' && <AdminSelect />}

      {/* ── MEMBERS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <>
        <div className="ga-grid-2" style={{ gridTemplateColumns: selectedMember ? 'minmax(0,1.6fr) minmax(0,1fr)' : '1fr' }}>
          <section className="ga-card">
            <div className="ga-card-head">
              <div className="ga-seg" role="tablist" aria-label="Filter members">
                {[['all', 'All'], ['active', 'Active'], ['pending', 'Not paid yet'], ['canceled', 'Canceled']].map(([id, lbl]) => (
                  <button key={id} type="button" className={memberFilter === id ? 'on' : ''} onClick={() => setMemberFilter(id)}>
                    {lbl} · {id === 'all' ? membership.length : membership.filter(m => m.status === id).length}
                  </button>
                ))}
              </div>
              <div className="ga-row">
                <input className="ga-input" style={{ width: 220 }} placeholder="Search name or email" aria-label="Search members"
                  value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                <button type="button" className="ga-btn" onClick={exportMembers}>↓ CSV ({filteredMembers.length})</button>
              </div>
            </div>
            <div className="ga-table-wrap">
              <table className="ga-table">
                <thead><tr><th>Name</th><th>Email</th><th>Tier</th><th>Status</th><th>Joined</th></tr></thead>
                <tbody>
                  {filteredMembers.length === 0 && (
                    <tr><td colSpan={5} className="ga-empty">No members match.</td></tr>
                  )}
                  {filteredMembers.map((member) => (
                    <tr key={member._id}>
                      <td><button type="button" className="ga-link" style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--ga-navy)' }}
                        onClick={() => setSelectedMember(member)}>{member.firstName} {member.lastName}</button>
                        {member.isTest && <span className="ga-pill amber" style={{ marginLeft: 6 }}>Test</span>}</td>
                      <td className="ga-small"><a href={`mailto:${member.email}`}>{member.email}</a></td>
                      <td>{member.tier ? <span className="ga-pill gold">{member.tier}</span> : '—'}</td>
                      <td><span className={`ga-pill ${member.status === 'active' ? 'green' : member.status === 'pending' ? 'amber' : ''}`}>
                        {member.status === 'pending' ? 'Not paid yet' : member.status}</span></td>
                      <td className="ga-small">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {selectedMember && (
            <section className="ga-card">
              <div className="ga-card-head">
                <div>
                  <p className="ga-kicker">{selectedMember.tier || 'Member'}</p>
                  <h2 className="ga-card-title">{selectedMember.firstName} {selectedMember.lastName}</h2>
                </div>
                <button type="button" className="ga-x" aria-label="Close" onClick={() => setSelectedMember(null)}>×</button>
              </div>
              <div className="ga-detail">
                <dl>
                  <dt>Email</dt><dd><a href={`mailto:${selectedMember.email}`}>{selectedMember.email}</a></dd>
                  <dt>Phone</dt><dd>{selectedMember.phone ? <a href={`tel:${selectedMember.phone}`}>{selectedMember.phone}</a> : '—'}</dd>
                  <dt>Status</dt><dd>{selectedMember.status === 'pending' ? 'Not paid yet' : selectedMember.status}</dd>
                  <dt>Age</dt><dd>{calculateAge(selectedMember.dob)}</dd>
                  <dt>Joined</dt><dd>{selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</dd>
                  {selectedMember.paidAt && (<><dt>Paid</dt><dd>{new Date(selectedMember.paidAt).toLocaleDateString()}</dd></>)}
                </dl>
              </div>
              <p className="ga-small ga-muted">Membership status updates on its own when Stripe confirms a payment or a cancellation.</p>
              <div className="ga-row">
                <a className="ga-btn ga-btn-sm" href={`mailto:${selectedMember.email}`}>✉️ Email</a>
                {selectedMember.phone && <a className="ga-btn ga-btn-sm" href={`sms:${selectedMember.phone}`}>💬 Text</a>}
                <span className="ga-spacer" />
                <button type="button" className="ga-btn ga-btn-sm ga-btn-danger" onClick={() => handleDelete(selectedMember._id)}>Remove</button>
              </div>
            </section>
          )}
        </div>
        <AdminTestMember />
        </>
      )}

      {/* ── EVENTS TAB ───────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="admin-layout">
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
                  <tr><th>Name</th><th>Type</th><th>Date</th><th>Sold</th><th>Cap</th><th>Fill</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 && (
                    <tr><td colSpan={7} className="empty-cell">No events yet — create your first one!</td></tr>
                  )}
                  {filteredEvents.map(ev => {
                    const sold = ev.totalSold || 0;
                    const cap  = ev.capacity  || 0;
                    const fill = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                    return (
                      <tr key={ev._id} className="admin-row">
                        <td className="clickable-name" onClick={() => setSelectedEvent(ev)}>
                          {ev.name}
                        </td>
                        <td>{ev.eventType}</td>
                        <td className="td-muted">{new Date(ev.date).toLocaleDateString()}</td>
                        <td>{sold}</td>
                        <td>{cap}</td>
                        <td>
                          <div className="mini-bar-wrap">
                            <div className="mini-bar" style={{ width: `${fill}%`, background: fill >= 80 ? '#4CAF7D' : '#E8A838' }} />
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
          )}
        </div>
      )}

      {/* ── CREATE / EDIT EVENT TAB ──────────────────────────────────── */}
      {activeTab === 'create-event' && (
        <div className="admin-form-container">
          <form onSubmit={handleEventSubmit} className="admin-creation-form">
            <h2 className="playfair">{editingEvent ? '✏️ Edit Gathering' : '＋ Schedule New Gathering'}</h2>
            <p className="subtitle">Configure details, custom ticket tiers, and bundle promo options</p>
            <div className="gold-spacer-v2" />

            <div className="form-row-grid">
              <div className="form-group flex-2">
                <label>Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={eventForm.name}
                  onChange={handleEventFormChange}
                  required
                  placeholder="e.g. Spades Tournament & Game Night"
                />
              </div>
              <div className="form-group">
                <label>Event Type</label>
                <select name="eventType" value={eventForm.eventType} onChange={handleEventFormChange}>
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Event Description</label>
              <textarea
                name="description"
                value={eventForm.description}
                onChange={handleEventFormChange}
                required
                placeholder="Detail the experience layout, target community vibe, and attendance criteria..."
                rows={4}
              />
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label>Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={eventForm.date}
                  onChange={handleEventFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={eventForm.endDate}
                  onChange={handleEventFormChange}
                />
              </div>
              <div className="form-group">
                <label>Max Attendance Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={eventForm.capacity}
                  onChange={handleEventFormChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <h3 className="form-subheading">📍 Venue Details</h3>
            <div className="form-row-grid">
              <div className="form-group flex-2">
                <label>Venue / Location Name</label>
                <input
                  type="text"
                  name="locationName"
                  value={eventForm.locationName}
                  onChange={handleEventFormChange}
                  placeholder="e.g. Rudolph's Restaurant, Tea Bar"
                />
              </div>
              <div className="form-group flex-2">
                <label>Street Address</label>
                <input
                  type="text"
                  name="locationAddress"
                  value={eventForm.locationAddress}
                  onChange={handleEventFormChange}
                  placeholder="e.g. 123 Main Street"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="locationCity"
                  value={eventForm.locationCity}
                  onChange={handleEventFormChange}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="locationState"
                  value={eventForm.locationState}
                  onChange={handleEventFormChange}
                  maxLength="2"
                />
              </div>
            </div>

            <h3 className="form-subheading">🖼️ Event Branding</h3>
            <div className="form-row-grid file-upload-row">
              <div className="form-group">
                <label className="file-input-label">
                  Choose Cover Image (JPEG, PNG, WEBP)
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>
              {imagePreview && (
                <div className="image-preview-box">
                  <img src={imagePreview} alt="Preview" />
                  <button type="button" className="btn-remove-img" onClick={() => { setImageFile(null); setImagePreview(null); }}>×</button>
                </div>
              )}
            </div>

            <div className="section-row-header">
              <h3 className="form-subheading">🎟️ Ticket Allocation Tiers</h3>
              <button type="button" className="add-row-btn" onClick={addTicket}>＋ Add Tier</button>
            </div>
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="dynamic-form-row card-item-row">
                <input
                  type="text"
                  placeholder="Tier Name (e.g. General Admission)"
                  value={ticket.name}
                  onChange={(e) => updateTicket(index, 'name', e.target.value)}
                  required
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  placeholder="Price (in Cents - e.g. 3000 = $30)"
                  value={ticket.price || ''}
                  onChange={(e) => updateTicket(index, 'price', Number(e.target.value))}
                  required
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Total Qty Available"
                  value={ticket.quantity || ''}
                  onChange={(e) => updateTicket(index, 'quantity', Number(e.target.value))}
                  required
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Short perks details..."
                  value={ticket.description || ''}
                  onChange={(e) => updateTicket(index, 'description', e.target.value)}
                  style={{ flex: 2 }}
                />
                {ticketTypes.length > 1 && (
                  <button type="button" className="row-delete-btn" onClick={() => removeTicket(index)}>×</button>
                )}
              </div>
            ))}

            <div className="section-row-header" style={{ marginTop: '30px' }}>
              <h3 className="form-subheading">🏷️ Event Specific Promo Codes</h3>
              <button type="button" className="add-row-btn" onClick={addPromo}>＋ Add Code</button>
            </div>
            {promoCodes.length === 0 ? (
              <p className="empty-hint-text">No custom single-event overrides added yet. Global multi-event automated cart rules apply during user checkouts.</p>
            ) : (
              promoCodes.map((promo, index) => (
                <div key={index} className="dynamic-form-row card-item-row compact">
                  <input
                    type="text"
                    placeholder="CODE"
                    value={promo.code}
                    onChange={(e) => updatePromo(index, 'code', e.target.value.toUpperCase().trim())}
                    required
                    style={{ flex: 1.5, textTransform: 'uppercase' }}
                  />
                  <select
                    value={promo.discountType}
                    onChange={(e) => updatePromo(index, 'discountType', e.target.value)}
                    style={{ flex: 1.2 }}
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat Cents ($)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Value"
                    value={promo.discountValue || ''}
                    onChange={(e) => updatePromo(index, 'discountValue', Number(e.target.value))}
                    required
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    placeholder="Max Uses"
                    value={promo.maxUses || ''}
                    onChange={(e) => updatePromo(index, 'maxUses', e.target.value ? Number(e.target.value) : '')}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="date"
                    value={promo.expiresAt ? promo.expiresAt.substring(0, 10) : ''}
                    onChange={(e) => updatePromo(index, 'expiresAt', e.target.value)}
                    style={{ flex: 1.5 }}
                  />
                  <label className="toggle-label" style={{ flex: 0.8 }}>
                    Active
                    <input
                      type="checkbox"
                      checked={promo.active}
                      onChange={(e) => updatePromo(index, 'active', e.target.checked)}
                    />
                  </label>
                  <button type="button" className="row-delete-btn" onClick={() => removePromo(index)}>×</button>
                </div>
              ))
            )}

            <h3 className="form-subheading">⚙️ Visibility & Metadata</h3>
            <div className="form-row-grid compact-flags">
              <div className="form-group">
                <label>Publish Status</label>
                <select name="status" value={eventForm.status} onChange={handleEventFormChange}>
                  <option value="published">Published (Visible on Live Feed)</option>
                  <option value="draft">Draft (Admin Only View)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Featured Partner / Corporate Sponsor</label>
                <input
                  type="text"
                  name="featuredSponsor"
                  value={eventForm.featuredSponsor}
                  onChange={handleEventFormChange}
                  placeholder="e.g. Nov'Al Web Agency, Local Tea Bar"
                />
              </div>
              <div className="form-group checkbox-align">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={eventForm.isFree}
                    onChange={handleEventFormChange}
                  />
                  Mark as an Entirely Complimentary Gathering
                </label>
              </div>
            </div>

            <div className="form-actions-row">
              <button type="button" className="cancel-form-btn" onClick={() => { resetEventForm(); setActiveTab('events'); }}>
                Cancel
              </button>
              <button type="submit" disabled={eventLoading} className="submit-form-btn gold-fill-btn">
                {eventLoading ? 'Synchronizing Gathering...' : editingEvent ? 'Save Event Updates' : 'Publish Gathering to Registry'}
              </button>
            </div>
          </form>
        </div>
      )}
      </main>
    </div>
  );
};

export default AdminDashboard;