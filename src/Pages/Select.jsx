import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SelectTopbar, SelectFooter } from "../Components/SelectFrame";
import "../Styles/Select.css";

// GFC Select™ landing: one screen only. Everything else lives behind the
// envelope on /select/invitation.
const Select = () => (
  <div className="select-page">
    <Helmet>
      <title>GFC Select™ | A Masquerade Night for Atlanta's 30+ Singles</title>
      <meta
        name="description"
        content="Done swiping? GFC Select™ is a masquerade night for Atlanta singles 30 and over. No dating apps, no speed dating. Forty hand-selected guests, one secret location. Open your invitation."
      />
      <link rel="canonical" href="https://www.grownfolkscollective.com/select" />
    </Helmet>

    <SelectTopbar />
    <section className="select-hero select-hero-full" aria-labelledby="select-title">
      <div className="select-hero-photo" aria-hidden="true" />
      <div className="select-hero-shade" aria-hidden="true" />
      <div className="select-hero-inner">
        <p className="select-eyebrow">Grown Folks™ Collective presents</p>
        <h1 id="select-title" className="select-title">
          GFC Select<span className="select-tm">™</span>
        </h1>
        <p className="select-tagline">Put the phone down. Pick the mask up.</p>
        <p className="select-lead">
          A masquerade night for Atlanta's 30+ singles. No swiping. No speed dating. Just a night
          of fun and the kind of connection no app can give you.
        </p>
        <Link to="/select/invitation" className="select-btn">Open Your Invitation</Link>
        <p className="select-launch">40 seats · January 2027 · By invitation only</p>
      </div>
    </section>
    <SelectFooter />
  </div>
);

export default Select;
