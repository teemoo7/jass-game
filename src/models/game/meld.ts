import { Rank, RankHelper } from "../card/rank.ts";
import { Card, CardHelper } from "../card/card.ts";
import { Suit, SuitHelper } from "../card/suit.ts";

export enum MeldType {
  THREE_IN_A_ROW = "THREE_IN_A_ROW",
  FOUR_IN_A_ROW = "FOUR_IN_A_ROW",
  FIVE_IN_A_ROW = "FIVE_IN_A_ROW",
  FOUR_OF_A_KIND = "FOUR_OF_A_KIND",
  FOUR_NINES = "FOUR_NINES",
  FOUR_JACKS = "FOUR_JACKS",
  MARRIAGE = "MARRIAGE", //todo: implement marriage meld
}

export class Meld {
  readonly points: number;
  readonly highestRank: Rank;
  readonly suit: Suit | undefined;
  readonly type: MeldType;

  constructor(points: number, highestRank: Rank, type: MeldType, suit?: Suit) {
    this.points = points;
    this.highestRank = highestRank;
    this.type = type;
    this.suit = suit;
  }

  static computeMeld(hand: Card[]): Meld | undefined {
    let highestMeld: Meld | undefined = undefined;
    // Check for a suite of 3 (or 4, or 5+) followings ranks of the same suit
    for (const suit of SuitHelper.getSuits()) {
      const suitHand = hand.filter((card) => card.suit === suit);
      const meld = this.computeSuiteMeld(suitHand, suit);
      if (meld && this.isHigherMeld(highestMeld, meld)) {
        highestMeld = meld;
      }
    }

    // Check for 4 card of the same rank
    for (const rank of RankHelper.getRanks()) {
      const selection = hand.filter((card) => card.rank === rank);
      if (selection.length === 4) {
        let meld;
        switch (rank) {
          case Rank.NINE:
            meld = new Meld(150, rank, MeldType.FOUR_NINES);
            break;
          case Rank.JACK:
            meld = new Meld(200, rank, MeldType.FOUR_JACKS);
            break;
          case Rank.TEN:
          case Rank.QUEEN:
          case Rank.KING:
          case Rank.ACE:
            meld = new Meld(100, rank, MeldType.FOUR_OF_A_KIND);
            break;
          default:
        }
        if (meld && this.isHigherMeld(highestMeld, meld)) {
          highestMeld = meld;
        }
      }
    }

    return highestMeld;
  }

  static computeSuiteMeld(cards: Card[], suit: Suit): Meld | undefined {
    if (cards.length < 3) {
      return undefined;
    }
    const ranks = RankHelper.getRanks();
    cards.sort((a, b) => CardHelper.computeCardPower(a, false) - CardHelper.computeCardPower(b, false));
    let highestMeld: Meld | undefined = undefined;
    for (let i = 0; i < cards.length - 2; i++) {
      let cardRank = cards[i].rank;
      let rankIndex = ranks.indexOf(cardRank);
      if (rankIndex > ranks.length - 3) {
        return undefined;
      }
      if (cards[i + 1].rank === ranks[rankIndex + 1] && cards[i + 2].rank === ranks[rankIndex + 2]) {
        if (cards.length - i > 3 && rankIndex <= ranks.length - 4) {
          if (cards[i + 3].rank === ranks[rankIndex + 3]) {
            if (cards.length - i > 4 && rankIndex <= ranks.length - 5) {
              if (cards[i + 4].rank === ranks[rankIndex + 4]) {
                highestMeld = this.keepHighestMeld(
                  highestMeld,
                  new Meld(100, ranks[rankIndex + 4], MeldType.FIVE_IN_A_ROW, suit),
                );
              }
            }
            highestMeld = this.keepHighestMeld(highestMeld, new Meld(50, ranks[rankIndex + 3], MeldType.FOUR_IN_A_ROW, suit));
          }
        }
        highestMeld = this.keepHighestMeld(highestMeld, new Meld(20, ranks[rankIndex + 2], MeldType.THREE_IN_A_ROW, suit));
      }
    }
    return highestMeld;
  }

  static isHigherMeld(highestMeld: Meld | undefined, meld: Meld): boolean {
    return (
      highestMeld === undefined ||
      meld.points > highestMeld.points ||
      (meld.points === highestMeld.points &&
        CardHelper.computeCardRankPower(meld.highestRank, false) >
          CardHelper.computeCardRankPower(highestMeld.highestRank, false))
    );
  }

  static keepHighestMeld(highestMeld: Meld | undefined, meld: Meld): Meld | undefined {
    if (this.isHigherMeld(highestMeld, meld)) {
      return meld;
    }
    return highestMeld;
  }

  static getMeldTypeString(type: MeldType): string {
    switch (type) {
      case MeldType.THREE_IN_A_ROW:
        return "3 in a row";
      case MeldType.FOUR_IN_A_ROW:
        return "4 in a row";
      case MeldType.FIVE_IN_A_ROW:
        return "5 in a row";
      case MeldType.FOUR_OF_A_KIND:
        return "Four of a kind";
      case MeldType.FOUR_NINES:
        return "Four nines";
      case MeldType.FOUR_JACKS:
        return "Four jacks";
      case MeldType.MARRIAGE:
        return "Marriage";
    }
  }
}
