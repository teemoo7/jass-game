import { describe, expect, it, vi } from "vitest";
import { Game } from "../../../src/models/game/game.ts";
import { GameMode } from "../../../src/models/game/gamemode.ts";
import { Team } from "../../../src/models/player/team.ts";
import { Round } from "../../../src/models/game/round.ts";
import { Human } from "../../../src/models/player/human.ts";
import { Bot } from "../../../src/models/player/bot.ts";
import { Player } from "../../../src/models/player/player.ts";
import { Meld, MeldType } from "../../../src/models/game/meld.ts";
import { Rank } from "../../../src/models/card/rank.ts";
import { Suit } from "../../../src/models/card/suit.ts";
import { Card } from "../../../src/models/card/card.ts";
import { botPlayCard, drawBoard, waitForHumanPlayer } from "../../../src/ui/board.ts";

vi.mock('../../../src/ui/board.ts', () => ({
  botPlayCard: vi.fn(() => Promise.resolve(new Card(Suit.CLUBS, Rank.SIX))),
  delay: vi.fn(() => Promise.resolve()),
  drawBoard: vi.fn(),
  drawTrumpDecisionDiv: vi.fn(() => Promise.resolve(Suit.CLUBS)),
  waitForHumanPlayer: vi.fn(() => Promise.resolve(new Card(Suit.CLUBS, Rank.SIX))),
}));

describe("Game", () => {
  describe("constructor", () => {
    it("should create a new game", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
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
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
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
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
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
      expect(game.scores.get(team1)!).toBe(round1.scores.get(team1)! + round2.scores.get(team1)!);
      expect(game.scores.get(team2)!).toBe(round1.scores.get(team2)! + round2.scores.get(team2)!);
    });

    it("should determine that the game is over when the score is greater or equal to the target", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
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
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
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
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
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
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
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

  describe("Get next player", () => {
    it("should get the next player", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);

      // when
      const nextPlayer = game.getNextPlayer(team1.player1);

      // then
      expect(nextPlayer).toBe(team2.player1);
    });

    it("should get the first player when the last player is given", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);

      // when
      const nextPlayer = game.getNextPlayer(team2.player2);

      // then
      expect(nextPlayer).toBe(team1.player1);
    });
  });

  describe("Get player team", () => {
    it("should get the team of the player", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);

      // when
      const playerTeam = game.getPlayerTeam(team1.player1);

      // then
      expect(playerTeam).toBe(team1);
    });
  });

  describe("Add winning melds to team scores", () => {
    it("should add the meld points to the team score", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const melds: Map<Player, Meld> = new Map();
      melds.set(team1.player1, new Meld(100, Rank.JACK, MeldType.FIVE_IN_A_ROW, Suit.HEARTS));
      melds.set(team1.player2, new Meld(50, Rank.TEN, MeldType.FOUR_IN_A_ROW, Suit.SPADES));

      // when
      game.addWinningMeldsToTeamScores(melds);

      // then
      expect(game.scores.get(team1)).toBe(150);
      expect(game.scores.get(team2)).toBe(0);
    });
  });

  describe("Get winning melds", () => {
    it("should get the winning melds of the team", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const melds: Map<Player, Meld> = new Map();
      const meld1 = new Meld(100, Rank.JACK, MeldType.FIVE_IN_A_ROW, Suit.HEARTS);
      const meld2 = new Meld(50, Rank.TEN, MeldType.FOUR_IN_A_ROW, Suit.SPADES);
      melds.set(team1.player1, meld1);
      melds.set(team1.player2, meld2);
      melds.set(team2.player1, new Meld(20, Rank.SEVEN, MeldType.THREE_IN_A_ROW, Suit.DIAMONDS));
      melds.set(team2.player2, new Meld(20, Rank.EIGHT, MeldType.THREE_IN_A_ROW, Suit.CLUBS));

      // when
      const winningMelds = game.getWinningMelds(melds);

      // then
      expect(winningMelds.size).toBe(2);
      expect(winningMelds.get(team1.player1)).toBe(meld1);
      expect(winningMelds.get(team1.player2)).toBe(meld2);
    });
  });

  describe("Get highest meld entry", () => {
    it("should get the highest meld entry of the team", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const melds: Map<Player, Meld> = new Map();
      const meld1 = new Meld(100, Rank.JACK, MeldType.FIVE_IN_A_ROW, Suit.HEARTS);
      const meld2 = new Meld(50, Rank.TEN, MeldType.FOUR_IN_A_ROW, Suit.SPADES);
      melds.set(team1.player1, meld1);
      melds.set(team1.player2, meld2);

      // when
      const [player, meld] = game.getHighestMeldEntry(melds);

      // then
      expect(player).toBe(team1.player1);
      expect(meld).toBe(meld1);
    });
  });

  describe("Pretty print scores", () => {
    it("should pretty print the scores of the game", () => {
      // given
      const team1: Team = new Team(new Human("John"), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      const round1: Round = new Round(1, teams, gameMode, undefined);
      round1.scores.set(team1, 100);
      round1.scores.set(team2, 57);
      game.addRoundScores(round1);

      // when
      const prettyPrintedScores = game.prettyPrintScores();

      // then
      expect(prettyPrintedScores).toBe("Team 1: 100, Team 2: 57");
    });
  });

  describe("Start game", () => {
    it("should start a new game until target score has been reached by the winning team", async () => {
      // given
      const team1: Team = new Team(new Bot("John", 0), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      game.scores.set(team1, 1000);
      game.scores.set(team2, 999);

      // when
      await game.start();

      // then
      expect(game.isGameOver()).toBe(true);
      expect(game.getWinner()).toBe(team1);
    });

    it("should start a new game and play rounds until it's over", async () => {
      // given
      const team1: Team = new Team(new Bot("John", 0), new Bot("Jane", 0), "Team 1");
      const team2: Team = new Team(new Bot("Jack", 0), new Bot("Joe", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const game = new Game(teams, gameMode);
      game.scores.set(team1, 999);
      game.scores.set(team2, 999);

      // when
      await game.start();

      // then
      expect(game.isGameOver()).toBe(true);
      expect(drawBoard).toHaveBeenCalled();
      expect(waitForHumanPlayer).not.toHaveBeenCalled();
      expect(botPlayCard).toHaveBeenCalled();
      expect(game.rounds.length).toBeGreaterThan(0);
      game.rounds.forEach((round) => {
        expect(round.trumpSuit).toBeDefined();
        expect(round.playedTricks.length).toBe(9);
      });
    });
  });
});
