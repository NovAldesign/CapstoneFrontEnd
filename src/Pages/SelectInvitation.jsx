import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BACKEND_URL } from "../Services/eventUtils";
import { SelectTopbar, SelectFooter } from "../Components/SelectFrame";
import SelectNotify, { useSelectStatus, fmtDoorDate, daysLeft } from "../Components/SelectNotify";
import {
  VALUES, SCALE, LOVE, CONNECT, KIDS_HAVE, KIDS_WANT, NIGHT_GOAL, giveLoveAsk, receiveLoveAsk,
} from "../Services/selectQuestions";
import { GENTLEMEN, LADIES } from "../Services/selectCopy";
import "../Styles/Select.css";

// Keep these lists in sync with the backend (routes/selectRoutes.js)
const BINGO_PROMPTS = [
  "A place I've traveled that changed me",
  "My go-to karaoke or 90s R&B song",
  "A hidden talent",
  "The dish I cook best",
  "Something I'm learning right now",
  "My favorite Atlanta spot",
  "A fun fact most people don't know about me",
  "My love language",
  "The last concert or show I went to",
  "The movie or show I can watch on repeat",
];
const ALLERGIES = ["Peanuts", "Tree nuts", "Shellfish", "Fish", "Dairy", "Eggs", "Gluten", "Soy", "Sesame"];
const DIETS = ["Vegetarian", "Vegan", "Pescatarian", "Halal", "No pork"];
const LOOKING_FOR = [
  "A long-term relationship",
  "Marriage",
  "Dating with intention",
  "Open to seeing where it goes",
];

const STEPS = [
  { n: "I", title: "Request", text: "Tell us who you are, what you value and how you connect. It takes about 12 minutes." },
  { n: "II", title: "Selection", text: "Every guest is chosen by hand. Twenty men, twenty women, balanced by age." },
  { n: "III", title: "Invitation", text: "Selected guests receive the date, that evening's dress code and how to reserve a seat." },
  { n: "IV", title: "The Reveal", text: "The location is shared with selected guests 48 hours before." },
];

const RULES = [
  "Singles, 30 and over. Valid photo ID required at the door",
  "Camera-free: your phone's camera is sealed at check-in. Break the seal and you leave",
  "What happens at Select stays at Select. No names, no posts, no tags",
  "No plus-ones. Every seat is selected and non-transferable",
  "Follow the evening's dress code or you will not be admitted",
  "No refunds. Your seat is final once reserved",
  "Disrespect, harassment or unwanted contact gets you removed and banned",
  "Alcohol-free. Arrive sober or you will not be admitted",
];

const FAQS = [
  {
    q: "Is this a dating app thing?",
    a: "It's the opposite. GFC Select™ is for people who are done swiping. No profiles, no messages that go nowhere. Just a real room with real people, all single and all ready to meet someone.",
  },
  {
    q: "Where is it held?",
    a: "Somewhere in Atlanta worth dressing up for. The location stays private and is shared only with selected guests, 48 hours before the evening.",
  },
  {
    q: "Is this speed dating?",
    a: "Not even close. No timers, no bells, no rotating chairs, no scorecards. GFC Select™ is a night out first: games, good food and forty interesting people. Connections happen the way they're supposed to, naturally.",
  },
  {
    q: "Can I bring a friend?",
    a: "Not as a plus-one. Every guest is selected on their own. If a friend is applying too, add their name to your request and we'll do our best to seat you at the same evening. After you attend, you can also refer one person for a future Select.",
  },
  {
    q: "How much is it?",
    a: "Pricing is shared with selected guests in their invitation.",
  },
  {
    q: "What should I wear?",
    a: "Every evening has its own dress code. You'll find it in your invitation.",
  },
  {
    q: "Is it alcohol-free?",
    a: "Yes. Like every Grown Folks™ Collective experience, GFC Select™ is alcohol-free. Food is served, which is why we ask about allergies.",
  },
  {
    q: "Who sees my answers?",
    a: "Only the GFC team. Your answers help us build a balanced room and plan the evening. We never share them.",
  },
];

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthdate: "",
  gender: "",
  area: "",
  occupation: "",
  instagram: "",
  heardFrom: "",
  referredBy: "",
  friendName: "",
  friendEmail: "",
  friendGender: "",
  lookingFor: "",
  hasKids: "",
  wantsKids: "",
  ageMin: "",
  ageMax: "",
  nightGoal: "",
  values: {},
  valuesWhy: "",
  social: "",
  conflict: "",
  pace: "",
  roles: "",
  weekend: "",
  giveLove: [],
  receiveLove: [],
  isSingle: false,
  whyNow: "",
  firstDate: "",
  matters: "",
  learnLater: "",
  allergies: [],
  allergyOther: "",
  diet: [],
  agreed: false,
  website: "", // bots only
};

// One collapsible step of the request form
const FormStep = ({ index, title, done, optional, open, onToggle, onNext, nextLabel, children }) => {
  const headId = `select-step-head-${index}`;
  const bodyId = `select-step-body-${index}`;
  return (
    <div className={`select-acc ${open ? "is-open" : ""} ${done ? "is-done" : ""}`}>
      <h3 className="select-acc-h">
        <button
          type="button"
          id={headId}
          className="select-acc-head"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          <span className="select-acc-num" aria-hidden="true">{done ? "✓" : index + 1}</span>
          <span className="select-acc-title">{title}</span>
          <span className="select-acc-status">
            {done ? "Complete" : optional ? "Optional" : "Required"}
          </span>
          <span className="select-acc-chev" aria-hidden="true" />
        </button>
      </h3>
      <div id={bodyId} role="region" aria-labelledby={headId} hidden={!open} className="select-acc-body">
        {children}
        {onNext && (
          <button type="button" className="select-acc-next" onClick={onNext}>
            {nextLabel || "Continue"}
          </button>
        )}
      </div>
    </div>
  );
};

const SelectInvitation = () => {
  const doors = useSelectStatus();
  const doorsOpen = doors.state === "open";
  const left = daysLeft(doors.closesAt);
  const [params] = useSearchParams();
  // Arriving from /select/gentlemen or /select/ladies: Man or Woman already chosen
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    gender: ["man", "woman"].includes(params.get("g")) ? params.get("g") : "",
  }));
  const [bingo, setBingo] = useState({}); // { prompt: answer }
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(params.get("open") === "1");
  const [revealed, setRevealed] = useState(params.get("open") === "1");
  const letterRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0); // which form section is open (-1 = none)
  const [sawFood, setSawFood] = useState(false); // "At the table" is optional; done once they've seen it
  const formTopRef = useRef(null);

  const enterRoom = () => {
    setReady(true);
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      formTopRef.current?.focus({ preventScroll: true });
    }, 50);
  };

  // Break the seal: flap opens, card rises, then the details appear
  const openEnvelope = () => {
    if (opened) return;
    setOpened(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => setRevealed(true), reduce ? 0 : 1300);
  };

  useEffect(() => {
    if (revealed && opened && letterRef.current) {
      letterRef.current.focus({ preventScroll: true });
      letterRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [revealed, opened]);

  const bingoCount = useMemo(
    () => Object.values(bingo).filter((a) => a.trim()).length,
    [bingo]
  );

  const update = (e) => {
    if (error) setError("");
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggle = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((x) => x !== value)
        : [...prev[field], value],
    }));

  const setValue = (key, n) => {
    if (error) setError("");
    setForm((prev) => ({ ...prev, values: { ...prev.values, [key]: n } }));
  };
  const setChoice = (name, key) => {
    if (error) setError("");
    setForm((prev) => ({ ...prev, [name]: key }));
  };
  // Pick up to 2 (love languages)
  const togglePick = (field, key) => {
    if (error) setError("");
    setForm((prev) => {
      const has = prev[field].includes(key);
      if (!has && prev[field].length >= 2) return prev;
      return { ...prev, [field]: has ? prev[field].filter((x) => x !== key) : [...prev[field], key] };
    });
  };
  const ratedCount = VALUES.filter((v) => form.values[v.key]).length;
  const agesOk = Number(form.ageMin) >= 30 && Number(form.ageMax) >= Number(form.ageMin) && Number(form.ageMax) <= 99;

  const setAnswer = (prompt, answer) => {
    if (error) setError("");
    setBingo((prev) => ({ ...prev, [prompt]: answer }));
  };

  const stepDone = [
    Boolean(form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.phone.trim() && form.birthdate && form.gender),
    Boolean(form.isSingle && form.lookingFor && form.hasKids && form.wantsKids && agesOk && form.nightGoal),
    ratedCount === VALUES.length,
    Boolean(CONNECT.every((q) => form[q.key]) && form.giveLove.length === 2 && form.receiveLove.length === 2),
    bingoCount === 5,
    sawFood, // optional: done once they've looked at it
    form.agreed,
  ];

  const openStep = (i) => {
    setStep(i);
    if (i >= 5) setSawFood(true);
    setTimeout(() => {
      document.getElementById(`select-step-head-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };
  const toggleStep = (i) => (step === i ? setStep(-1) : openStep(i));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!stepDone[0]) {
      openStep(0);
      return setError("Please finish \"About you\": name, email, phone, birthdate and man or woman.");
    }
    // The friend's email only counts while their name is filled in (the field hides otherwise)
    const friendEmail = form.friendName.trim() ? form.friendEmail.trim() : "";
    if (friendEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
      openStep(0);
      return setError("Your friend's email is missing something (like name@gmail.com). Fix it, or clear it to skip the invite.");
    }
    if (friendEmail && friendEmail.toLowerCase() === form.email.trim().toLowerCase()) {
      openStep(0);
      return setError("That's your own email in the friend box. Add your friend's email, or clear it.");
    }
    if (friendEmail && !form.friendGender) {
      openStep(0);
      return setError("Let us know if your friend is a man or a woman.");
    }
    if (!form.isSingle) {
      openStep(1);
      return setError("GFC Select™ is for singles only.");
    }
    if (!stepDone[1]) {
      openStep(1);
      return setError(agesOk || !form.ageMin
        ? "Please finish \"Your heart\": what you're looking for, kids, the ages you'd date and your goal for the night."
        : "Please check the ages you'd date: 30 or older, and the first number no higher than the second.");
    }
    if (!stepDone[2]) {
      openStep(2);
      return setError(`Please rate all ${VALUES.length} values (${ratedCount} of ${VALUES.length} done).`);
    }
    if (!stepDone[3]) {
      openStep(3);
      return setError("Please answer every question in \"How you connect\", and pick 2 for each love question.");
    }
    if (bingoCount !== 5) {
      openStep(4);
      return setError("Please answer 5 of the fun-fact prompts.");
    }
    if (!form.agreed) {
      openStep(6);
      return setError("Please agree to the house rules.");
    }

    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/select/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          friendEmail: form.friendName.trim() ? form.friendEmail.trim() : "",
          friendGender: form.friendName.trim() && form.friendEmail.trim() ? form.friendGender : "",
          bingo: Object.entries(bingo)
            .filter(([, a]) => a.trim())
            .map(([prompt, answer]) => ({ prompt, answer })),
          source: params.get("src") || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSent(true);
      document.getElementById("select-request")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="select-page">
      <Helmet>
        <title>Your Invitation | GFC Select™</title>
        <meta
          name="description"
          content="GFC Select™ is a curated, alcohol-free masquerade evening for Atlanta singles 30 and over. Forty guests, each selected. No swiping, no speed-dating timers. Request an invitation."
        />
        <link rel="canonical" href="https://www.grownfolkscollective.com/select/invitation" />
      </Helmet>

      <SelectTopbar back={{ to: "/select", label: "← GFC Select™" }} />

      {/* THE ENVELOPE */}
      <section className="select-envelope-stage" aria-labelledby="select-env-title">
        <p className="select-eyebrow">GFC Select™</p>
        <h1 id="select-env-title" className="select-env-title">
          {opened ? "Welcome behind the mask." : "This invitation is for you."}
        </h1>
        <p className="select-env-sub">
          {opened
            ? "Read carefully. Seats are few."
            : "Only one way to see what's inside."}
        </p>

        <div className={`select-envelope ${opened ? "is-open" : ""}`}>
          <div className="select-env-back" aria-hidden="true" />
          <div className="select-env-card" aria-hidden="true">
            <span className="select-env-card-eyebrow">You are invited</span>
            <span className="select-env-card-title">GFC Select<span className="select-tm">™</span></span>
            <span className="select-env-card-line">A masquerade for Atlanta's 30+ singles</span>
          </div>
          <div className="select-env-front" aria-hidden="true" />
          <svg className="select-env-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0 L50 58 L100 0" />
            <path d="M0 100 L42 52 M100 100 L58 52" />
          </svg>
          <div className="select-env-flap" aria-hidden="true" />
          <button
            type="button"
            className="select-env-seal"
            onClick={openEnvelope}
            aria-label="Break the seal and open your invitation"
            disabled={opened}
          >
            GFC
          </button>
        </div>

        {!opened && (
          <button type="button" className="select-btn select-env-btn" onClick={openEnvelope}>
            Break the Seal
          </button>
        )}
      </section>

      {revealed && (
        <>
      {/* THE LETTER */}
      <section className="select-section select-letter-wrap" aria-labelledby="select-letter-title">
        <article className="select-letter" ref={letterRef} tabIndex={-1}>
          <p className="select-kicker">Your invitation</p>
          <h2 id="select-letter-title" className="select-h2">Put the phone down. Pick the mask up.</h2>
          <p>
            You've swiped. You've matched. You've had the same three conversations with strangers
            who never made it off the screen. You're done with that.
          </p>
          <p>
            GFC Select™ is a masquerade night for Atlanta's 30+ singles who would rather meet
            someone in a room than in an app. <strong>No speed dating.</strong> No timers, no
            bells, no awkward rotations. Just a night of fun, good food, games that break the ice
            for you, and the kind of connection you feel the moment you walk in.
          </p>
          <p>
            Here's the catch: there are only <strong>forty seats</strong>. Twenty for men. Twenty
            for women. Every guest is chosen by hand, the room is balanced by age, and the location
            stays secret until 48 hours before. Once the room is set, the doors close.
          </p>
          <p className="select-letter-sign">The first evening is January 2027. Read every word below before you decide.</p>
          <a href="#select-how" className="select-btn">Read the Details</a>
        </article>
      </section>

      {/* HOW IT WORKS */}
      <section className="select-section select-dark" aria-labelledby="select-how">
        <p className="select-kicker">Step by step</p>
        <h2 id="select-how" className="select-h2">How it works</h2>
        <ol className="select-steps">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="select-step-n" aria-hidden="true">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FOR THE GENTLEMEN */}
      <section className="select-section select-gents" aria-labelledby="select-gents">
        <p className="select-kicker">For the gentlemen</p>
        <h2 id="select-gents" className="select-h2">We're holding twenty seats for you.</h2>
        <p className="select-body">
          The apps haven't been kind to good men either. So here are straight answers to what you're probably wondering.
        </p>
        <ul className="select-gents-grid">
          {GENTLEMEN.map((g) => (
            <li key={g.title}>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </li>
          ))}
        </ul>
        <p className="select-gents-close">
          The room doesn't work without you. Twenty seats, filled with the right men.
        </p>
        <p className="select-gents-links">
          <a href="#select-gate-title" className="select-btn">I'm Interested</a>
        </p>
        <p className="select-gents-note">
          Applying with a friend? Add his name to your request and we'll do our best to seat you together.
        </p>
      </section>

      {/* FOR THE LADIES */}
      <section className="select-section select-gents select-ladies" aria-labelledby="select-ladies">
        <p className="select-kicker">For the ladies</p>
        <h2 id="select-ladies" className="select-h2">Twenty seats for women who know their worth.</h2>
        <p className="select-body">
          You deserve better than endless swiping and men who aren't serious. Here's how the room is built for you.
        </p>
        <ul className="select-gents-grid">
          {LADIES.map((g) => (
            <li key={g.title}>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </li>
          ))}
        </ul>
        <p className="select-gents-close">
          Come as you are. Leave knowing you were seen.
        </p>
        <p className="select-gents-links">
          <a href="#select-gate-title" className="select-btn">I'm Interested</a>
        </p>
        <p className="select-gents-note">
          Know a good man who belongs in the room? <Link to="/select/nominate?g=man" className="select-peek">Nominate him →</Link>
        </p>
      </section>

      {/* HOUSE RULES */}
      <section className="select-section select-rules-wrap" aria-labelledby="select-rules">
        <p className="select-kicker">Before you request</p>
        <h2 id="select-rules" className="select-h2">House rules</h2>
        <ul className="select-rules">
          {RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>

      {/* FAQ */}
      <section className="select-section select-faq-wrap" aria-labelledby="select-faq">
        <p className="select-kicker">Whispers</p>
        <h2 id="select-faq" className="select-h2">Questions</h2>
        <div className="select-faq">
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      {/* READY? */}
      <section className="select-section select-gate" aria-labelledby="select-gate-title">
        <p className="select-kicker">The moment of truth</p>
        <h2 id="select-gate-title" className="select-h2">Are you ready to enter the room?</h2>
        <p className="select-body">
          If you're single, 30 or older, done with the apps and ready to meet someone face to
          face, then this room was made for you.{doorsOpen ? " Step inside and request your seat." : ""}
        </p>
        {doors.state === "loading" ? null : !doorsOpen ? (
          <div className="select-gate-closed">
            <p className="select-doors">
              {doors.state === "closed"
                ? "The doors are closed for this round."
                : doors.opensAt
                  ? <>The doors open <strong>{fmtDoorDate(doors.opensAt)}</strong>, for two weeks only.</>
                  : "The doors open soon, for two weeks only."}
              {" "}Join the list and you'll be the first to know.
            </p>
            <SelectNotify />
          </div>
        ) : !ready ? (
          <>
            {left !== null && (
              <p className="select-doors select-doors-open">
                The doors close in <strong>{left === 0 ? "less than a day" : `${left} ${left === 1 ? "day" : "days"}`}</strong>.
              </p>
            )}
            <button type="button" className="select-btn" onClick={enterRoom}>
              I'm Ready. Enter the Room.
            </button>
          </>
        ) : (
          <p className="select-gate-done">The door is open. Your request is below.</p>
        )}
      </section>

      {/* REQUEST FORM (opens after "I'm Ready") */}
      {ready && doorsOpen && (
      <section id="select-request" className="select-section select-dark select-form-reveal" aria-labelledby="select-form-title" ref={formTopRef} tabIndex={-1}>
        <p className="select-kicker">Forty seats · By invitation only</p>
        <h2 id="select-form-title" className="select-h2">Request your seat</h2>

        {sent ? (
          <div className="select-sent" role="status">
            <p className="select-sent-seal" aria-hidden="true">GFC</p>
            <h3>Your request has been received.</h3>
            <p>
              Every guest is personally selected. If you're chosen, you'll receive an invitation
              by email with the date, the dress code and how to reserve your seat.
            </p>
            <p className="select-sent-small">Until then, keep it between us.</p>
          </div>
        ) : (
          <form className="select-form" onSubmit={submit} noValidate>
            <p className="select-private">
              Your answers are private and seen only by the GFC team. Fields marked * are required.
            </p>

            {/* ABOUT YOU */}
            <FormStep index={0} title="About you" done={stepDone[0]} open={step === 0} onToggle={() => toggleStep(0)} onNext={() => openStep(1)}>
            <fieldset>
              <legend className="select-sr">About you</legend>
              <div className="select-grid">
                <label>First name *<input name="firstName" value={form.firstName} onChange={update} required maxLength={40} autoComplete="given-name" /></label>
                <label>Last name *<input name="lastName" value={form.lastName} onChange={update} required maxLength={40} autoComplete="family-name" /></label>
                <label>Email *<input type="email" name="email" value={form.email} onChange={update} required maxLength={120} autoComplete="email" /></label>
                <label>Phone *<input type="tel" name="phone" value={form.phone} onChange={update} required maxLength={30} autoComplete="tel" /></label>
                <label>Birthdate *<input type="date" name="birthdate" value={form.birthdate} onChange={update} required /></label>
                <div className="select-radio-group" role="radiogroup" aria-label="I am a">
                  <span className="select-label-text">I am a *</span>
                  <div className="select-pills">
                    {[["man", "Man"], ["woman", "Woman"]].map(([v, l]) => (
                      <label key={v} className={`select-pill ${form.gender === v ? "on" : ""}`}>
                        <input type="radio" name="gender" value={v} checked={form.gender === v} onChange={update} required />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
                <label>Side of town<input name="area" value={form.area} onChange={update} maxLength={60} placeholder="e.g. Midtown, Southwest, East Atlanta" /></label>
                <label>What you do<input name="occupation" value={form.occupation} onChange={update} maxLength={80} /></label>
                <label><span>Instagram <span className="select-opt">(optional)</span></span><input name="instagram" value={form.instagram} onChange={update} maxLength={60} placeholder="@" /></label>
                <label>How did you hear about Select?<input name="heardFrom" value={form.heardFrom} onChange={update} maxLength={80} /></label>
                <label><span>Referred by a past guest? <span className="select-opt">(their name)</span></span><input name="referredBy" value={form.referredBy} onChange={update} maxLength={80} /></label>
                <label><span>Applying with a friend? <span className="select-opt">(their name)</span></span><input name="friendName" value={form.friendName} onChange={update} maxLength={80} /></label>
                {form.friendName.trim() && (
                  <>
                    <label><span>Their email <span className="select-opt">(optional, we'll send them an invite)</span></span><input type="email" name="friendEmail" value={form.friendEmail} onChange={update} maxLength={120} /></label>
                    {form.friendEmail.trim() && (
                      <div className="select-radio-group" role="radiogroup" aria-label="Your friend is a">
                        <span className="select-label-text">Your friend is a</span>
                        <div className="select-pills">
                          {[["man", "Man"], ["woman", "Woman"]].map(([v, l]) => (
                            <label key={v} className={`select-pill ${form.friendGender === v ? "on" : ""}`}>
                              <input type="radio" name="friendGender" value={v} checked={form.friendGender === v} onChange={update} />
                              {l}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </fieldset>
            </FormStep>

            {/* YOUR HEART */}
            <FormStep index={1} title="Your heart" done={stepDone[1]} open={step === 1} onToggle={() => toggleStep(1)} onNext={() => openStep(2)}>
            <fieldset>
              <legend className="select-sr">Your heart</legend>
              <label className="select-check">
                <input type="checkbox" name="isSingle" checked={form.isSingle} onChange={update} />
                I'm single and not currently seeing anyone *
              </label>
              <div className="select-grid">
                <label>
                  What are you looking for? *
                  <select name="lookingFor" value={form.lookingFor} onChange={update}>
                    <option value="">Choose one</option>
                    {LOOKING_FOR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label>
                  What would make this night a success? *
                  <select name="nightGoal" value={form.nightGoal} onChange={update}>
                    <option value="">Choose one</option>
                    {NIGHT_GOAL.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                  </select>
                </label>
                <label>
                  Do you have children? *
                  <select name="hasKids" value={form.hasKids} onChange={update}>
                    <option value="">Choose one</option>
                    {KIDS_HAVE.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                  </select>
                </label>
                <label>
                  Do you want children? *
                  <select name="wantsKids" value={form.wantsKids} onChange={update}>
                    <option value="">Choose one</option>
                    {KIDS_WANT.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="select-label-text">
                {form.gender === "man" ? "Ages of women you'd like to meet *" : form.gender === "woman" ? "Ages of men you'd like to meet *" : "Ages you'd like to meet *"}
                <div className="select-age-range">
                  <input type="number" name="ageMin" value={form.ageMin} onChange={update} min={30} max={99} placeholder="From" aria-label="From age" inputMode="numeric" />
                  <span aria-hidden="true">to</span>
                  <input type="number" name="ageMax" value={form.ageMax} onChange={update} min={30} max={99} placeholder="To" aria-label="To age" inputMode="numeric" />
                </div>
              </div>
              <label>Why now? What made you ready to meet someone in person?<textarea name="whyNow" value={form.whyNow} onChange={update} rows={3} maxLength={800} /></label>
              <label>Describe your ideal first date.<textarea name="firstDate" value={form.firstDate} onChange={update} rows={3} maxLength={800} /></label>
            </fieldset>
            </FormStep>

            {/* WHAT YOU VALUE */}
            <FormStep index={2} title="What you value" done={stepDone[2]} open={step === 2} onToggle={() => toggleStep(2)} onNext={() => openStep(3)}>
            <fieldset>
              <legend className="select-sr">What you value</legend>
              <p className="select-help">
                How important is each of these to you, in your own life and in a partner? There are no wrong answers.
                We use them to put people who see life the same way in the same room.
                <span className={`select-count ${ratedCount === VALUES.length ? "done" : ""}`} aria-live="polite">
                  {ratedCount} of {VALUES.length} rated
                </span>
              </p>
              <div className="select-rate-key" aria-hidden="true">
                <span>1 = {SCALE[0].label}</span><span>5 = {SCALE[4].label}</span>
              </div>
              <div className="select-rates">
                {VALUES.map((v) => (
                  <div key={v.key} className="select-rate-row" role="radiogroup" aria-label={`${v.label}: 1 not important to 5 essential`}>
                    <span className="select-rate-label">{v.label}</span>
                    <div className="select-rate-btns">
                      {SCALE.map((sc) => (
                        <label key={sc.n} className={`select-rate-btn ${form.values[v.key] === sc.n ? "on" : ""}`} title={sc.label}>
                          <input type="radio" name={`value-${v.key}`} checked={form.values[v.key] === sc.n} onChange={() => setValue(v.key, sc.n)} />
                          <span aria-hidden="true">{sc.n}</span>
                          <span className="select-sr">{sc.n}, {sc.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <label>Why do the things you rated highest matter so much to you?<textarea name="valuesWhy" value={form.valuesWhy} onChange={update} rows={3} maxLength={800} /></label>
            </fieldset>
            </FormStep>

            {/* HOW YOU CONNECT */}
            <FormStep index={3} title="How you connect" done={stepDone[3]} open={step === 3} onToggle={() => toggleStep(3)} onNext={() => openStep(4)}>
            <fieldset>
              <legend className="select-sr">How you connect</legend>
              <p className="select-help">Quick, honest answers. This is how we learn who you are around people, and who you'd click with.</p>
              {CONNECT.map((q) => (
                <div key={q.key} className="select-radio-group" role="radiogroup" aria-label={q.ask(form.gender)}>
                  <span className="select-label-text">{q.ask(form.gender)} *</span>
                  <div className="select-chips">
                    {q.options.map((o) => (
                      <label key={o.key} className={`select-chip ${form[q.key] === o.key ? "on" : ""}`}>
                        <input type="radio" name={q.key} checked={form[q.key] === o.key} onChange={() => setChoice(q.key, o.key)} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {[["giveLove", giveLoveAsk(form.gender)], ["receiveLove", receiveLoveAsk(form.gender)]].map(([field, ask]) => (
                <div key={field} className="select-radio-group" role="group" aria-label={ask}>
                  <span className="select-label-text">
                    {ask} *
                    <span className={`select-count ${form[field].length === 2 ? "done" : ""}`}>{form[field].length} of 2</span>
                  </span>
                  <div className="select-chips">
                    {LOVE.map((o) => {
                      const on = form[field].includes(o.key);
                      const locked = !on && form[field].length >= 2;
                      return (
                        <label key={o.key} className={`select-chip ${on ? "on" : ""} ${locked ? "locked" : ""}`}>
                          <input type="checkbox" checked={on} disabled={locked} onChange={() => togglePick(field, o.key)} />
                          {o.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </fieldset>
            </FormStep>

            {/* BINGO */}
            <FormStep index={4} title="Fun facts for the evening" done={stepDone[4]} open={step === 4} onToggle={() => toggleStep(4)} onNext={() => openStep(5)}>
            <fieldset>
              <legend className="select-sr">Fun facts for the evening</legend>
              <p className="select-help">
                Answer any <strong>5</strong>. They become part of the night's "Find someone who…"
                game, so other guests have a fun way to start a conversation with you.
                <span className={`select-count ${bingoCount === 5 ? "done" : ""}`} aria-live="polite">
                  {bingoCount} of 5 answered
                </span>
              </p>
              <div className="select-bingo">
                {BINGO_PROMPTS.map((p) => {
                  const filled = (bingo[p] || "").trim();
                  const locked = bingoCount >= 5 && !filled;
                  return (
                    <label key={p} className={`select-bingo-item ${filled ? "filled" : ""} ${locked ? "locked" : ""}`}>
                      {p}
                      <input
                        value={bingo[p] || ""}
                        onChange={(e) => setAnswer(p, e.target.value)}
                        maxLength={160}
                        disabled={locked}
                        placeholder={locked ? "You've picked your 5" : ""}
                      />
                    </label>
                  );
                })}
              </div>
            </fieldset>
            </FormStep>

            {/* FOOD */}
            <FormStep index={5} title="At the table" done={stepDone[5]} optional open={step === 5} onToggle={() => toggleStep(5)} onNext={() => openStep(6)}>
            <fieldset>
              <legend className="select-sr">At the table</legend>
              <p className="select-help">Food is served. Tell us about any food allergies.</p>
              <div className="select-chips">
                {ALLERGIES.map((a) => (
                  <label key={a} className={`select-chip ${form.allergies.includes(a) ? "on" : ""}`}>
                    <input type="checkbox" checked={form.allergies.includes(a)} onChange={() => toggle("allergies", a)} />
                    {a}
                  </label>
                ))}
              </div>
              <label>Other allergies<input name="allergyOther" value={form.allergyOther} onChange={update} maxLength={200} placeholder="Leave blank if none" /></label>
              <p className="select-help">Dietary needs</p>
              <div className="select-chips">
                {DIETS.map((d) => (
                  <label key={d} className={`select-chip ${form.diet.includes(d) ? "on" : ""}`}>
                    <input type="checkbox" checked={form.diet.includes(d)} onChange={() => toggle("diet", d)} />
                    {d}
                  </label>
                ))}
              </div>
            </fieldset>
            </FormStep>

            {/* AGREEMENT */}
            <FormStep index={6} title="The house rules" done={stepDone[6]} open={step === 6} onToggle={() => toggleStep(6)} >
            <fieldset>
              <legend className="select-sr">The house rules</legend>
              <label className="select-check">
                <input type="checkbox" name="agreed" checked={form.agreed} onChange={update} />
                <span>
                  I'm single and 30 or older. I will keep my phone camera sealed all evening, keep
                  what happens at Select private, come without a plus-one and follow the dress code.
                  I understand seats are non-refundable and non-transferable, and that breaking any
                  rule or the <Link to="/code-of-conduct">Code of Conduct</Link> gets me removed with no
                  refund. I accept the <Link to="/terms">Terms</Link> and <Link to="/waiver">Participation Waiver</Link>. *
                </span>
              </label>
            </fieldset>
            </FormStep>

            <input
              type="text"
              name="website"
              value={form.website}
              onChange={update}
              className="select-hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {error && <p className="select-error" role="alert">{error}</p>}
            <button type="submit" className="select-btn" disabled={sending}>
              {sending ? "Sending…" : "Request My Seat"}
            </button>
          </form>
        )}
      </section>
      )}

        </>
      )}
      <SelectFooter />
    </div>
  );
};

export default SelectInvitation;
