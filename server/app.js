import express from 'express';
import { Hand } from 'pokersolver';
import Deck from './Deck';

var app = express();

const deck = new Deck();

deck.shuffle();
deck.draw();
console.log(`Your hand: ${deck.hand}`);

var hand = Hand.solve(deck.hand);
console.log(`You have: ${hand.name}`);
console.log(`Which consists of: ${hand.descr}`); 

export default app;