import { users, listings, stats } from './store';

const INSPECTION_HOURS = 48;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function ship(escrow, actorId) {
  assert(escrow.status === 'pending', `Cannot ship from status "${escrow.status}". Must be "pending".`);
  assert(actorId === escrow.sellerId, 'Only the seller can mark an item as shipped.');
  const now = Date.now();
  escrow.status = 'shipped';
  escrow.shippedAt = now;
  escrow.inspectionDeadline = now + INSPECTION_HOURS * 60 * 60 * 1000;
  escrow.timeline.push({ event: 'Seller marked item as shipped — 48h inspection window started', actor: actorId, ts: now });
}

export function confirm(escrow, actorId) {
  assert(escrow.status === 'shipped', `Cannot confirm from status "${escrow.status}". Must be "shipped".`);
  assert(actorId === escrow.buyerId, 'Only the buyer can confirm receipt.');
  escrow.status = 'confirmed';
  escrow.timeline.push({ event: 'Buyer confirmed receipt — funds released to seller', actor: actorId, ts: Date.now() });
  const fee = Math.round(escrow.amount * 0.03);
  users[escrow.sellerId].balance += (escrow.amount - fee);
  listings[escrow.listingId].status = 'sold';
  stats.feesEarned    += fee;
  stats.dealsCompleted += 1;
  stats.totalVolume   += escrow.amount;
}

export function dispute(escrow, actorId, reason) {
  assert(
    escrow.status === 'pending' || escrow.status === 'shipped',
    `Cannot dispute from status "${escrow.status}".`
  );
  assert(actorId === escrow.buyerId || actorId === escrow.sellerId, 'Only buyer or seller can raise a dispute.');
  escrow.status = 'disputed';
  escrow.disputedAt = Date.now();
  const actor = actorId === escrow.buyerId ? 'Buyer' : 'Seller';
  const note  = reason ? `: ${reason}` : '';
  escrow.timeline.push({ event: `${actor} raised a dispute${note} — AI review initiated`, actor: actorId, ts: Date.now() });
}

// Dispute resolution: decision = 'buyer' (refund) | 'seller' (release)
export function resolve(escrow, decision) {
  assert(escrow.status === 'disputed', 'Can only resolve a disputed escrow.');
  assert(decision === 'buyer' || decision === 'seller', 'Decision must be "buyer" or "seller".');
  const fee = Math.round(escrow.amount * 0.03);
  if (decision === 'seller') {
    escrow.status = 'confirmed';
    users[escrow.sellerId].balance += (escrow.amount - fee);
    listings[escrow.listingId].status = 'sold';
    stats.feesEarned    += fee;
    stats.dealsCompleted += 1;
    stats.totalVolume   += escrow.amount;
    escrow.timeline.push({ event: 'AI resolved dispute in favour of Seller — funds released', actor: 'system', ts: Date.now() });
  } else {
    escrow.status = 'cancelled';
    users[escrow.buyerId].balance += escrow.amount;
    listings[escrow.listingId].status = 'available';
    escrow.timeline.push({ event: 'AI resolved dispute in favour of Buyer — full refund issued', actor: 'system', ts: Date.now() });
  }
  stats.disputesResolved += 1;
}

export function cancel(escrow, actorId) {
  assert(escrow.status === 'pending', `Cannot cancel from status "${escrow.status}". Must be "pending".`);
  assert(actorId === escrow.buyerId, 'Only the buyer can cancel.');
  escrow.status = 'cancelled';
  escrow.timeline.push({ event: 'Buyer cancelled — full refund issued', actor: actorId, ts: Date.now() });
  users[escrow.buyerId].balance += escrow.amount;
  listings[escrow.listingId].status = 'available';
}
