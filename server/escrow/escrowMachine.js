import { users, listings } from './store';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Seller marks item as shipped/delivered
export function ship(escrow, actorId) {
  assert(escrow.status === 'pending', `Cannot ship from status "${escrow.status}". Must be "pending".`);
  assert(actorId === escrow.sellerId, 'Only the seller can mark an item as shipped.');
  escrow.status = 'shipped';
  escrow.timeline.push({ event: 'Seller marked item as shipped', actor: actorId, ts: Date.now() });
}

// Buyer confirms receipt — releases funds to seller
export function confirm(escrow, actorId) {
  assert(escrow.status === 'shipped', `Cannot confirm from status "${escrow.status}". Must be "shipped".`);
  assert(actorId === escrow.buyerId, 'Only the buyer can confirm receipt.');
  escrow.status = 'confirmed';
  escrow.timeline.push({ event: 'Buyer confirmed receipt — funds released to seller', actor: actorId, ts: Date.now() });
  // Release funds
  users[escrow.sellerId].balance += escrow.amount;
  listings[escrow.listingId].status = 'sold';
}

// Either party raises a dispute
export function dispute(escrow, actorId, reason) {
  assert(
    escrow.status === 'pending' || escrow.status === 'shipped',
    `Cannot dispute from status "${escrow.status}".`
  );
  assert(
    actorId === escrow.buyerId || actorId === escrow.sellerId,
    'Only the buyer or seller can raise a dispute.'
  );
  escrow.status = 'disputed';
  const actor = actorId === escrow.buyerId ? 'Buyer' : 'Seller';
  const note  = reason ? `: ${reason}` : '';
  escrow.timeline.push({ event: `${actor} raised a dispute${note}`, actor: actorId, ts: Date.now() });
}

// Buyer cancels before seller ships — full refund
export function cancel(escrow, actorId) {
  assert(escrow.status === 'pending', `Cannot cancel from status "${escrow.status}". Must be "pending".`);
  assert(actorId === escrow.buyerId, 'Only the buyer can cancel.');
  escrow.status = 'cancelled';
  escrow.timeline.push({ event: 'Buyer cancelled — funds refunded', actor: actorId, ts: Date.now() });
  // Refund buyer
  users[escrow.buyerId].balance += escrow.amount;
  listings[escrow.listingId].status = 'available';
}
