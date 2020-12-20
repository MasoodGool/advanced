import Deck from '../Deck';

const deck1 = new Deck();

describe('Deck', () => {

    const expected = ['A♥',  '2♥',  '3♥',  '4♥', '5♥', '6♥', '7♥',
    '8♥',  '9♥',  '10♥', 'J♥', 'Q♥', 'K♥', 'A♠',
    '2♠',  '3♠',  '4♠',  '5♠', '6♠', '7♠', '8♠',
    '9♠',  '10♠', 'J♠',  'Q♠', 'K♠', 'A♣', '2♣',
    '3♣',  '4♣',  '5♣',  '6♣', '7♣', '8♣', '9♣',
    '10♣', 'J♣',  'Q♣',  'K♣', 'A♦', '2♦', '3♦',
    '4♦',  '5♦',  '6♦',  '7♦', '8♦', '9♦', '10♦',
    'J♦',  'Q♦',  'K♦'];

    test('Instance of Deck', () => {
        expect(new Deck()).toBeInstanceOf(Deck);
      });

    test('Deck size', () => {
        expect(deck1.deck).toHaveLength(52);
      });

      it('All cards accounted for', () => {
        expect(deck1.deck).toEqual(expect.arrayContaining(expected));
      });

});