import { describe, it, expect } from "vitest";
import { Game } from "../../../src/models/game/game.ts";
import { GameMode } from "../../../src/models/game/gamemode.ts";
import { Team } from "../../../src/models/player/team.ts";
import { Round } from "../../../src/models/game/round.ts";

describe("Game", () => {
  describe("constructor", () => {
    it("should create a new game", () => {
      // given
      const team1: Team = new Team({ name: "John", isHuman: true }, { name: "Jane", isHuman: false }, "Team 1");
      const team2: Team = new Team({ name: "Jack", isHuman: false }, { name: "Joe", isHuman: false }, "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;

      // when
      const game = new Game(teams, gameMode);

      // when
      expect(game.teams).toBe(teams);
      expect(game.gameMode).toBe(gameMode);
      expect(game.rounds.length).toBe(0);
      expect(game.scores.size).toBe(2);
      expect(game.scores.get(team1)).toBe(0);
      expect(game.scores.get(team2)).toBe(0);
      expect(game.targetScore).toBe(1000);
    });
  });

  describe("Scores", () => {
    it("should compute the target score given the normal game mode", () => {
      // given
      const gameMode = GameMode.NORMAL;

      // when
      const score = Game.computeTargetScore(gameMode);

      // then
      expect(score).toBe(1000);
    });

    it("should compute the target score given the double-spades game mode", () => {
      // given
      const gameMode = GameMode.DOUBLED_SPADES;

      // when
      const score = Game.computeTargetScore(gameMode);

      // then
      expect(score).toBe(1500);
    });

    it("should compute the updated scores after a round", () => {
      // given
      const team1: Team = new Team({ name: "John", isHuman: true }, { name: "Jane", isHuman: false }, "Team 1");
      const team2: Team = new Team({ name: "Jack", isHuman: false }, { name: "Joe", isHuman: false }, "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const round: Round = new Round(1, teams, gameMode, undefined);
      round.scores.set(team1, 100);
      round.scores.set(team2, 57);

      // when
      game.addRoundScores(round);

      // then
      expect(game.scores.get(team1)).toBe(round.scores.get(team1));
      expect(game.scores.get(team2)).toBe(round.scores.get(team2));
    });

    it("should compute the updated scores after multiple rounds", () => {
      // given
      const team1: Team = new Team({ name: "John", isHuman: true }, { name: "Jane", isHuman: false }, "Team 1");
      const team2: Team = new Team({ name: "Jack", isHuman: false }, { name: "Joe", isHuman: false }, "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const round1: Round = new Round(1, teams, gameMode, undefined);
      round1.scores.set(team1, 100);
      round1.scores.set(team2, 57);
      const round2: Round = new Round(2, teams, gameMode, team1.player1);
      round1.scores.set(team1, 37);
      round1.scores.set(team2, 127);

      // when
      game.addRoundScores(round1);
      game.addRoundScores(round2);

      // then
      expect(game.scores.get(team1)).toBe(round1.scores.get(team1) + round2.scores.get(team1));
      expect(game.scores.get(team2)).toBe(round1.scores.get(team2) + round2.scores.get(team2));
    });

    it("should determine that the game is over when the score is greater or equal to the target", () => {
      // given
      const team1: Team = new Team({ name: "John", isHuman: true }, { name: "Jane", isHuman: false }, "Team 1");
      const team2: Team = new Team({ name: "Jack", isHuman: false }, { name: "Joe", isHuman: false }, "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const round1: Round = new Round(1, teams, gameMode, undefined);
      round1.scores.set(team1, 1000);
      round1.scores.set(team2, 0);
      game.addRoundScores(round1);

      // when
      const isGameOver = game.isGameOver();

      // then
      expect(isGameOver).toBe(true);
    });

    it("should determine that the game is not over when the score is smaller than the target", () => {
      // given
      const team1: Team = new Team({ name: "John", isHuman: true }, { name: "Jane", isHuman: false }, "Team 1");
      const team2: Team = new Team({ name: "Jack", isHuman: false }, { name: "Joe", isHuman: false }, "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const round1: Round = new Round(1, teams, gameMode, undefined);
      round1.scores.set(team1, 999);
      round1.scores.set(team2, 0);
      game.addRoundScores(round1);

      // when
      const isGameOver = game.isGameOver();

      // then
      expect(isGameOver).toBe(false);
    });

    it("should determine the winning team", () => {
      // given
      const team1: Team = new Team({ name: "John", isHuman: true }, { name: "Jane", isHuman: false }, "Team 1");
      const team2: Team = new Team({ name: "Jack", isHuman: false }, { name: "Joe", isHuman: false }, "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const round1: Round = new Round(1, teams, gameMode, undefined);
      round1.scores.set(team1, 1000);
      round1.scores.set(team2, 999);
      game.addRoundScores(round1);

      // when
      const winner = game.getWinner();

      // then
      expect(winner).toBe(team1);
    });

    it("should determine the winning team unless the target score is not reached yet", () => {
      // given
      const team1: Team = new Team({ name: "John", isHuman: true }, { name: "Jane", isHuman: false }, "Team 1");
      const team2: Team = new Team({ name: "Jack", isHuman: false }, { name: "Joe", isHuman: false }, "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const round1: Round = new Round(1, teams, gameMode, undefined);
      round1.scores.set(team1, 999);
      round1.scores.set(team2, 999);
      game.addRoundScores(round1);

      // when
      const winner = game.getWinner();

      // then
      expect(winner).toBeUndefined();
    });
  });

  describe("Gameplay", () => {
    it("should start a game", () => {
      // given
      const team1: Team = new Team({ name: "John", isHuman: true }, { name: "Jane", isHuman: false }, "Team 1");
      const team2: Team = new Team({ name: "Jack", isHuman: false }, { name: "Joe", isHuman: false }, "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);

      // when
      game.start();

      // then
      expect(game.rounds.length).toBeGreaterThan(0);
      expect(game.prettyPrintScores()).toBeDefined();
      expect(game.getWinner()).toBeDefined();
    });
  });
});
