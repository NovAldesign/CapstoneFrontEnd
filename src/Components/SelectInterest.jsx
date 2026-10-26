import React from 'react';
import '../Styles/SelectInterest.css';

// "Tell me about GFC Select™" opt-in on newsletter signups.
// Ticked: the backend adds them to the GFC Select™ notify list (its own list in
// the dashboard: GFC Select™ → The doors & notify list).
const SelectInterest = ({ idPrefix, checked, gender, onChange }) => (
  <div className="select-interest">
    <label className="select-interest-check" htmlFor={`${idPrefix}-select`}>
      <input
        id={`${idPrefix}-select`}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange({ checked: e.target.checked, gender })}
      />
      <span>
        Tell me about <strong>GFC Select&trade;</strong>, our invitation-only night for single grown folks, 30+.{' '}
        <a href="/select" target="_blank" rel="noopener noreferrer">What's this?</a>
      </span>
    </label>
    {checked && (
      <div className="select-interest-gender" role="radiogroup" aria-label="I am a">
        <span>I'm a:</span>
        {[['man', 'Man'], ['woman', 'Woman']].map(([v, label]) => (
          <label key={v} className={gender === v ? 'on' : ''}>
            <input
              type="radio"
              name={`${idPrefix}-select-gender`}
              value={v}
              checked={gender === v}
              onChange={() => onChange({ checked, gender: v })}
            />
            {label}
          </label>
        ))}
      </div>
    )}
  </div>
);

export default SelectInterest;
