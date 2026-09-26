import React from "react";
import { formatMoney, formatShortDate } from "../Services/eventUtils";

// Shows ONE clean price instead of every ticket type
const PriceTag = ({ display, size = "md" }) => {
  if (!display) return null;
  const cls = `gfc-price gfc-price-${size}`;

  if (["none", "sold-out", "upcoming"].includes(display.type)) {
    return <div className={`${cls} status-${display.type}`}>{display.label}</div>;
  }

  const member =
    display.memberPrice != null ? (
      <span className="gfc-price-member">Members {formatMoney(display.memberPrice)}</span>
    ) : null;

  if (display.type === "sale") {
    return (
      <div className={cls}>
        <span className="gfc-sale-badge">{display.badge}</span>
        <div className="gfc-price-line">
          <span className="gfc-price-now">{formatMoney(display.price)}</span>
          <s className="gfc-price-was" aria-label={`Regular price ${formatMoney(display.originalPrice)}`}>
            {formatMoney(display.originalPrice)}
          </s>
        </div>
        {display.endsAt && <span className="gfc-price-note">Sale ends {formatShortDate(display.endsAt)}</span>}
        {member}
      </div>
    );
  }

  return (
    <div className={cls}>
      <div className="gfc-price-line">
        {display.type === "from" && <span className="gfc-price-from">From</span>}
        <span className="gfc-price-now">{display.type === "free" ? "Free" : formatMoney(display.price)}</span>
      </div>
      {member}
    </div>
  );
};

export default PriceTag;