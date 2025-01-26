import { describe, expect, it } from "vitest";
import { Card } from "../../../src/models/card/card";
import { Suit } from "../../../src/models/card/suit";
import { Rank } from "../../../src/models/card/rank";
import { Meld, MeldType } from "../../../src/models/game/meld.ts";

describe("Meld", () => {
  describe("Compute suite melds", () => {
    it("should compute no meld given no card", () => {
      // given
      const cards = [];

      // when
      const meld = Meld.computeSuiteMeld(cards);

      // then
      expect(meld).toBe(undefined);
    });

    it("should compute no meld given less than 3 card", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [new Card(suit, Rank.SIX), new Card(suit, Rank.SEVEN)];

      // when
      const meld = Meld.computeSuiteMeld(cards);

      // then
      expect(meld).toBe(undefined);
    });

    it("should compute no meld given 3 card not following each others", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [new Card(suit, Rank.SIX), new Card(suit, Rank.SEVEN), new Card(suit, Rank.NINE)];

      // when
      const meld = Meld.computeSuiteMeld(cards);

      // then
      expect(meld).toBe(undefined);
    });

    it("should compute a meld given 3 card following each others", () => {
      // given
      const suit = Suit.DIAMONDS;
      const cards = [new Card(suit, Rank.SIX), new Card(suit, Rank.SEVEN), new Card(suit, Rank.EIGHT)];

      // when
      const meld = Meld.computeSuiteMeld(cards);

      // then
      expect(meld).toEqual(new Meld(20, Rank.EIGHT, MeldType.THREE_IN_A_ROW));
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
      const meld = Meld.computeSuiteMeld(cards);

      // then
      expect(meld).toEqual(new Meld(20, Rank.EIGHT, MeldType.THREE_IN_A_ROW));
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
      const meld = Meld.computeSuiteMeld(cards);

      // then
      expect(meld).toEqual(new Meld(20, Rank.ACE, MeldType.THREE_IN_A_ROW));
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
      const meld = Meld.computeSuiteMeld(cards);

      // then
      expect(meld).toEqual(new Meld(50, Rank.NINE, MeldType.FOUR_IN_A_ROW));
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
      const meld = Meld.computeSuiteMeld(cards);

      // then
      expect(meld).toEqual(new Meld(100, Rank.ACE, MeldType.FIVE_IN_A_ROW));
    });
  });
});
