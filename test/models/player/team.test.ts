import { describe, expect, it } from "vitest";
import { Team } from "../../../src/models/player/team.ts";

describe("Team", () => {
  describe("constructor", () => {
    it("should create a new team", () => {
      // given
      const name = "Team 1";
      const player1 = { name: "John", isHuman: true };
      const player2 = { name: "Jane", isHuman: false };

      // given
      const team = new Team(player1, player2, name);

      // then
      expect(team.name).toBe(name);
      expect(team.player1).toBe(player1);
      expect(team.player2).toBe(player2);
    });
  });
});
