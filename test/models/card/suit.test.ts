import { describe, expect, it } from "vitest";
import { Suit, SuitHelper } from "../../../src/models/card/suit.ts";

describe("Suit", () => {
  describe("Suit helper", () => {
    it("should return the correct suit", () => {
      // given
      const expectedSuits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];

      // when
      const suits = SuitHelper.getSuits();

      // then
      expect(suits).toEqual(expectedSuits);
    });
  });
});
