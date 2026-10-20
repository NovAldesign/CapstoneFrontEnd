import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../Services/eventService';
import { adminApi, adminLegacy } from '../Services/adminApi';
import AdminReviews from "../Components/AdminReviews.jsx";
import AdminSiteStats from "../Components/AdminSiteStats.jsx";
import AdminRecess from "../Components/admin/AdminRecess.jsx";
import AdminDonations from "../Components/admin/AdminDonations.jsx";
import AdminSelect from "../Components/AdminSelect.jsx";
import AdminToday from "../Components/admin/AdminToday.jsx";
import AdminShowcases from "../Components/admin/AdminShowcases.jsx";
import AdminLives from "../Components/admin/AdminLives.jsx";
import EventbriteSync from "../Components/admin/EventbriteSync.jsx";
import AdminCodes from "../Components/admin/AdminCodes.jsx";
import { AdminInboxList, AdminPerks, AdminSubscribers, AdminScouts } from "../Components/admin/AdminLists.jsx";
import AdminPeople from "../Components/admin/AdminPeople.jsx";
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
  // Real sales for the open event: website + Eventbrite + guests added by hand
  const [eventLive, setEventLive] = useState(null);
  useEffect(() => {
    if (!selectedEvent?._id) { setEventLive(null); return; }
    let active = true;
    setEventLive({ loading: true });
    adminApi(`/events/${selectedEvent._id}/guests`)
      .then((d) => active && setEventLive({ totals: d.totals, guests: d.guests || [], eventbrite: d.eventbrite, mergedFrom: d.mergedFrom || [] }))
      .catch((e) => active && setEventLive({ error: e.message }));
    return () => { active = false; };
  }, [selectedEvent?._id]);
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
  // Events list views: live upcoming events, past events, or drafts & cancelled copies
  const [eventView, setEventView] = useState('upcoming');
  const eventGroup = (e) => {
    if (e.status === 'draft' || e.status === 'cancelled') return 'hidden';
    return new Date(e.date) >= new Date(Date.now() - 86400000) ? 'upcoming' : 'past';
  };
  const eventViewCounts = useMemo(() => events.reduce((c, e) => { const g = eventGroup(e); c[g] = (c[g] || 0) + 1; return c; }, {}), [events]);
  const filteredEvents = useMemo(() => {
    const q = eventSearch.toLowerCase();
    return events
      .filter((e) => eventGroup(e) === eventView)
      .filter((e) => !q || e.name?.toLowerCase().includes(q) || e.eventType?.toLowerCase().includes(q))
      .sort((a, b) => (eventView === 'upcoming' ? 1 : -1) * (new Date(a.date) - new Date(b.date)));
  }, [events, eventSearch, eventView]);

  // Real ticket counts for the list (website + Eventbrite + added by hand)
  const [eventTotals, setEventTotals] = useState({});
  useEffect(() => {
    if (activeTab !== 'events') return;
    const ids = filteredEvents.map((e) => e._id).filter((id) => !(id in eventTotals)).slice(0, 60);
    if (!ids.length) return;
    adminApi(`/events/totals?ids=${ids.join(',')}`)
      .then((d) => setEventTotals((prev) => ({ ...prev, ...d.totals })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, eventView, filteredEvents]);

  // ── Event detail navigation ──────────────────────────────────────────
  // Opening an event adds a browser history step, so the browser's Back button
  // returns to the event list instead of leaving the dashboard.
  const openEvent = useCallback((ev) => {
    if (!ev) return;
    try {
      if (window.history.state?.gfcEvent) window.history.replaceState({ ...window.history.state, gfcEvent: ev._id }, '');
      else window.history.pushState({ ...(window.history.state || {}), gfcEvent: ev._id }, '');
    } catch { /* history not available */ }
    setSelectedEvent(ev);
    window.scrollTo({ top: 0 });
  }, []);
  const closeEvent = useCallback(() => {
    if (window.history.state?.gfcEvent) window.history.back();
    else setSelectedEvent(null);
  }, []);
  useEffect(() => {
    const onPop = (e) => {
      const id = e.state?.gfcEvent;
      if (!id) setSelectedEvent(null);
      else setSelectedEvent((cur) => (cur?._id === id ? cur : events.find((x) => x._id === id) || null));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [events]);
  // Previous / next event in the list you're looking at (Upcoming, Past, or Drafts)
  const eventNav = useMemo(() => {
    if (!selectedEvent) return { list: [], index: -1 };
    const list = filteredEvents.some((e) => e._id === selectedEvent._id) ? filteredEvents : events;
    return { list, index: list.findIndex((e) => e._id === selectedEvent._id) };
  }, [selectedEvent, filteredEvents, events]);

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
        if (selectedEvent?._id === id) closeEvent();
      } catch (err) { console.error(err); }
    }
  };

  const exportEventAttendees = (event) => {
    const guests = eventLive?.guests || [];
    if (!guests.length) return alert('No attendees to export yet.');
    const data = guests.map((g) => ({
      'Name': g.name || '',
      'Email': g.email || '',
      'Phone': g.phone || '',
      'Tickets': g.tickets,
      'Ticket Type': g.ticketName || '',
      'Amount Paid': `$${((g.paidCents || 0) / 100).toFixed(2)}`,
      'From': g.source || '',
      'Code': g.code || '',
      'Checked In': g.checkedIn || 0,
      'Purchase Date': g.boughtAt ? new Date(g.boughtAt).toLocaleDateString() : '',
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
      { id: 'lives', icon: '🔴', label: 'Lives', count: counts.livesToday },
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
      { id: 'donations', icon: '🎁', label: 'Donations' },
      { id: 'private', icon: '🥂', label: 'Private events', count: counts.hosting },
      { id: 'groups', icon: '🎉', label: 'Group bookings', count: counts.groups },
    ] },
    { group: 'People', items: [
      { id: 'people', icon: '📇', label: 'People (CRM)' },
      { id: 'messages', icon: '✉️', label: 'Messages', count: counts.messages },
      { id: 'members', icon: '👥', label: 'Members' },
      { id: 'subscribers', icon: '📬', label: 'Subscribers' },
      { id: 'scouts', icon: '🔎', label: 'Industry Scouts' },
      { id: 'recess', icon: '🖍️', label: 'Recess Talks™' },
      { id: 'blog', icon: '📝', label: 'Blog' },
      { id: 'select', icon: '🎭', label: 'GFC Select™', count: counts.select },
      { id: 'reviews', icon: '⭐', label: 'Reviews', count: counts.reviews },
      { id: 'site-numbers', icon: '📊', label: 'Site Numbers' },
    ] },
  ];
  const TITLES = {
    today: ['Today', 'Everything waiting on you, in one place.'],
    events: ['Events', 'Every event, tickets sold and attendees.'],
    showcases: ['Showcases', 'Lineups, artist, host and live artist applications, ticket codes and payouts.'],
    lives: ['Lives', 'Instagram and TikTok Lives with your artists and hosts, with the questions.'],
    'create-event': [editingEvent ? 'Edit event' : 'New event', 'Set the details, tickets and photo.'],
    codes: ['Discount codes', 'Create, edit and pause codes. No coding needed.'],
    guests: ['Guest lists & check-in', 'Every ticket from every platform, and the door link for event day.'],
    gifts: ['Gifts & merch', 'Holiday Passes, gift cards and merch pre-orders.'],
    reports: ['Reports', 'Tickets, revenue, who showed up and where tickets came from.'],
    partners: ['Partners', 'Sponsor inquiries and partner portal progress.'],
    donations: ['Donations', 'Products and equipment offered for gift bags, giveaways and events.'],
    perks: ['Member Perks', 'Businesses offering discounts to members.'],
    private: ['Private events', 'Hosting requests from the /host page.'],
    groups: ['Group bookings', 'Birthdays, celebrations and groups.'],
    people: ['People (CRM)', 'Everyone in one place: notes, tags, details and who\'s in Brevo.'],
    messages: ['Messages', 'Notes from the contact form.'],
    members: ['Members', 'Memberships and their status.'],
    subscribers: ['Subscribers', 'Your newsletter list.'],
    recess: ['Recess Talks™', 'Speaker applications and the interest list for /recess.'],
    scouts: ['Industry Scouts', 'Labels, managers and A&R coming to showcases for free.'],
    blog: ['Blog', 'Write, edit and remove posts on The Gathering Table.'],
    select: ['GFC Select™', 'Applications, doors and matching.'],
    reviews: ['Reviews', 'Platform ratings and guest reviews for the home page.'],
    'site-numbers': ['Site Numbers', 'Followers and stats shown on the website. Update once, it changes everywhere.'],
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
      {activeTab === 'lives' && <AdminLives />}
      {activeTab === 'codes' && <AdminCodes events={events} />}
      {activeTab === 'gifts' && <AdminGifts />}
      {activeTab === 'perks' && <AdminPerks />}
      {activeTab === 'donations' && <AdminDonations />}
      {activeTab === 'partners' && <AdminPartners />}
      {['private', 'groups', 'messages'].includes(activeTab) && <AdminInboxList kind={activeTab} />}
      {activeTab === 'subscribers' && <AdminSubscribers />}
      {activeTab === 'scouts' && <AdminScouts />}
      {activeTab === 'recess' && <AdminRecess />}
      {activeTab === 'people' && <AdminPeople />}
      {activeTab === 'blog' && <AdminBlog />}
      {activeTab === 'reviews' && <AdminReviews />}
      {activeTab === 'site-numbers' && <AdminSiteStats section="numbers" />}
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
                <button className="close-btn" onClick={closeEvent} aria-label="Back to all events">←</button>
                <div>
                  <h2 className="playfair">{selectedEvent.name}</h2>
                  <p className="subtitle">{selectedEvent.eventType} · {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="ev-nav" aria-label="Move between events">
                <button type="button" className="ga-btn ga-btn-sm" onClick={closeEvent}>← All events</button>
                <button type="button" className="ga-btn ga-btn-sm" disabled={eventNav.index <= 0}
                  onClick={() => openEvent(eventNav.list[eventNav.index - 1])}>‹ Previous</button>
                <button type="button" className="ga-btn ga-btn-sm" disabled={eventNav.index < 0 || eventNav.index >= eventNav.list.length - 1}
                  onClick={() => openEvent(eventNav.list[eventNav.index + 1])}>Next ›</button>
                <select className="ga-select ev-nav-jump" aria-label="Jump to an event" value={selectedEvent._id}
                  onChange={(e) => openEvent(eventNav.list.find((x) => x._id === e.target.value))}>
                  {eventNav.list.map((x) => (
                    <option key={x._id} value={x._id}>
                      {new Date(x.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {x.name}
                    </option>
                  ))}
                </select>
                {eventNav.index >= 0 && <span className="ga-small ga-muted">{eventNav.index + 1} of {eventNav.list.length}</span>}
              </div>
              {selectedEvent.eventbriteId && (
                <EventbriteSync
                  key={selectedEvent._id}
                  eventId={selectedEvent._id}
                  onDone={async () => {
                    const all = await getAllEvents().catch(() => null);
                    if (!Array.isArray(all)) return;
                    setEvents(all);
                    const fresh = all.find((e) => e._id === selectedEvent._id);
                    if (fresh) setSelectedEvent(fresh);
                  }}
                />
              )}
              <div className="gold-spacer-v2" />

              <div className="stats-grid mini">
                {(() => {
                  const live = eventLive?.totals;
                  const sold = live ? live.tickets : (selectedEvent.totalSold || 0);
                  const cap = selectedEvent.capacity || 0;
                  const wait = eventLive?.loading ? '…' : null;
                  return (
                    <>
                      <StatCard label="Tickets Sold" value={wait ?? sold} accent="#C9A84C" />
                      <StatCard label="Capacity" value={cap} accent="#7B68EE" />
                      <StatCard label="Fill Rate" value={wait ?? (cap > 0 ? `${Math.round((sold / cap) * 100)}%` : '0%')} accent="#4CAF7D" />
                      <StatCard label="Ticket Revenue"
                        value={wait ?? (live ? `$${(live.paidCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—')}
                        accent="#E8A838" />
                    </>
                  );
                })()}
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
                          <td>{t.price ? `$${Number(t.price).toFixed(2)}` : 'Free'}</td>
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
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="export-btn" onClick={() => exportEventAttendees(selectedEvent)}>↓ Export CSV</button>
                    <button className="export-btn" onClick={() => openGuests(selectedEvent._id)}>Guest list &amp; check-in →</button>
                  </div>
                </div>
                {eventLive?.loading ? (
                  <p className="empty-hint">Loading attendees…</p>
                ) : eventLive?.error ? (
                  <p className="empty-hint">{eventLive.error}</p>
                ) : !eventLive?.guests?.length ? (
                  <p className="empty-hint">No attendees yet.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Tickets</th><th>Ticket</th><th>Paid</th><th>From</th><th>Checked In</th></tr>
                    </thead>
                    <tbody>
                      {eventLive.guests.map((g) => (
                        <tr key={g.key} className="admin-row">
                          <td>{g.name}</td>
                          <td className="td-muted">{g.email ? <a href={`mailto:${g.email}`} className="detail-link">{g.email}</a> : '—'}</td>
                          <td>{g.tickets}</td>
                          <td>{g.ticketName || '—'}</td>
                          <td>{g.paidCents ? `$${(g.paidCents / 100).toFixed(2)}` : 'Free'}</td>
                          <td className="td-muted">{g.source}{g.code ? ` · ${g.code}` : ''}</td>
                          <td>{g.checkedIn ? <span className="dot-green">● {g.checkedIn}</span> : <span className="dot-red">● No</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {eventLive?.mergedFrom?.length > 0 && (
                  <p className="empty-hint">Includes guests from a copy of this event ({eventLive.mergedFrom.map((m) => `${m.name}, ${m.status}`).join('; ')}).</p>
                )}
                {eventLive?.eventbrite?.connected && eventLive.eventbrite.ok === false && (
                  <p className="empty-hint">Eventbrite sales couldn't load right now, so totals may be missing those.</p>
                )}
              </section>

              <div className="panel-actions">
                <button className="gold-fill-btn" onClick={() => handleEditEvent(selectedEvent)}>Edit Event</button>
                <button className="btn-delete" onClick={() => handleDeleteEvent(selectedEvent._id)}>Delete Event</button>
              </div>
            </div>
          ) : (
            <div className="table-container full-width">
              <div className="eb-sync-bar">
                <EventbriteSync onDone={loadData} />
                <span className="ga-small ga-muted">Added or changed a ticket on Eventbrite and don't see it here or on the site? Tap this.</span>
              </div>
              <div className="table-toolbar">
                <div className="ga-seg" role="tablist" aria-label="Which events">
                  {[['upcoming', 'Upcoming'], ['past', 'Past'], ['hidden', 'Drafts & cancelled']].map(([id, label]) => (
                    <button key={id} type="button" role="tab" aria-selected={eventView === id} className={eventView === id ? 'on' : ''} onClick={() => setEventView(id)}>
                      {label} ({eventViewCounts[id] || 0})
                    </button>
                  ))}
                </div>
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
                    <tr><td colSpan={7} className="empty-cell">{eventView === 'hidden' ? 'No drafts or cancelled events.' : 'No events here.'}</td></tr>
                  )}
                  {filteredEvents.map(ev => {
                    const sold = eventTotals[ev._id]?.tickets ?? (ev.totalSold || 0);
                    const cap  = ev.capacity  || 0;
                    const fill = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                    return (
                      <tr key={ev._id} className="admin-row">
                        <td className="clickable-name" onClick={() => openEvent(ev)}>
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
        <form onSubmit={handleEventSubmit} className="ga-event-form">
          {/* Prices are stored in cents; the form shows dollars */}
          <div className="ga-card">
            <h3 className="ga-card-title">The basics</h3>
            <div className="ga-form-grid" style={{ marginTop: 14 }}>
              <label className="ga-field ga-span-2">Event name
                <input className="ga-input" type="text" name="name" value={eventForm.name} onChange={handleEventFormChange} required
                  placeholder="e.g. Grown Folks Game Night" />
              </label>
              <label className="ga-field">Event type
                <select className="ga-select" name="eventType" value={eventForm.eventType} onChange={handleEventFormChange}>
                  {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="ga-field">Capacity
                <input className="ga-input" type="number" name="capacity" value={eventForm.capacity} onChange={handleEventFormChange} required min="1" />
                <small>Total people the room holds.</small>
              </label>
              <label className="ga-field">Starts
                <input className="ga-input" type="datetime-local" name="date" value={eventForm.date} onChange={handleEventFormChange} required />
              </label>
              <label className="ga-field">Ends
                <input className="ga-input" type="datetime-local" name="endDate" value={eventForm.endDate} onChange={handleEventFormChange} />
              </label>
              <label className="ga-field ga-span-2">Description
                <textarea className="ga-textarea" name="description" value={eventForm.description} onChange={handleEventFormChange} required rows={5}
                  placeholder="What the night is, who it's for, and what to expect." />
              </label>
            </div>
          </div>

          <div className="ga-card">
            <h3 className="ga-card-title">Where</h3>
            <div className="ga-form-grid" style={{ marginTop: 14 }}>
              <label className="ga-field">Venue name
                <input className="ga-input" type="text" name="locationName" value={eventForm.locationName} onChange={handleEventFormChange} placeholder="e.g. Aromas Tea Bar" />
              </label>
              <label className="ga-field">Street address
                <input className="ga-input" type="text" name="locationAddress" value={eventForm.locationAddress} onChange={handleEventFormChange} placeholder="e.g. 141 Mangum St SW" />
              </label>
              <label className="ga-field">City
                <input className="ga-input" type="text" name="locationCity" value={eventForm.locationCity} onChange={handleEventFormChange} />
              </label>
              <label className="ga-field">State
                <input className="ga-input" type="text" name="locationState" value={eventForm.locationState} onChange={handleEventFormChange} maxLength="2" />
              </label>
            </div>
          </div>

          <div className="ga-card">
            <h3 className="ga-card-title">Cover photo</h3>
            <div className="ga-row" style={{ gap: 14, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <label className="ga-btn" style={{ cursor: 'pointer' }}>
                {imagePreview ? 'Change photo' : 'Choose photo'}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
              <span className="ga-small ga-muted">JPEG, PNG or WEBP. A wide photo works best.</span>
            </div>
            {imagePreview && (
              <div style={{ position: 'relative', marginTop: 14, maxWidth: 360 }}>
                <img src={imagePreview} alt="Cover preview" style={{ display: 'block', width: '100%', borderRadius: 10 }} />
                <button type="button" className="ga-btn ga-btn-sm" style={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => { setImageFile(null); setImagePreview(null); }}>Remove</button>
              </div>
            )}
          </div>

          <div className="ga-card">
            <div className="ga-card-head">
              <h3 className="ga-card-title">Tickets</h3>
              <button type="button" className="ga-btn ga-btn-sm" onClick={addTicket}>＋ Add ticket type</button>
            </div>
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="ga-form-grid ga-tier">
                <label className="ga-field">Ticket name
                  <input className="ga-input" type="text" placeholder="e.g. General Admission" value={ticket.name}
                    onChange={(e) => updateTicket(index, 'name', e.target.value)} required />
                </label>
                <label className="ga-field">Price ($)
                  <input className="ga-input" type="number" min="0" step="0.01" placeholder="25.00"
                    value={ticket.price === '' || ticket.price == null ? '' : ticket.price / 100}
                    onChange={(e) => updateTicket(index, 'price', e.target.value === '' ? '' : Math.round(Number(e.target.value) * 100))} required />
                </label>
                <label className="ga-field">How many
                  <input className="ga-input" type="number" min="0" placeholder="e.g. 36" value={ticket.quantity || ''}
                    onChange={(e) => updateTicket(index, 'quantity', Number(e.target.value))} required />
                </label>
                <label className="ga-field">What's included <small>(optional)</small>
                  <input className="ga-input" type="text" placeholder="e.g. Includes one mocktail" value={ticket.description || ''}
                    onChange={(e) => updateTicket(index, 'description', e.target.value)} />
                </label>
                {ticketTypes.length > 1 && (
                  <div className="ga-span-2"><button type="button" className="ga-link" onClick={() => removeTicket(index)}>Remove this ticket type</button></div>
                )}
              </div>
            ))}
          </div>

          <div className="ga-card">
            <div className="ga-card-head">
              <h3 className="ga-card-title">Codes just for this event <small className="ga-muted" style={{ fontFamily: 'inherit', fontSize: '0.8rem' }}>(optional)</small></h3>
              <button type="button" className="ga-btn ga-btn-sm" onClick={addPromo}>＋ Add code</button>
            </div>
            {promoCodes.length === 0 ? (
              <p className="ga-small ga-muted" style={{ margin: 0 }}>None. Codes from the Discount codes page still work at checkout.</p>
            ) : (
              promoCodes.map((promo, index) => (
                <div key={index} className="ga-form-grid ga-tier">
                  <label className="ga-field">Code
                    <input className="ga-input" type="text" placeholder="e.g. FRIENDS10" value={promo.code} style={{ textTransform: 'uppercase' }}
                      onChange={(e) => updatePromo(index, 'code', e.target.value.toUpperCase().trim())} required />
                  </label>
                  <label className="ga-field">Discount
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select className="ga-select" style={{ width: 70, flex: '0 0 70px' }} value={promo.discountType} onChange={(e) => updatePromo(index, 'discountType', e.target.value)}>
                        <option value="percent">%</option>
                        <option value="flat">$</option>
                      </select>
                      <input className="ga-input" type="number" min="0" step={promo.discountType === 'flat' ? '0.01' : '1'}
                        placeholder={promo.discountType === 'flat' ? '5.00' : '10'}
                        value={promo.discountValue === '' || promo.discountValue == null || promo.discountValue === 0 ? '' : promo.discountType === 'flat' ? promo.discountValue / 100 : promo.discountValue}
                        onChange={(e) => updatePromo(index, 'discountValue', e.target.value === '' ? 0 : promo.discountType === 'flat' ? Math.round(Number(e.target.value) * 100) : Number(e.target.value))} required />
                    </div>
                  </label>
                  <label className="ga-field">Max uses <small>(blank = no limit)</small>
                    <input className="ga-input" type="number" min="1" value={promo.maxUses || ''}
                      onChange={(e) => updatePromo(index, 'maxUses', e.target.value ? Number(e.target.value) : '')} />
                  </label>
                  <label className="ga-field">Expires <small>(optional)</small>
                    <input className="ga-input" type="date" value={promo.expiresAt ? promo.expiresAt.substring(0, 10) : ''}
                      onChange={(e) => updatePromo(index, 'expiresAt', e.target.value)} />
                  </label>
                  <div className="ga-row ga-span-2" style={{ gap: 16, alignItems: 'center' }}>
                    <label className="ga-check">
                      <input type="checkbox" checked={promo.active} onChange={(e) => updatePromo(index, 'active', e.target.checked)} />
                      <span>Active</span>
                    </label>
                    <button type="button" className="ga-link" onClick={() => removePromo(index)}>Remove code</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="ga-card">
            <h3 className="ga-card-title">Publishing</h3>
            <div className="ga-form-grid" style={{ marginTop: 14 }}>
              <label className="ga-field">Status
                <select className="ga-select" name="status" value={eventForm.status} onChange={handleEventFormChange}>
                  <option value="published">Published: shows on the website</option>
                  <option value="draft">Draft: only you can see it</option>
                </select>
              </label>
              <label className="ga-field">Sponsor <small>(optional)</small>
                <input className="ga-input" type="text" name="featuredSponsor" value={eventForm.featuredSponsor} onChange={handleEventFormChange} placeholder="e.g. Lip Print" />
              </label>
              <label className="ga-check ga-span-2">
                <input type="checkbox" name="isFree" checked={eventForm.isFree} onChange={handleEventFormChange} />
                <span>This is a free event</span>
              </label>
            </div>
          </div>

          <div className="ga-event-actions">
            <button type="button" className="ga-btn" onClick={() => { resetEventForm(); setActiveTab('events'); }}>Cancel</button>
            <button type="submit" disabled={eventLoading} className="ga-btn ga-btn-navy">
              {eventLoading ? 'Saving…' : editingEvent ? 'Save changes' : 'Publish event'}
            </button>
          </div>
        </form>
      )}
      </main>
    </div>
  );
};

export default AdminDashboard;