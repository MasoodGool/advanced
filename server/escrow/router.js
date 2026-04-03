import { Router } from 'express';
import { users, listings, escrows, createEscrow, resetStore } from './store';
import { ship, confirm, dispute, cancel } from './escrowMachine';

const router = Router();

// ── Full state dump ──────────────────────────────────────────────────────────
router.get('/state', (req, res) => {
  res.json({ users, listings, escrows });
});

// ── Listings ─────────────────────────────────────────────────────────────────
router.get('/listings', (req, res) => {
  res.json(Object.values(listings));
});

// ── Create escrow (buyer initiates purchase, locks funds) ────────────────────
router.post('/escrow', (req, res) => {
  const { listingId, buyerId } = req.body;

  const listing = listings[listingId];
  if (!listing)                          return res.status(400).json({ error: 'Listing not found.' });
  if (listing.status !== 'available')    return res.status(400).json({ error: 'Listing is not available.' });

  const buyer = users[buyerId];
  if (!buyer)                            return res.status(400).json({ error: 'Buyer not found.' });
  if (buyerId === listing.sellerId)      return res.status(400).json({ error: 'You cannot buy your own listing.' });
  if (buyer.balance < listing.price)    return res.status(400).json({ error: `Insufficient balance. Need $${listing.price}, have $${buyer.balance}.` });

  const escrow = createEscrow(listingId, buyerId, listing.sellerId, listing.price);
  res.status(201).json({ escrow });
});

// ── Helper: look up escrow or 404 ────────────────────────────────────────────
function getEscrow(req, res) {
  const escrow = escrows[req.params.id];
  if (!escrow) { res.status(404).json({ error: 'Escrow not found.' }); return null; }
  return escrow;
}

// ── Ship ─────────────────────────────────────────────────────────────────────
router.post('/escrow/:id/ship', (req, res) => {
  const escrow = getEscrow(req, res);
  if (!escrow) return;
  try {
    ship(escrow, req.body.userId);
    res.json({ escrow });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Confirm receipt ───────────────────────────────────────────────────────────
router.post('/escrow/:id/confirm', (req, res) => {
  const escrow = getEscrow(req, res);
  if (!escrow) return;
  try {
    confirm(escrow, req.body.userId);
    res.json({ escrow, users });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Dispute ───────────────────────────────────────────────────────────────────
router.post('/escrow/:id/dispute', (req, res) => {
  const escrow = getEscrow(req, res);
  if (!escrow) return;
  try {
    dispute(escrow, req.body.userId, req.body.reason);
    res.json({ escrow });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Cancel ────────────────────────────────────────────────────────────────────
router.post('/escrow/:id/cancel', (req, res) => {
  const escrow = getEscrow(req, res);
  if (!escrow) return;
  try {
    cancel(escrow, req.body.userId);
    res.json({ escrow, users });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── Reset (demo utility) ──────────────────────────────────────────────────────
router.post('/reset', (req, res) => {
  resetStore();
  res.json({ message: 'Store reset to initial state.' });
});

export default router;
