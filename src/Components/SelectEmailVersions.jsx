import React from "react";

// Admin: write one GFC Select™ email, or a men's and a women's version.
// versions = { base: {subject, message}, man: {...}, woman: {...} }
// When split is on, men get `man`, women get `woman`, and anyone who didn't
// say man or woman gets `base`.

export const emailPayload = (split, versions) =>
  split
    ? { subject: versions.base.subject, message: versions.base.message, men: versions.man, women: versions.woman }
    : { subject: versions.base.subject, message: versions.base.message };

export const hasPlaceholder = (split, versions, re) =>
  (split ? [versions.base, versions.man, versions.woman] : [versions.base]).some((v) => re.test(v.message || ""));

const Editor = ({ label, value, onChange, previewName, rows = 10 }) => {
  const fill = (t) => String(t || "").replace(/\{firstName\}/g, previewName);
  return (
    <div className="sel-adm-version">
      {label && <h5 className="sel-adm-sub">{label}</h5>}
      <label className="sel-adm-label">
        Subject
        <input className="search-input" value={value.subject} onChange={(e) => onChange({ ...value, subject: e.target.value })} maxLength={200} />
      </label>
      <label className="sel-adm-label">
        Message
        <textarea className="search-input sel-adm-message" value={value.message} onChange={(e) => onChange({ ...value, message: e.target.value })} rows={rows} />
      </label>
      <div className="sel-adm-preview" aria-label={`Preview: ${label || "email"}`}>
        <span className="sel-adm-detail-label">Preview for {previewName}</span>
        <strong>{fill(value.subject)}</strong>
        <p>{fill(value.message)}</p>
      </div>
    </div>
  );
};

const SelectEmailVersions = ({ split, setSplit, versions, setVersions, names = {}, counts = {} }) => {
  const set = (key) => (v) => setVersions((prev) => ({ ...prev, [key]: v }));
  return (
    <>
      <label className="sel-adm-split">
        <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />
        <span>
          Write a different version for men and women
          {split && (
            <span className="td-muted">
              {" "}· {counts.man || 0} men get the men's version, {counts.woman || 0} women get the women's
              {counts.other ? `, ${counts.other} without an answer get the main one` : ""}
            </span>
          )}
        </span>
      </label>

      {split ? (
        <div className="sel-adm-versions">
          <Editor label="For the men" value={versions.man} onChange={set("man")} previewName={names.man || "Marcus"} />
          <Editor label="For the women" value={versions.woman} onChange={set("woman")} previewName={names.woman || "Keisha"} />
          {counts.other > 0 && (
            <Editor label="Main version (didn't say man or woman)" value={versions.base} onChange={set("base")} previewName={names.other || "Jordan"} rows={6} />
          )}
        </div>
      ) : (
        <Editor value={versions.base} onChange={set("base")} previewName={names.any || "Jordan"} />
      )}
    </>
  );
};

export default SelectEmailVersions;
