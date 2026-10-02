import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MemberPerksPartner from "../Components/MemberPerksPartner";
import "../Styles/Partnership.css";

// /partnerships/perks: local businesses offer GFC members a discount (free to join)
const MemberPerks = () => (
  <div className="partnership-page">
    <Helmet>
      <title>Offer a Member Perk | Grown Folks™ Collective</title>
      <meta
        name="description"
        content="Atlanta business owners: offer Grown Folks™ Collective members an exclusive discount. Free to join, no contract. Get featured to Atlanta adults 30+ who love to support local."
      />
      <link rel="canonical" href="https://www.grownfolkscollective.com/partnerships/perks" />
    </Helmet>

    <header className="perks-hero">
      <div className="perks-hero-inner">
        <span className="location-tag">For Local Businesses · Free to Join</span>
        <h1 className="playfair perks-hero-title">Offer a Member Perk</h1>
        <div className="perks-hero-bar" aria-hidden="true" />
        <p className="perks-hero-lead">
          Give Grown Folks™ Collective members an exclusive discount and bring new regulars through your
          door. Our members are Atlanta adults 30+ who love to support local. No fee, no contract.
        </p>
        <a href="#perk-form" className="perks-hero-btn">Get Started</a>
        <p className="perks-hero-alt">
          Looking to sponsor an event instead? <Link to="/partnerships">See partnership levels</Link>
        </p>
      </div>
    </header>

    <MemberPerksPartner standalone />
  </div>
);

export default MemberPerks;
