import React, { useCallback, useEffect, useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';
import { fmtDate } from '../../Services/adminApi';
import AffiliateNote from '../AffiliateNote';
import '../../Styles/BlogPost.css';

// Blog: write, edit and remove posts on /blog. No coding needed.
const API = `${BACKEND_URL}/api/articles`;

const call = async (path = '', { method = 'GET', body } = {}) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) throw new Error('Your login expired. Please log out and log back in.');
  if (!res.ok) throw new Error(data.error || data.message || 'Something went wrong. Please try again.');
  return data;
};

const slugify = (s) => String(s || '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const BLANK = {
  title: '', slug: '', excerpt: '', category: 'General', content: '',
  imageUrl: '', imageAlt: '', imageCaption: '', pinImageUrl: '', affiliate: false, publishedAt: today(),
};

const toForm = (a) => ({
  ...BLANK,
  ...Object.fromEntries(Object.keys(BLANK).map((k) => [k, a[k] ?? BLANK[k]])),
  publishedAt: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-CA', { timeZone: 'America/New_York' }) : today(),
});

// Upload a picture to Cloudinary (same signed upload the Perform form uses)
const uploadImage = async (file) => {
  const sig = await fetch(`${BACKEND_URL}/api/artists/upload-signature`).then((r) => r.json());
  if (!sig.signature) throw new Error(sig.error || "Uploads aren't set up yet.");
  const data = new FormData();
  data.append('file', file);
  data.append('api_key', sig.apiKey);
  data.append('timestamp', sig.timestamp);
  data.append('folder', sig.folder);
  data.append('signature', sig.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: data });
  const out = await res.json().catch(() => ({}));
  if (!out.secure_url) throw new Error("That picture didn't upload. Try a JPG or PNG.");
  return out.secure_url;
};

const ImageField = ({ label, hint, value, onChange }) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setErr('');
    try { onChange(await uploadImage(file)); } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  return (
    <div className="ga-field">{label}
      <div className="ga-row" style={{ gap: 8, alignItems: 'center' }}>
        <input className="ga-input" style={{ flex: 1 }} value={value} placeholder="https://… or upload" onChange={(e) => onChange(e.target.value)} />
        <label className="ga-btn ga-btn-sm" style={{ cursor: 'pointer' }}>
          {busy ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} disabled={busy} />
        </label>
      </div>
      {hint && <small>{hint}</small>}
      {err && <small style={{ color: '#b42318' }}>{err}</small>}
      {value && <img src={value} alt="" style={{ marginTop: 8, maxWidth: 180, maxHeight: 140, borderRadius: 6, objectFit: 'cover' }} />}
    </div>
  );
};

const PostDrawer = ({ editing, onClose, onSaved }) => {
  const [f, setF] = useState(() => (editing ? toForm(editing) : BLANK));
  const [slugTouched, setSlugTouched] = useState(!!editing);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => {
    const v = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setF((p) => {
      const next = { ...p, [k]: v };
      if (k === 'title' && !slugTouched) next.slug = slugify(v);
      return next;
    });
  };

  // A post file (.json with every field, or .html with just the body)
  const importFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      if (/\.json$/i.test(file.name)) {
        try {
          const data = JSON.parse(text);
          setF((p) => ({ ...p, ...Object.fromEntries(Object.keys(BLANK).filter((k) => data[k] !== undefined).map((k) => [k, data[k]])) }));
          if (data.slug) setSlugTouched(true);
          setError('');
        } catch { setError("That file isn't a post file I can read."); }
      } else {
        setF((p) => ({ ...p, content: text }));
      }
    };
    reader.readAsText(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!f.content.trim()) return setError('Add the post itself.');
    setSaving(true);
    try {
      const body = { ...f, slug: slugify(f.slug || f.title), publishedAt: f.publishedAt ? `${f.publishedAt}T12:00:00` : undefined };
      const r = editing
        ? await call(`/${editing._id}`, { method: 'PATCH', body })
        : await call('', { method: 'POST', body });
      onSaved(r, editing ? 'saved' : 'published');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="ga-drawer-back" role="dialog" aria-modal="true" aria-labelledby="post-title" onClick={onClose}>
      <form className="ga-drawer" style={{ width: 'min(760px, 100%)' }} onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <div className="ga-drawer-head">
          <div>
            <p className="ga-kicker">{editing ? 'Edit post' : 'New post'}</p>
            <h2 id="post-title" className="ga-card-title">{f.title || 'Write a blog post'}</h2>
          </div>
          <button type="button" className="ga-x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="ga-drawer-body">
          {error && <p className="ga-note err">{error}</p>}
          {!editing && (
            <p className="ga-note info">
              Have a post file from Claude? <label style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                Load it here<input type="file" accept=".json,.html,.htm" onChange={importFile} style={{ display: 'none' }} />
              </label> and every field fills in.
            </p>
          )}
          <label className="ga-field">Title
            <input className="ga-input" value={f.title} onChange={set('title')} maxLength={140} required />
          </label>
          <label className="ga-field">Link
            <input className="ga-input" value={f.slug} maxLength={90} onChange={(e) => { setSlugTouched(true); set('slug')(e); }} />
            <small>grownfolkscollective.com/blog/{slugify(f.slug || f.title) || '…'}</small>
          </label>
          <label className="ga-field">Short summary <small>(shows on the blog page and in Google)</small>
            <textarea className="ga-textarea" rows={3} value={f.excerpt} onChange={set('excerpt')} maxLength={300} required />
            <small>{f.excerpt.length}/300</small>
          </label>
          <div className="ga-form-grid">
            <label className="ga-field">Category
              <input className="ga-input" value={f.category} onChange={set('category')} maxLength={40} />
            </label>
            <label className="ga-field">Publish date
              <input className="ga-input" type="date" value={f.publishedAt} onChange={set('publishedAt')} />
            </label>
          </div>
          <ImageField label="Cover picture" hint="Wide picture at the top of the post (1600 × 900 works best)." value={f.imageUrl} onChange={set('imageUrl')} />
          <div className="ga-form-grid">
            <label className="ga-field">Picture description <small>(for screen readers)</small>
              <input className="ga-input" value={f.imageAlt} onChange={set('imageAlt')} maxLength={200} />
            </label>
            <label className="ga-field">Caption <small>(optional)</small>
              <input className="ga-input" value={f.imageCaption} onChange={set('imageCaption')} maxLength={200} />
            </label>
          </div>
          <ImageField label="Pinterest picture (optional)" hint="Tall picture for the Save to Pinterest button (1000 × 1500)." value={f.pinImageUrl} onChange={set('pinImageUrl')} />
          <label className="ga-check">
            <input type="checkbox" checked={f.affiliate} onChange={set('affiliate')} />
            This post has affiliate links (shows the “we may earn a commission” note at the top)
          </label>
          <div className="ga-field">
            <div className="ga-row" style={{ justifyContent: 'space-between' }}>
              <span>The post</span>
              <div className="ga-seg" role="tablist" aria-label="Write or preview">
                <button type="button" role="tab" aria-selected={!preview} className={!preview ? 'on' : ''} onClick={() => setPreview(false)}>Write</button>
                <button type="button" role="tab" aria-selected={preview} className={preview ? 'on' : ''} onClick={() => setPreview(true)}>Preview</button>
              </div>
            </div>
            {preview ? (
              <div className="editorial-page" style={{ padding: 20, minHeight: 0, borderRadius: 8, maxHeight: 520, overflow: 'auto', fontWeight: 400 }}>
                {f.affiliate && <AffiliateNote />}
                <div className="editorial-body-content" dangerouslySetInnerHTML={{ __html: f.content }} />
              </div>
            ) : (
              <textarea className="ga-textarea" rows={16} style={{ fontFamily: 'monospace', fontSize: 13 }} value={f.content} onChange={set('content')}
                placeholder="<p>Write here. Use <h2> for headings and <p> for paragraphs.</p>" />
            )}
          </div>
        </div>
        <div className="ga-drawer-foot">
          <button type="button" className="ga-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ga-btn ga-btn-navy" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish post'}</button>
        </div>
      </form>
    </div>
  );
};

const AdminBlog = () => {
  const [posts, setPosts] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    call().then(setPosts).catch((e) => { setPosts([]); setNote({ type: 'err', text: e.message }); });
  }, []);
  useEffect(load, [load]);

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.title}”? This takes it off the blog for good.`)) return;
    setBusy(p._id);
    try {
      await call(`/${p._id}`, { method: 'DELETE' });
      setNote({ type: 'info', text: 'Post deleted.' });
      load();
    } catch (e) { setNote({ type: 'err', text: e.message }); }
    setBusy('');
  };

  return (
    <div>
      {note && <p className={`ga-note ${note.type}`} role="status">{note.text}</p>}
      <div className="ga-card">
        <div className="ga-card-head">
          <h2 className="ga-card-title">Posts</h2>
          <button type="button" className="ga-btn ga-btn-gold" onClick={() => setDrawer({})}>＋ New post</button>
        </div>
        {!posts ? <div className="ga-loading">Loading posts…</div> : posts.length === 0 ? (
          <div className="ga-empty">No posts yet.</div>
        ) : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>Post</th><th>Category</th><th>Date</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.title}</strong>
                      <div className="ga-small ga-muted" style={{ marginTop: 4 }}>/blog/{p.slug}</div>
                      {p.affiliate && <span className="ga-pill gold" style={{ marginTop: 4 }}>Affiliate links</span>}
                    </td>
                    <td className="ga-small">{p.category}</td>
                    <td className="ga-small">{fmtDate(p.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                      <div className="ga-row" style={{ justifyContent: 'flex-end', gap: 6, flexWrap: 'nowrap' }}>
                        <a className="ga-btn ga-btn-sm" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">View</a>
                        <button type="button" className="ga-btn ga-btn-sm" onClick={() => setDrawer({ editing: p })}>Edit</button>
                        <button type="button" className="ga-btn ga-btn-sm ga-btn-danger" onClick={() => remove(p)} disabled={busy === p._id}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {drawer && (
        <PostDrawer
          editing={drawer.editing}
          onClose={() => setDrawer(null)}
          onSaved={(p, how) => { setDrawer(null); setNote({ type: 'info', text: `“${p.title}” ${how}.` }); load(); }}
        />
      )}
    </div>
  );
};

export default AdminBlog;
