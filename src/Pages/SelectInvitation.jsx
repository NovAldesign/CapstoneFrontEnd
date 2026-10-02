import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BACKEND_URL } from "../Services/eventUtils";
import { SelectTopbar, SelectFooter } from "../Components/SelectFrame";
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
  "My zodiac sign",
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
  { n: "I", title: "Request", text: "Tell us who you are below. It takes about 10 minutes." },
  { n: "II", title: "Selection", text: "Every guest is chosen by hand. Twenty men, twenty women, balanced by age." },
  { n: "III", title: "Invitation", text: "Selected guests receive the date, that evening's dress code and how to reserve a seat." },
  { n: "IV", title: "The Reveal", text: "The location is shared with selected guests 48 hours before." },
];

const RULES = [
  "For singles, 30 and over",
  "Camera-free: your phone's camera wears our seal all night",
  "What happens at Select stays at Select",
  "No plus-ones. Every seat is selected",
  "Each evening has its own dress code",
  "No refunds. This is a curated room",
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
    a: "Not to the same evening. Every guest is selected on their own. After you attend, you can refer one person for a future Select.",
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
  lookingFor: "",
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
  const [params] = useSearchParams();
  const [form, setForm] = useState(EMPTY);
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

  const setAnswer = (prompt, answer) => {
    if (error) setError("");
    setBingo((prev) => ({ ...prev, [prompt]: answer }));
  };

  const stepDone = [
    Boolean(form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.phone.trim() && form.birthdate && form.gender),
    form.isSingle,
    bingoCount === 5,
    sawFood, // optional: done once they've looked at it
    form.agreed,
  ];

  const openStep = (i) => {
    setStep(i);
    if (i >= 3) setSawFood(true);
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
    if (!form.isSingle) {
      openStep(1);
      return setError("GFC Select™ is for singles only.");
    }
    if (bingoCount !== 5) {
      openStep(2);
      return setError("Please answer 5 of the fun-fact prompts.");
    }
    if (!form.agreed) {
      openStep(4);
      return setError("Please agree to the house rules.");
    }

    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/select/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
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
        <p className="select-kicker">The ritual</p>
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
          face, then this room was made for you. Step inside and request your seat.
        </p>
        {!ready ? (
          <button type="button" className="select-btn" onClick={enterRoom}>
            I'm Ready. Enter the Room.
          </button>
        ) : (
          <p className="select-gate-done">The door is open. Your request is below.</p>
        )}
      </section>

      {/* REQUEST FORM (opens after "I'm Ready") */}
      {ready && (
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
                <label className="select-span-2"><span>Referred by a past guest? <span className="select-opt">(their name)</span></span><input name="referredBy" value={form.referredBy} onChange={update} maxLength={80} /></label>
              </div>
            </fieldset>
            </FormStep>

            {/* DATING */}
            <FormStep index={1} title="Your heart" done={stepDone[1]} open={step === 1} onToggle={() => toggleStep(1)} onNext={() => openStep(2)}>
            <fieldset>
              <legend className="select-sr">Your heart</legend>
              <label className="select-check">
                <input type="checkbox" name="isSingle" checked={form.isSingle} onChange={update} />
                I'm single and not currently seeing anyone *
              </label>
              <label>
                What are you looking for?
                <select name="lookingFor" value={form.lookingFor} onChange={update}>
                  <option value="">Choose one</option>
                  {LOOKING_FOR.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
              <label>Why now? What made you ready to meet someone in person?<textarea name="whyNow" value={form.whyNow} onChange={update} rows={3} maxLength={800} /></label>
              <label>Describe your ideal first date.<textarea name="firstDate" value={form.firstDate} onChange={update} rows={3} maxLength={800} /></label>
              <label>What 2–3 things matter most to you in a partner?<textarea name="matters" value={form.matters} onChange={update} rows={3} maxLength={800} /></label>
              <label>What's something people only learn about you once they get to know you?<textarea name="learnLater" value={form.learnLater} onChange={update} rows={3} maxLength={800} /></label>
            </fieldset>
            </FormStep>

            {/* BINGO */}
            <FormStep index={2} title="Fun facts for the evening" done={stepDone[2]} open={step === 2} onToggle={() => toggleStep(2)} onNext={() => openStep(3)}>
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
            <FormStep index={3} title="At the table" done={stepDone[3]} optional open={step === 3} onToggle={() => toggleStep(3)} onNext={() => openStep(4)}>
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
            <FormStep index={4} title="The house rules" done={stepDone[4]} open={step === 4} onToggle={() => toggleStep(4)} >
            <fieldset>
              <legend className="select-sr">The house rules</legend>
              <label className="select-check">
                <input type="checkbox" name="agreed" checked={form.agreed} onChange={update} />
                <span>
                  I'm 30 or older. I agree to keep my phone camera covered all evening, keep what
                  happens at Select private, come without a plus-one, follow the evening's dress
                  code, and understand there are no refunds. *
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
