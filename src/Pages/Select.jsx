import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SelectTopbar, SelectFooter } from "../Components/SelectFrame";
import SelectNotify, { useSelectStatus, fmtDoorDate, daysLeft } from "../Components/SelectNotify";
import "../Styles/Select.css";

// GFC Select™ landing: one screen only.
// Doors open    -> "Open Your Invitation" + countdown
// Doors not open -> "Notify me" form (applications are hidden)
const Select = () => {
  const status = useSelectStatus();
  const open = status.state === "open";
  const left = daysLeft(status.closesAt);

  return (
    <div className="select-page">
      <Helmet>
        <title>GFC Select™ | A Masquerade Night for Atlanta's 30+ Singles</title>
        <meta
          name="description"
          content="Done swiping? GFC Select™ is a masquerade night for Atlanta singles 30 and over. No dating apps, no speed dating. Forty hand-selected guests, one secret location. Doors open for two weeks only."
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

          {status.state === "loading" ? (
            <div className="select-hero-placeholder" aria-hidden="true" />
          ) : open ? (
            <>
              <p className="select-doors select-doors-open">
                The doors are open
                {left !== null && (
                  <> · <strong>{left === 0 ? "closing today" : `${left} ${left === 1 ? "day" : "days"} left`}</strong></>
                )}
              </p>
              <Link to="/select/invitation" className="select-btn">Open Your Invitation</Link>
            </>
          ) : (
            <>
              <p className="select-doors">
                {status.state === "closed"
                  ? "The doors are closed for this round. Be the first to know when they open again."
                  : status.opensAt
                    ? <>The doors open <strong>{fmtDoorDate(status.opensAt)}</strong>, for two weeks only.</>
                    : "The doors open soon, for two weeks only. Be the first to know."}
              </p>
              <SelectNotify compact />
              <Link to="/select/invitation" className="select-peek">Peek inside the invitation →</Link>
            </>
          )}

          <p className="select-launch">40 seats · January 2027 · By invitation only</p>
        </div>
      </section>
      <SelectFooter />
    </div>
  );
};

export default Select;
