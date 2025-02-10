import { describe, expect, it } from "vitest";
import { Team } from "../../../src/models/player/team.ts";
import { Human } from "../../../src/models/player/human.ts";
import { Bot } from "../../../src/models/player/bot.ts";

describe("Team", () => {
  describe("constructor", () => {
    it("should create a new team", () => {
      // given
      const name = "Team 1";
      const player1 = new Human("John");
      const player2 = new Bot("Jane", 0);

      // given
      const team = new Team(player1, player2, name);

      // then
      expect(team.name).toBe(name);
      expect(team.player1).toBe(player1);
      expect(team.player2).toBe(player2);
    });
  });

  describe("getPlayers", () => {
    it("should return the players of the team", () => {
      // given
      const name = "Team 1";
      const player1 = new Human("John");
      const player2 = new Bot("Jane", 0);
      const team = new Team(player1, player2, name);

      // when
      const players = team.getPlayers();

      // then
      expect(players).toEqual([player1, player2]);
    });
  });

  describe("hasPlayer", () => {
    it("should return true if the player is in the team", () => {
      // given
      const name = "Team 1";
      const player1 = new Human("John");
      const player2 = new Bot("Jane", 0);
      const team = new Team(player1, player2, name);

      // when
      const hasPlayer1 = team.hasPlayer(player1);
      const hasPlayer2 = team.hasPlayer(player2);

      // then
      expect(hasPlayer1).toBe(true);
      expect(hasPlayer2).toBe(true);
    });

    it("should return false if the player is not in the team", () => {
      // given
      const name = "Team 1";
      const player1 = new Human("John");
      const player2 = new Bot("Jane", 0);
      const team = new Team(player1, player2, name);

      // when
      const hasPlayer = team.hasPlayer(new Human("Jack"));

      // then
      expect(hasPlayer).toBe(false);
    });
  });

  describe("getTeamMate", () => {
    it("should return the team mate of the player", () => {
      // given
      const name = "Team 1";
      const player1 = new Human("John");
      const player2 = new Bot("Jane", 0);
      const team = new Team(player1, player2, name);

      // when
      const teamMate1 = team.getTeamMate(player1);
      const teamMate2 = team.getTeamMate(player2);

      // then
      expect(teamMate1).toBe(player2);
      expect(teamMate2).toBe(player1);
    });

    it("should throw an error if the player is not in the team", () => {
      // given
      const name = "Team 1";
      const player1 = new Human("John");
      const player2 = new Bot("Jane", 0);
      const team = new Team(player1, player2, name);

      // when
      const getTeamMate = () => team.getTeamMate(new Human("Jack"));

      // then
      expect(getTeamMate).toThrowError("Player is not in the team");
    });
  });
});
