import { describe, expect, it } from "vitest";
import { Suit, SuitHelper } from "../../../src/models/card/suit.ts";

describe("Suit", () => {
  describe("Suit helper", () => {
    it("should return the correct suit", () => {
      // given
      const expectedSuits = [Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS, Suit.SPADES];

      // when
      const suits = SuitHelper.getSuits();

      // then
      expect(suits).toEqual(expectedSuits);
    });

    it("should return the correct abbreviation", () => {
      // given
      const expectedSuits = [Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS, Suit.SPADES];
      const expectedAbbreviations = ["H", "C", "D", "S"];

      // when
      const abbreviations = expectedSuits.map((suit) => SuitHelper.getSuitAbbreviation(suit));

      // then
      expect(abbreviations).toEqual(expectedAbbreviations);
    });

    it("should return the correct suit from abbreviation", () => {
      // given
      const expectedSuits = [Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS, Suit.SPADES];
      const expectedAbbreviations = ["H", "C", "D", "S"];

      // when
      const suits = expectedAbbreviations.map((abbreviation) => SuitHelper.getSuitFromAbbreviation(abbreviation));

      // then
      expect(suits).toEqual(expectedSuits);
    });

    it("should throw an error when the abbreviation is invalid", () => {
      // given
      const abbreviation = "invalid";

      // when
      const getSuitFromAbbreviation = () => SuitHelper.getSuitFromAbbreviation(abbreviation);

      // then
      expect(getSuitFromAbbreviation).toThrowError("Invalid abbreviation");
    });
  });
});
