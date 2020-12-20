export default class Deck {
    constructor() {
        this.deck = [];

        const heart = '\u2665';
        const spade = '\u2660';
        const diamond = '\u2666';
        const club = '\u2663';

        const suits = [heart, spade, club, diamond];
        const values = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];

        for (let suit in suits) {
            for (let value in values) {
                this.deck.push(`${values[value]}${suits[suit]}`);
            }
        };
    };

    shuffle() {
        const { deck } = this;
        let j = deck.length, i;

        while (j) {
            i = Math.floor(Math.random() * j--);
            [deck[j], deck[i]] = [deck[i], deck[j]];
        };

        return this;
    };

    draw() {
        this.hand = [];
        for (let index = 0; index < 5; index++) {
            const card = this.deck[index];
            this.hand.push(this.deck.pop());
        }
        return this.hand;
    };
}