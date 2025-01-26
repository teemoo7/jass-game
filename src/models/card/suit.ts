export enum Suit {
  HEARTS = "Hearts",
  CLUBS = "Clubs",
  DIAMONDS = "Diamonds",
  SPADES = "Spades",
}

export class SuitHelper {
  static getSuits(): Suit[] {
    return Object.keys(Suit).map((suit) => Suit[suit]);
  }

  static getSuitAbbreviation(suit: Suit): string {
    switch (suit) {
      case Suit.HEARTS:
        return "H";
      case Suit.CLUBS:
        return "C";
      case Suit.DIAMONDS:
        return "D";
      case Suit.SPADES:
        return "S";
    }
  }

  static getSuitFromAbbreviation(abbreviation: string): Suit {
    switch (abbreviation) {
      case "H":
        return Suit.HEARTS;
      case "D":
        return Suit.DIAMONDS;
      case "C":
        return Suit.CLUBS;
      case "S":
        return Suit.SPADES;
    }
  }

}
