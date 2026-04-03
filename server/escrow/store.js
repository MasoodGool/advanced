// In-memory store — module-level singleton (Node caches modules, so this persists per process)

const seedUsers = () => ({
  buyer:  { id: 'buyer',  name: 'Alice (Buyer)',  balance: 1000 },
  seller: { id: 'seller', name: 'Bob (Seller)',    balance: 200  },
});

const seedListings = () => ({
  'listing-1': {
    id:          'listing-1',
    sellerId:    'seller',
    title:       'Vintage Road Bike',
    description: '1987 Peugeot, fully restored and serviced. Rides like new.',
    price:       350,
    status:      'available', // 'available' | 'in_escrow' | 'sold'
  },
});

export const users    = seedUsers();
export const listings = seedListings();
export const escrows  = {}; // keyed by escrow id

export function createEscrow(listingId, buyerId, sellerId, amount) {
  const id = `escrow-${Date.now()}`;
  const escrow = {
    id,
    listingId,
    buyerId,
    sellerId,
    amount,
    status:    'pending',
    timeline:  [{ event: `Buyer deposited $${amount} into escrow`, actor: buyerId, ts: Date.now() }],
    createdAt: Date.now(),
  };
  escrows[id] = escrow;
  // Lock funds: debit buyer immediately
  users[buyerId].balance -= amount;
  listings[listingId].status = 'in_escrow';
  return escrow;
}

export function resetStore() {
  // Mutate in place so existing import references stay valid
  const fresh = seedUsers();
  Object.keys(users).forEach(k => delete users[k]);
  Object.assign(users, fresh);

  const freshListings = seedListings();
  Object.keys(listings).forEach(k => delete listings[k]);
  Object.assign(listings, freshListings);

  Object.keys(escrows).forEach(k => delete escrows[k]);
}
