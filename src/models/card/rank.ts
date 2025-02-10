export enum Rank {
  SIX = "6",
  SEVEN = "7",
  EIGHT = "8",
  NINE = "9",
  TEN = "10",
  JACK = "J",
  QUEEN = "Q",
  KING = "K",
  ACE = "A",
}

export class RankHelper {
  static getRanks(): Rank[] {
    return Object.keys(Rank).map((rank) => Rank[rank as keyof typeof Rank]);
  }

  static getRankFromAbbreviation(abbreviation: string): Rank {
    switch (abbreviation) {
      case "6":
        return Rank.SIX;
      case "7":
        return Rank.SEVEN;
      case "8":
        return Rank.EIGHT;
      case "9":
        return Rank.NINE;
      case "10":
        return Rank.TEN;
      case "J":
        return Rank.JACK;
      case "Q":
        return Rank.QUEEN;
      case "K":
        return Rank.KING;
      case "A":
        return Rank.ACE;
      default:
        throw new Error("Invalid abbreviation");
    }
  }
}
