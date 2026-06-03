import React, { useState } from 'react';

export default function EventTicketSelector({ event, customerEmail }) {
  // Track quantities selected for each ticket type
  // ticketTypes structure matches your Mongoose backend array
  const [quantities, setQuantities] = useState({});

  if (!event || !event.ticketTypes || event.ticketTypes.length === 0) {
    return (
      <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 text-center">
        <p className="text-gray-600 font-medium">Standard Entry Tickets coming soon.</p>
      </div>
    );
  }

  // Handle local quantity updates safely
  const handleQuantityChange = (ticketTypeId, amount, maxAvailable) => {
    const currentQty = quantities[ticketTypeId] || 0;
    const newQty = Math.max(0, currentQty + amount);
    
    if (newQty > maxAvailable) {
      alert(`Only ${maxAvailable} tickets left for this pass tier.`);
      return;
    }

    setQuantities({
      ...quantities,
      [ticketTypeId]: newQty,
    });
  };

  // Compute live subtotal dynamically based on selection layout cents
  const selectedItems = event.ticketTypes
    .filter((tier) => (quantities[tier._id] || 0) > 0)
    .map((tier) => ({
      eventId: event._id,
      eventName: event.name,
      ticketTypeId: tier._id,
      ticketTypeName: tier.name,
      priceInCents: tier.price * 100, // Frontend uses standard dollars, backend handles integer cents
      quantity: quantities[tier._id],
    }));

  const totalTicketsSelected = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotalInCents = selectedItems.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
  const rawSubtotalDollars = (rawSubtotalInCents / 100).toFixed(2);

  // Initialize secure Stripe Session handshake
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one ticket pass to proceed to checkout.');
      return;
    }

    try {
      // Direct call executing your POST /api/events/checkout endpoint layout logic
      const response = await fetch('https://capstonebackend-production-87ed.up.railway.app/api/events/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: customerEmail || undefined,
          cartItems: selectedItems,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // 🚀 Redirect out cleanly to safe external Stripe checkout window wrapper
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to initialize payment process window.');
      }
    } catch (err) {
      console.error('Network Error checking out:', err);
      alert('Could not establish connection to the server payment system.');
    }
  };

  return (
    <div className="w-full max-w-md border border-gray-200 rounded-2xl bg-white shadow-sm p-6 mt-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Select Passes</h3>
      
      <div className="space-y-4 mb-6">
        {event.ticketTypes.map((tier) => {
          const selectedQty = quantities[tier._id] || 0;
          const remainingTickets = tier.quantity - (tier.sold || 0);
          const isSoldOut = remainingTickets <= 0;

          return (
            <div key={tier._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-slate-50">
              <div className="flex-1 pr-4">
                <p className="font-semibold text-slate-800 text-sm">{tier.name}</p>
                <p className="text-amber-700 font-bold text-sm mt-0.5">${tier.price}</p>
                {tier.description && <p className="text-xs text-gray-500 mt-1">{tier.description}</p>}
              </div>

              {isSoldOut ? (
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Sold Out</span>
              ) : (
                <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(tier._id, -1, remainingTickets)}
                    className="w-7 h-7 text-sm font-bold flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                  >
                    –
                  </button>
                  <span className="w-4 text-center font-semibold text-slate-800 text-sm">{selectedQty}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(tier._id, 1, remainingTickets)}
                    className="w-7 h-7 text-sm font-bold flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalTicketsSelected > 0 && (
        <div className="pt-4 border-t border-gray-100 mb-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-600">Total Tickets:</span>
            <span className="font-semibold text-slate-800">{totalTicketsSelected}</span>
          </div>
          <div className="flex justify-between items-center text-base font-bold">
            <span className="text-slate-900">Subtotal:</span>
            <span className="text-slate-900">${rawSubtotalDollars}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 italic leading-tight">
            * Adding tickets from different events automatically triggers your multi-event checkout bundle discount tiers.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={totalTicketsSelected === 0}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
          totalTicketsSelected > 0
            ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Proceed to Secure Checkout
      </button>
    </div>
  );
}