import { Suit } from "./suit.ts";
import { Rank } from "./rank.ts";

export class Card {
  readonly suit: Suit;
  readonly rank: Rank;

  constructor(suit: Suit, rank: Rank) {
    this.suit = suit;
    this.rank = rank;
  }
}

export class CardHelper {
  static readonly CARDS_VALUES = new Map<string, number>([
    [Rank.ACE, 11],
    [Rank.KING, 4],
    [Rank.QUEEN, 3],
    [Rank.JACK, 2],
    [Rank.TEN, 10],
    [Rank.NINE, 0],
    [Rank.EIGHT, 0],
    [Rank.SEVEN, 0],
    [Rank.SIX, 0],
  ]);

  static readonly TRUMP_CARDS_VALUES = new Map<string, number>([
    [Rank.ACE, 11],
    [Rank.KING, 4],
    [Rank.QUEEN, 3],
    [Rank.JACK, 20],
    [Rank.TEN, 10],
    [Rank.NINE, 14],
    [Rank.EIGHT, 0],
    [Rank.SEVEN, 0],
    [Rank.SIX, 0],
  ]);

  static readonly CARDS_POWERS = new Map<string, number>([
    [Rank.ACE, 8],
    [Rank.KING, 7],
    [Rank.QUEEN, 6],
    [Rank.JACK, 5],
    [Rank.TEN, 4],
    [Rank.NINE, 3],
    [Rank.EIGHT, 2],
    [Rank.SEVEN, 1],
    [Rank.SIX, 0],
  ]);

  static readonly TRUMP_CARDS_POWERS = new Map<string, number>([
    [Rank.ACE, 16],
    [Rank.KING, 15],
    [Rank.QUEEN, 14],
    [Rank.JACK, 18],
    [Rank.TEN, 13],
    [Rank.NINE, 17],
    [Rank.EIGHT, 12],
    [Rank.SEVEN, 11],
    [Rank.SIX, 10],
  ]);

  static computeCardValue(card: Card, isTrump: boolean): number {
    if (isTrump) {
      return this.TRUMP_CARDS_VALUES.get(card.rank)!;
    }
    return this.CARDS_VALUES.get(card.rank)!;
  }

  static computeCardPower(card: Card, isTrump: boolean): number {
    return this.computeCardRankPower(card.rank, isTrump);
  }

  static computeCardRankPower(rank: string, isTrump: boolean): number {
    if (isTrump) {
      return this.TRUMP_CARDS_POWERS.get(rank)!;
    }
    return this.CARDS_POWERS.get(rank)!;
  }
}
