import { describe, expect, it } from "vitest";
import { Card } from "../../../src/models/card/card";
import { Suit } from "../../../src/models/card/suit";
import { Rank } from "../../../src/models/card/rank";
import { Meld, MeldType } from "../../../src/models/game/meld.ts";

describe("Meld", () => {
  describe("Compute suite melds", () => {
    it("should compute no meld given no card", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards: Card[] = [];

      // when
      const meld = Meld.computeSuiteMeld(cards, suit);

      // then
      expect(meld).toBe(undefined);
    });

    it("should compute no meld given less than 3 card", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [new Card(suit, Rank.SIX), new Card(suit, Rank.SEVEN)];

      // when
      const meld = Meld.computeSuiteMeld(cards, suit);

      // then
      expect(meld).toBe(undefined);
    });

    it("should compute no meld given 3 card not following each others", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [new Card(suit, Rank.SIX), new Card(suit, Rank.SEVEN), new Card(suit, Rank.NINE)];

      // when
      const meld = Meld.computeSuiteMeld(cards, suit);

      // then
      expect(meld).toBe(undefined);
    });

    it("should compute a meld given 3 card following each others", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [new Card(suit, Rank.SIX), new Card(suit, Rank.SEVEN), new Card(suit, Rank.EIGHT)];

      // when
      const meld = Meld.computeSuiteMeld(cards, suit);

      // then
      expect(meld).toEqual(new Meld(20, Rank.EIGHT, MeldType.THREE_IN_A_ROW, suit));
    });

    it("should compute a meld given 3 card following each others in a larger set", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [
        new Card(suit, Rank.ACE),
        new Card(suit, Rank.SEVEN),
        new Card(suit, Rank.SIX),
        new Card(suit, Rank.KING),
        new Card(suit, Rank.EIGHT),
      ];

      // when
      const meld = Meld.computeSuiteMeld(cards, suit);

      // then
      expect(meld).toEqual(new Meld(20, Rank.EIGHT, MeldType.THREE_IN_A_ROW, suit));
    });

    it("should keep the highest meld", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [
        new Card(suit, Rank.ACE),
        new Card(suit, Rank.SEVEN),
        new Card(suit, Rank.SIX),
        new Card(suit, Rank.KING),
        new Card(suit, Rank.QUEEN),
        new Card(suit, Rank.EIGHT),
      ];

      // when
      const meld = Meld.computeSuiteMeld(cards, suit);

      // then
      expect(meld).toEqual(new Meld(20, Rank.ACE, MeldType.THREE_IN_A_ROW, suit));
    });

    it("should compute a meld given 4 card following each others", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [
        new Card(suit, Rank.SIX),
        new Card(suit, Rank.SEVEN),
        new Card(suit, Rank.EIGHT),
        new Card(suit, Rank.KING),
        new Card(suit, Rank.NINE),
      ];

      // when
      const meld = Meld.computeSuiteMeld(cards, suit);

      // then
      expect(meld).toEqual(new Meld(50, Rank.NINE, MeldType.FOUR_IN_A_ROW, suit));
    });

    it("should compute a meld given 5 card following each others", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [
        new Card(suit, Rank.ACE),
        new Card(suit, Rank.QUEEN),
        new Card(suit, Rank.JACK),
        new Card(suit, Rank.KING),
        new Card(suit, Rank.NINE),
        new Card(suit, Rank.TEN),
      ];

      // when
      const meld = Meld.computeSuiteMeld(cards, suit);

      // then
      expect(meld).toEqual(new Meld(100, Rank.ACE, MeldType.FIVE_IN_A_ROW, suit));
    });
  });

  describe("Get meld type string", () => {
    it("should return the correct meld type string", () => {
      // given
      const expectedMeldTypes: MeldType[] = [
        MeldType.THREE_IN_A_ROW,
        MeldType.FOUR_IN_A_ROW,
        MeldType.FIVE_IN_A_ROW,
        MeldType.FOUR_JACKS,
        MeldType.FOUR_NINES,
        MeldType.FOUR_OF_A_KIND,
        MeldType.MARRIAGE
      ];
      const expectedMeldTypeStrings: String[] = [
        "3 in a row",
        "4 in a row",
        "5 in a row",
        "Four jacks",
        "Four nines",
        "Four of a kind",
        "Marriage"
      ];

      // when
      const meldTypeStrings = expectedMeldTypes.map((meldType) => Meld.getMeldTypeString(meldType));

      // then
      expect(meldTypeStrings).toEqual(expectedMeldTypeStrings);
    });
  });

  describe("Compute melds", () => {
    it("should compute no meld given no card", () => {
      // given
      const cards: Card[] = [];

      // when
      const meld = Meld.computeMeld(cards);

      // then
      expect(meld).toBe(undefined);
    });

    it("should compute no meld given less than 3 cards", () => {
      // given
      const cards = [new Card(Suit.DIAMONDS, Rank.SIX), new Card(Suit.DIAMONDS, Rank.SEVEN)];

      // when
      const meld = Meld.computeMeld(cards);

      // then
      expect(meld).toBe(undefined);
    });

    it("should compute a meld given 3 cards following each others", () => {
      // given
      const cards = [new Card(Suit.DIAMONDS, Rank.SIX), new Card(Suit.DIAMONDS, Rank.SEVEN), new Card(Suit.DIAMONDS, Rank.EIGHT)];

      // when
      const meld = Meld.computeMeld(cards);

      // then
      expect(meld).toEqual(new Meld(20, Rank.EIGHT, MeldType.THREE_IN_A_ROW, Suit.DIAMONDS));
    });

    it("should compute a meld given 4 cards following each others", () => {
      // given
      const cards = [
        new Card(Suit.HEARTS, Rank.SIX),
        new Card(Suit.DIAMONDS, Rank.SIX),
        new Card(Suit.DIAMONDS, Rank.SEVEN),
        new Card(Suit.DIAMONDS, Rank.EIGHT),
        new Card(Suit.DIAMONDS, Rank.NINE),
        new Card(Suit.DIAMONDS, Rank.JACK),
      ];

      // when
      const meld = Meld.computeMeld(cards);

      // then
      expect(meld).toEqual(new Meld(50, Rank.NINE, MeldType.FOUR_IN_A_ROW, Suit.DIAMONDS));
    });

    it("should compute a meld given 5 cards following each others", () => {
      // given
      const cards = [
        new Card(Suit.DIAMONDS, Rank.ACE),
        new Card(Suit.DIAMONDS, Rank.QUEEN),
        new Card(Suit.DIAMONDS, Rank.JACK),
        new Card(Suit.DIAMONDS, Rank.KING),
        new Card(Suit.DIAMONDS, Rank.TEN),
      ];

      // when
      const meld = Meld.computeMeld(cards);

      // then
      expect(meld).toEqual(new Meld(100, Rank.ACE, MeldType.FIVE_IN_A_ROW, Suit.DIAMONDS));
    });

    it("should compute a meld given 4 cards of the same rank", () => {
      // given
      const cards = [
        new Card(Suit.DIAMONDS, Rank.ACE),
        new Card(Suit.HEARTS, Rank.ACE),
        new Card(Suit.SPADES, Rank.ACE),
        new Card(Suit.CLUBS, Rank.ACE),
      ];

      // when
      const meld = Meld.computeMeld(cards);

      // then
      expect(meld).toEqual(new Meld(100, Rank.ACE, MeldType.FOUR_OF_A_KIND));
    });

    it("should compute a meld given 4 jacks", () => {
      // given
      const cards = [
        new Card(Suit.DIAMONDS, Rank.JACK),
        new Card(Suit.HEARTS, Rank.JACK),
        new Card(Suit.SPADES, Rank.JACK),
        new Card(Suit.CLUBS, Rank.JACK),
      ];

      // when
      const meld = Meld.computeMeld(cards);

      // then
      expect(meld).toEqual(new Meld(200, Rank.JACK, MeldType.FOUR_JACKS));
    });

    it("should compute a meld given 4 nines", () => {
      // given
      const cards = [
        new Card(Suit.DIAMONDS, Rank.NINE),
        new Card(Suit.HEARTS, Rank.NINE),
        new Card(Suit.SPADES, Rank.NINE),
        new Card(Suit.CLUBS, Rank.NINE),
      ];

      // when
      const meld = Meld.computeMeld(cards);

      // then
      expect(meld).toEqual(new Meld(150, Rank.NINE, MeldType.FOUR_NINES));
    });
  });
});
