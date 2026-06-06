import React, { useState } from 'react';

export default function EventTicketSelector({ event, onAddToCart }) {
  // Track quantities selected locally for each ticket type
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

  // Build the bulk payload to pass up to the main global cart state
  const handleAddSelectionToBag = () => {
    const selectedTiers = event.ticketTypes.filter((tier) => (quantities[tier._id] || 0) > 0);
    
    if (selectedTiers.length === 0) {
      alert('Please select a ticket quantity first.');
      return;
    }

    // Pass each selected ticket type up to the global cart handler in Events.jsx
    selectedTiers.forEach((tier) => {
      const qtyToAdd = quantities[tier._id];
      for (let i = 0; i < qtyToAdd; i++) {
        onAddToCart(event, tier);
      }
    });

    // Reset local quantities down to 0 after pushing them to the cart drawer
    setQuantities({});
  };

  const totalTicketsSelected = event.ticketTypes.reduce((sum, tier) => sum + (quantities[tier._id] || 0), 0);

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

      <button
        type="button"
        onClick={handleAddSelectionToBag}
        disabled={totalTicketsSelected === 0}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
          totalTicketsSelected > 0
            ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {totalTicketsSelected > 0 ? `Add ${totalTicketsSelected} Pass${totalTicketsSelected > 1 ? 'es' : ''} to Bag` : 'Select Passes'}
      </button>
    </div>
  );
}