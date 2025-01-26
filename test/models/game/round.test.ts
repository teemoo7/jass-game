import { describe, expect, it } from "vitest";
import { Team } from "../../../src/models/player/team.ts";
import { Player } from "../../../src/models/player/player.ts";
import { Round } from "../../../src/models/game/round.ts";
import { GameMode } from "../../../src/models/game/gamemode.ts";

describe("Game Round", () => {
  describe("Constructor", () => {
    it("should create a round with the given parameters, and no trump decider", () => {
      // given
      const number = 1;
      const team1 = new Team(new Player("Human", true), new Player("Bot1", false), "Team 1");
      const team2 = new Team(new Player("Bot2", false), new Player("Bot3", false), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;

      // when
      const round = new Round(number, teams, gameMode, undefined);

      // then
      expect(round.number).toBe(number);
      expect(round.teams).toBe(teams);
      expect(round.gameMode).toBe(gameMode);
      expect(round.scores.size).toBe(2);
      expect(round.scores.get(team1)).toBe(0);
      expect(round.scores.get(team2)).toBe(0);
      expect(round.currentTrick).toBeUndefined();
      expect(round.trumpSuit).toBeUndefined();
      expect(round.trumpDecider).toBeDefined();
      expect(round.playerHands.size).toBe(4);
    });

    it("should create a round with the given parameters, and a given trump decider", () => {
      // given
      const number = 1;
      const aGivenPlayer = new Player("Human", true);
      const team1 = new Team(aGivenPlayer, new Player("Bot1", false), "Team 1");
      const team2 = new Team(new Player("Bot2", false), new Player("Bot3", false), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;

      // when
      const round = new Round(number, teams, gameMode, aGivenPlayer);

      // then
      expect(round.number).toBe(number);
      expect(round.teams).toBe(teams);
      expect(round.gameMode).toBe(gameMode);
      expect(round.scores.size).toBe(2);
      expect(round.scores.get(team1)).toBe(0);
      expect(round.scores.get(team2)).toBe(0);
      expect(round.currentTrick).toBeUndefined();
      expect(round.trumpSuit).toBeUndefined();
      expect(round.trumpDecider).toBe(aGivenPlayer);
      expect(round.playerHands.size).toBe(4);
    });
  });
});
