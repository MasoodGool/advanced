const seedUsers = () => ({
  buyer:  { id: 'buyer',  name: 'Amara',  balance: 25000 },
  seller: { id: 'seller', name: 'Sipho',  balance: 3500  },
});

const seedListings = () => ({
  'listing-1': {
    id: 'listing-1', sellerId: 'seller', emoji: '🎮',
    title: 'Sony PlayStation 5', category: 'Gaming',
    description: 'Excellent condition, barely used. 2 controllers & 3 games. Selling due to upgrade.',
    price: 8500, status: 'available',
  },
  'listing-2': {
    id: 'listing-2', sellerId: 'seller', emoji: '📱',
    title: 'iPhone 14 Pro', category: 'Phones',
    description: 'Space Black, 256GB, 94% battery health. Includes original box and charger.',
    price: 12000, status: 'available',
  },
  'listing-3': {
    id: 'listing-3', sellerId: 'seller', emoji: '💻',
    title: 'MacBook Air M2', category: 'Laptops',
    description: 'Midnight colour, 8GB RAM / 256GB SSD. 11 months old, AppleCare valid.',
    price: 18500, status: 'available',
  },
  'listing-4': {
    id: 'listing-4', sellerId: 'seller', emoji: '🚁',
    title: 'DJI Mini 3 Drone', category: 'Tech',
    description: 'Fly More combo. Under 30 mins total flight time. All accessories included.',
    price: 6500, status: 'available',
  },
});

const seedStats = () => ({
  feesEarned:       0,
  dealsCompleted:   0,
  totalVolume:      0,
  disputesResolved: 0,
});

export const users    = seedUsers();
export const listings = seedListings();
export const escrows  = {};
export const stats    = seedStats();

export function createEscrow(listingId, buyerId, sellerId, amount) {
  const id = `escrow-${Date.now()}`;
  const escrow = {
    id,
    listingId,
    buyerId,
    sellerId,
    amount,
    status:             'pending',
    inspectionDeadline: null,
    timeline: [{ event: `Buyer deposited ${fmtR(amount)} into escrow`, actor: buyerId, ts: Date.now() }],
    createdAt: Date.now(),
  };
  escrows[id] = escrow;
  users[buyerId].balance -= amount;
  listings[listingId].status = 'in_escrow';
  return escrow;
}

function fmtR(n) { return `R\u00A0${Number(n).toLocaleString('en-ZA')}`; }

export function resetStore() {
  const fu = seedUsers();
  Object.keys(users).forEach(k => delete users[k]);
  Object.assign(users, fu);

  const fl = seedListings();
  Object.keys(listings).forEach(k => delete listings[k]);
  Object.assign(listings, fl);

  Object.keys(escrows).forEach(k => delete escrows[k]);

  const fs = seedStats();
  Object.keys(stats).forEach(k => delete stats[k]);
  Object.assign(stats, fs);
}
