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
import { Player } from "../../../src/models/player/player.ts";
import { Card } from "../../../src/models/card/card.ts";

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
      const hand = round.playerHands.get(startingPlayer)!;
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
      const hand = round.playerHands.get(startingPlayer)!;
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

      // when
      const allowedCards = round.getAllowedCards(player, round.currentTrick, round.trumpSuit);

      // then
      const expectedCards = round.playerHands.get(player)!.filter(card => card.suit === firstCard.suit || card.suit === round.trumpSuit);
      expectedCards.forEach(card => expect(allowedCards).toContain(card));
    });
  });

  describe("Get card to play", () => {
    it("should return the card to play", () => {
      // given
      const player: Player = new Human("Human");
      const trumpSuit: Suit = Suit.HEARTS;
      const currentTrick: Trick = new Trick(trumpSuit);
      const number = 1;
      const team1 = new Team(player, new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, player);
      round.trumpSuit = trumpSuit;
      round.currentTrick = currentTrick;

      // when
      const card = round.getCardToPlay(player, currentTrick, trumpSuit);

      // then
      //todo: improve AI tests
      expect(card).toBeDefined();
    });
  });

  describe("Player might still have suit", () => {
    it("should say true for a player who always played suit cards when it was mandatory and the trump Jack was played", () => {
      // given
      const player1 = new Bot("Bot1", 0);
      const player2 = new Bot("Bot2", 0);
      const player3 = new Bot("Bot3", 0);
      const player4 = new Bot("Bot4", 0);
      const team1 = new Team(player1, player2, "Team 1");
      const team2 = new Team(player3, player4, "Team 2");
      const round: Round = new Round(1, [team1, team2], GameMode.NORMAL, player1);
      const trumpSuit = Suit.HEARTS;
      round.trumpSuit = trumpSuit;
      const trick1 = new Trick(trumpSuit);
      trick1.playedCards.push(new PlayedCard(new Card(trumpSuit, Rank.QUEEN), player1));
      trick1.playedCards.push(new PlayedCard(new Card(trumpSuit, Rank.JACK), player2));
      trick1.playedCards.push(new PlayedCard(new Card(Suit.CLUBS, Rank.TEN), player3));

      // when
      const player1MightHaveTrumpSuit = round.playerMightStillHaveSuit(player1, trumpSuit);
      const player2MightHaveTrumpSuit = round.playerMightStillHaveSuit(player2, trumpSuit);
      const player3MightHaveTrumpSuit = round.playerMightStillHaveSuit(player3, trumpSuit);
      const player4MightHaveTrumpSuit = round.playerMightStillHaveSuit(player4, trumpSuit);

      // then
      expect(player1MightHaveTrumpSuit).toBe(true);
      expect(player2MightHaveTrumpSuit).toBe(true);
      expect(player3MightHaveTrumpSuit).toBe(false);
      expect(player4MightHaveTrumpSuit).toBe(true);
    });
  });

  describe("Add score", () => {
    it("should add the score of the current trick to the winning team", () => {
      // given
      const team1 = new Team(new Human("Human"), new Bot("Bot1", 0), "Team 1");
      const team2 = new Team(new Bot("Bot2", 0), new Bot("Bot3", 0), "Team 2");
      const round: Round = new Round(1, [team1, team2], GameMode.NORMAL, undefined);
      const scoreToAdd = 144;

      // when
      round.addScore(team2, scoreToAdd);

      // then
      expect(round.scores.get(team1)).toBe(0);
      expect(round.scores.get(team2)).toBe(scoreToAdd);
    });
  });

  describe("Get played trump cards", () => {
    it("should return the trump cards played in the current round", () => {
      // given
      const trumpSuit = Suit.HEARTS;
      const trick1 = new Trick(trumpSuit);
      const player1 = new Human("Human");
      const player2 = new Bot("Bot1", 0);
      const player3 = new Bot("Bot2", 0);
      const player4 = new Bot("Bot3", 0);
      trick1.playedCards.push(new PlayedCard(new Card(trumpSuit, Rank.QUEEN), player1));
      trick1.playedCards.push(new PlayedCard(new Card(trumpSuit, Rank.JACK), player2));
      trick1.playedCards.push(new PlayedCard(new Card(trumpSuit, Rank.NINE), player3));
      trick1.playedCards.push(new PlayedCard(new Card(Suit.DIAMONDS, Rank.EIGHT), player4));
      const trick2 = new Trick(Suit.CLUBS);
      trick2.playedCards.push(new PlayedCard(new Card(Suit.CLUBS, Rank.ACE), player1));
      trick2.playedCards.push(new PlayedCard(new Card(trumpSuit, Rank.SIX), player2));
      trick2.playedCards.push(new PlayedCard(new Card(trumpSuit, Rank.ACE), player3));
      const round = new Round(1, [new Team(player1, player2, "A"), new Team(player3, player4, "B")], GameMode.NORMAL, player1);
      round.playedTricks.push(trick1);
      round.playedTricks.push(trick2);
      round.trumpSuit = trumpSuit;

      // when
      const playedTrumpCards = round.getPlayedTrumpCards();

      // then
      expect(playedTrumpCards).toHaveLength(5);
    });
  });

  describe("Decide trump suit", () => {
    it("should return the trump suit decided by the player", async () => {
      // given
      const number = 1;
      const player = new Bot("Bot1", 0);
      const team1 = new Team(player, new Bot("Bot2", 0), "Team 1");
      const team2 = new Team(new Bot("Bot3", 0), new Bot("Bot4", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, player);
      const expectedTrumpSuit = Suit.HEARTS;
      round.playerHands.set(player, [new Card(expectedTrumpSuit, Rank.JACK), new Card(expectedTrumpSuit, Rank.NINE), new Card(expectedTrumpSuit, Rank.KING), new Card(Suit.DIAMONDS, Rank.EIGHT), new Card(Suit.DIAMONDS, Rank.TEN)]);

      // when
      const trumpSuit = await round.decideTrumpSuit(player, false);

      // then
      expect(trumpSuit).toBe(expectedTrumpSuit);
    });

    it("should return the trump suit decided by the teammate bot", async () => {
      // given
      const number = 1;
      const player = new Bot("Bot1", 0);
      const teamMate = new Bot("Bot2", 0);
      const team1 = new Team(player, teamMate, "Team 1");
      const team2 = new Team(new Bot("Bot3", 0), new Bot("Bot4", 0), "Team 2");
      const teams = [team1, team2];
      const gameMode = GameMode.NORMAL;
      const round = new Round(number, teams, gameMode, player);
      const expectedTrumpSuit = Suit.HEARTS;
      round.playerHands.set(player, [new Card(Suit.CLUBS, Rank.EIGHT), new Card(Suit.CLUBS, Rank.NINE), new Card(Suit.SPADES, Rank.KING), new Card(Suit.SPADES, Rank.EIGHT), new Card(Suit.DIAMONDS, Rank.TEN)]);
      round.playerHands.set(teamMate, [new Card(expectedTrumpSuit, Rank.JACK), new Card(expectedTrumpSuit, Rank.NINE), new Card(expectedTrumpSuit, Rank.KING), new Card(Suit.DIAMONDS, Rank.EIGHT), new Card(Suit.DIAMONDS, Rank.TEN)]);

      // when
      const trumpSuit = await round.decideTrumpSuit(player, true);

      // then
      expect(trumpSuit).toBe(expectedTrumpSuit);
    });
  });

  describe("Compute best trump suit", () => {
    it("should return the trump suit when the hand contains a Jack plus 2 cards of the same suit", () => {
      // given
      const round: Round = new Round(1, [], GameMode.NORMAL, new Human("Human"));
      const canPass = false;
      const expectedSuit: Suit = Suit.HEARTS;
      const hand: Card[] = [new Card(expectedSuit, Rank.JACK), new Card(expectedSuit, Rank.SIX), new Card(expectedSuit, Rank.KING), new Card(Suit.DIAMONDS, Rank.NINE), new Card(Suit.DIAMONDS, Rank.JACK)];

      // when
      const trumpSuit = round.computeBestTrumpSuit(hand, canPass);

      // then
      expect(trumpSuit).toBe(Suit.HEARTS);
    });

    it("should return the trump suit when the hand contains a Nine plus 3 cards of the same suit", () => {
      // given
      const round: Round = new Round(1, [], GameMode.NORMAL, new Human("Human"));
      const canPass = false;
      const expectedSuit: Suit = Suit.HEARTS;
      const hand: Card[] = [new Card(expectedSuit, Rank.NINE), new Card(expectedSuit, Rank.SIX), new Card(expectedSuit, Rank.KING), new Card(expectedSuit, Rank.SEVEN), new Card(Suit.DIAMONDS, Rank.NINE), new Card(Suit.DIAMONDS, Rank.JACK)];

      // when
      const trumpSuit = round.computeBestTrumpSuit(hand, canPass);

      // then
      expect(trumpSuit).toBe(Suit.HEARTS);
    });

    it("should return the trump suit when the hand contains an Ace plus 4 cards of the same suit", () => {
      // given
      const round: Round = new Round(1, [], GameMode.NORMAL, new Human("Human"));
      const canPass = false;
      const expectedSuit: Suit = Suit.HEARTS;
      const hand: Card[] = [new Card(expectedSuit, Rank.ACE), new Card(expectedSuit, Rank.SIX), new Card(expectedSuit, Rank.KING), new Card(expectedSuit, Rank.SEVEN), new Card(expectedSuit, Rank.EIGHT), new Card(Suit.DIAMONDS, Rank.NINE), new Card(Suit.DIAMONDS, Rank.JACK)];

      // when
      const trumpSuit = round.computeBestTrumpSuit(hand, canPass);

      // then
      expect(trumpSuit).toBe(Suit.HEARTS);
    });

    it("should pass when the hand contains not enough good cards of the same suit and passing is possible", () => {
      // given
      const round: Round = new Round(1, [], GameMode.NORMAL, new Human("Human"));
      const canPass = true;
      const hand: Card[] = [new Card(Suit.HEARTS, Rank.ACE), new Card(Suit.HEARTS, Rank.SIX), new Card(Suit.HEARTS, Rank.SEVEN), new Card(Suit.HEARTS, Rank.EIGHT), new Card(Suit.DIAMONDS, Rank.NINE), new Card(Suit.DIAMONDS, Rank.JACK)];

      // when
      const trumpSuit = round.computeBestTrumpSuit(hand, canPass);

      // then
      expect(trumpSuit).toBeUndefined();
    });


    it("should return the trump suit with best cards possible if it cannot pass", () => {
      // given
      const round: Round = new Round(1, [], GameMode.NORMAL, new Human("Human"));
      const canPass = false;
      const expectedSuit: Suit = Suit.HEARTS;
      const hand: Card[] = [new Card(expectedSuit, Rank.ACE), new Card(expectedSuit, Rank.NINE), new Card(expectedSuit, Rank.KING), new Card(Suit.DIAMONDS, Rank.EIGHT), new Card(Suit.DIAMONDS, Rank.TEN)];

      // when
      const trumpSuit = round.computeBestTrumpSuit(hand, canPass);

      // then
      expect(trumpSuit).toBe(Suit.HEARTS);
    });
  });

  describe("Get teammate", () => {
    it("should return the teammate of the given player", () => {
      // given
      const player = new Human("Human");
      const teamMate = new Bot("Team Mate", 0);
      const opponent1 = new Bot("Opponent 1", 0);
      const opponent2 = new Bot("Opponent 2", 0);

      const team = new Team(player, teamMate, "Team 1");
      const opponentsTeam = new Team(opponent1, opponent2, "Team 2");

      const round = new Round(1, [team, opponentsTeam], GameMode.NORMAL, player);

      // when
      const actualTeamMate: Player = round.getTeamMate(player);

      // then
      expect(actualTeamMate).toBe(teamMate);
    });
  });

  describe("Get opponents", () => {
    it("should return the opponents of the given player", () => {
      // given
      const player = new Human("Human");
      const teamMate = new Bot("Team Mate", 0);
      const opponent1 = new Bot("Opponent 1", 0);
      const opponent2 = new Bot("Opponent 2", 0);

      const team = new Team(player, teamMate, "Team 1");
      const opponentsTeam = new Team(opponent1, opponent2, "Team 2");

      const round = new Round(1, [team, opponentsTeam], GameMode.NORMAL, player);

      // when
      const opponents: Player[] = round.getOpponents(player);

      // then
      expect(opponents).toEqual([opponent1, opponent2]);
    });
  });

});
