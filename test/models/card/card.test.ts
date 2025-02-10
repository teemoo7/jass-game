import { describe, expect, it } from "vitest";
import { Suit } from "../../../src/models/card/suit.ts";
import { Rank } from "../../../src/models/card/rank.ts";
import { Card } from "../../../src/models/card/card.ts";

describe("Card", () => {
  describe("constructor", () => {
    it("should create a new card", () => {
      // given
      const suit = Suit.HEARTS;
      const rank = Rank.QUEEN;

      // when
      const card = new Card(suit, rank);

      // then
      expect(card.suit).toBe(suit);
      expect(card.rank).toBe(rank);
    });
  });
});
