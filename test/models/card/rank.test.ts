import { describe, expect, it } from "vitest";
import { Rank, RankHelper } from "../../../src/models/card/rank.ts";

describe("Rank", () => {
  describe("Rank helper", () => {
    it("should return the correct rank", () => {
      // given
      const expectedRanks = [Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];

      // when
      const ranks = RankHelper.getRanks();

      // then
      expect(ranks).toEqual(expectedRanks);
    });

    it("should return the correct rank from abbreviation", () => {
      // given
      const expectedRanks = [Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];

      // when
      const ranks = expectedRanks.map((rank) => RankHelper.getRankFromAbbreviation(rank));

      // then
      expect(ranks).toEqual(expectedRanks);
    });

    it("should throw an error when the abbreviation is invalid", () => {
      // given
      const abbreviation = "invalid";

      // when
      const getRankFromAbbreviation = () => RankHelper.getRankFromAbbreviation(abbreviation);

      // then
      expect(getRankFromAbbreviation).toThrowError("Invalid abbreviation");
    });
  });
});
