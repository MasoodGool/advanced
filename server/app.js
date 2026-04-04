import express from 'express';
import path from 'path';
import { Hand } from 'pokersolver';
import Deck from './Deck';
import escrowRouter from './escrow/router';

var app = express();

// ── Existing poker demo (untouched) ──────────────────────────────────────────
const deck = new Deck();
deck.shuffle();
deck.draw();
console.log(`Your hand: ${deck.hand}`);
var hand = Hand.solve(deck.hand);
console.log(`You have: ${hand.name}`);
console.log(`Which consists of: ${hand.descr}`);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
// __dirname resolves to dist-server/ at runtime; public/ is two levels up
app.use(express.static(path.join(__dirname, '../public')));

// ── Escrow API ────────────────────────────────────────────────────────────────
app.use('/api', escrowRouter);

export default app;