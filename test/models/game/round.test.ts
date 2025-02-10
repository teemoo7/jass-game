import { describe, expect, it } from "vitest";
import { Team } from "../../../src/models/player/team.ts";
import { Round } from "../../../src/models/game/round.ts";
import { GameMode } from "../../../src/models/game/gamemode.ts";
import { Human } from "../../../src/models/player/human.ts";
import { Bot } from "../../../src/models/player/bot.ts";
import { Suit, SuitHelper } from "../../../src/models/card/suit.ts";
import { Rank } from "../../../src/models/card/rank.ts";
import { Trick } from "../../../src/models/game/trick.ts";
import { PlayedCard } from "../../../src/models/game/playedcard.ts";

describe("Game Round", () => {
  describe("Constructor", () => {
    it("should create a round with the given parameters, and no trump decider", () => {
      // given
      const number = 1;
      const team1 = new Team(new Human("Human"), new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
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
      const aGivenPlayer = new Human("Human");
      const team1 = new Team(aGivenPlayer, new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
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

  describe("Decide trump suit", () => {
    it("should return the trump suit decided by the player", async () => {
      // given
      const number = 1;
      const player1 = new Bot("Bot1", 0);
      const team1 = new Team(player1, new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, undefined);

      // when
      const trumpSuit = await round.decideTrumpSuit(player1, false);

      // then
      expect(trumpSuit).toBeDefined();
    });
  });

  describe("Reset score", () => {
    it("should reset the scores of the round", () => {
      // given
      const number = 1;
      const team1 = new Team(new Human("Human"), new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, undefined);
      round.scores.set(team1, 10);
      round.scores.set(team2, 20);

      // when
      const scores = round.resetScores();

      // then
      expect(scores.get(team1)).toBe(0);
      expect(scores.get(team2)).toBe(0);
    });
  });

  describe("Deal cards to players", () => {
    it("should deal 9 cards to each player", () => {
      // given
      const number = 1;
      const team1 = new Team(new Human("Human"), new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, undefined);

      // when
      round.dealCardsToPlayers();

      // then
      for (const player of round.playerHands.keys()) {
        expect(round.playerHands.get(player)).toHaveLength(9);
      }
    });
  });

  describe("Generate deck", () => {
    it("should generate a deck of 36 cards", () => {
      // given
      const number = 1;
      const team1 = new Team(new Human("Human"), new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, undefined);

      // when
      const deck = round.generateDeck();

      // then
      expect(deck.length).toBe(36);
    });
  });

  describe("Compute starting player", () => {
    it("should return the player with the 7 of Diamonds", () => {
      // given
      const number = 1;
      const team1 = new Team(new Human("Human"), new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, undefined);

      // when
      const startingPlayer = round.computeStartingPlayer();

      // then
      const hand = round.playerHands.get(startingPlayer);
      expect(hand.some(card => card.suit === Suit.DIAMONDS && card.rank === Rank.SEVEN)).toBe(true);
    });

    it("should return the player with the Queen of Spades", () => {
      // given
      const number = 1;
      const team1 = new Team(new Human("Human"), new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.DOUBLED_SPADES;
      const round = new Round(number, teams, gameMode, undefined);

      // when
      const startingPlayer = round.computeStartingPlayer();

      // then
      const hand = round.playerHands.get(startingPlayer);
      expect(hand.some(card => card.suit === Suit.SPADES && card.rank === Rank.QUEEN)).toBe(true);
    });
  });

  describe("Get allowed cards", () => {
    it("should return all cards if the player is the first to play", () => {
      // given
      const number = 1;
      const team1 = new Team(new Human("Human"), new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, undefined);
      const startingPlayer = round.computeStartingPlayer();
      round.trumpSuit = SuitHelper.getSuits()[0];
      round.currentTrick = new Trick(round.trumpSuit);

      // when
      const allowedCards = round.getAllowedCards(startingPlayer, round.currentTrick, round.trumpSuit);

      // then
      expect(allowedCards).toEqual(round.playerHands.get(startingPlayer));
    });

    it("should return only cards of the same suit or trump suit if the player is not the first to play", () => {
      // given
      const number = 1;
      const player = new Bot("Bot1", 0);
      const team1 = new Team(player, new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, undefined);
      const startingPlayer = round.computeStartingPlayer();
      round.trumpSuit = SuitHelper.getSuits()[0];
      round.currentTrick = new Trick(SuitHelper.getSuits()[1]);
      const firstCard = round.playerHands.get(startingPlayer)![0];
      round.currentTrick.playedCards.push(new PlayedCard(firstCard, startingPlayer));
      const allowedCards = round.getAllowedCards(player, round.currentTrick, round.trumpSuit);

      // when
      const expectedCards = round.playerHands.get(player).filter(card => card.suit === firstCard.suit || card.suit === round.trumpSuit);

      // then
      expectedCards.forEach(card => expect(allowedCards).toContain(card));
    });
  });
});
