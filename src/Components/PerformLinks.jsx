import React from 'react';
import { Link } from 'react-router-dom';

// Links between the four "Perform" pages, so every page reaches the other three.
// Also used in the navbar's Perform menu.
export const PERFORM_PAGES = [
  { to: '/perform', label: 'Artists & Musicians', text: 'Singer or musician? Apply to perform →' },
  { to: '/perform/art', label: 'Live Artists', text: 'Painter or sketch artist? Apply to create live →' },
  { to: '/perform/host', label: 'Hosts', text: 'Want to host the night? Apply to host →' },
  { to: '/scouts', label: 'Industry Scouts', text: 'Label, manager, or A&R? Join our scout list →' },
];

const PerformLinks = ({ current }) => (
  <>
    {PERFORM_PAGES.filter((p) => p.to !== current).map((p) => (
      <p key={p.to} className="perform-switch"><Link to={p.to}>{p.text}</Link></p>
    ))}
  </>
);

export default PerformLinks;
