import { afterEach, describe, expect, it, vi } from "vitest";
import {
  botPlayCard,
  delay,
  drawBoard, drawGameOverDialog,
  drawNewGameSettings,
  drawTrumpDecisionDiv,
  waitForHumanPlayer
} from "../../src/ui/board.ts";
import { Card } from "../../src/models/card/card.ts";
import { Suit, SuitHelper } from "../../src/models/card/suit.ts";
import { Rank } from "../../src/models/card/rank.ts";
import { Player } from "../../src/models/player/player.ts";
import { Bot } from "../../src/models/player/bot.ts";
import { Round } from "../../src/models/game/round.ts";
import { GameMode } from "../../src/models/game/gamemode.ts";
import { Human } from "../../src/models/player/human.ts";
import { Game } from "../../src/models/game/game.ts";
import { Meld, MeldType } from "../../src/models/game/meld.ts";
import { Team } from "../../src/models/player/team.ts";
import { Trick } from "../../src/models/game/trick.ts";

describe("Board", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("Wait for human player", () => {
    it("should wait for the human player to play a card", async () => {
      // given
      const card1 = new Card(Suit.HEARTS, Rank.QUEEN);
      const card2 = new Card(Suit.DIAMONDS, Rank.JACK);
      const hand: Card[] = [card1, card2];

      const card1Div = document.createElement("div");
      card1Div.classList.add("card-allowed");
      card1Div.setAttribute("data-card", SuitHelper.getSuitAbbreviation(card1.suit) + card1.rank);
      card1Div.id = "CardToBeClicked";
      document.body.appendChild(card1Div);

      const card2Div = document.createElement("div");
      card2Div.classList.add("card-allowed");
      card2Div.setAttribute("data-card", SuitHelper.getSuitAbbreviation(card2.suit) + card2.rank);
      document.body.appendChild(card2Div);

      // when
      const cardPromise = waitForHumanPlayer(hand);
      document.body.querySelector("#" + card1Div.id)?.dispatchEvent(new Event("click"));

      // then
      const card = await cardPromise;
      expect(card).toBe(card1);
    });
  });

  describe("Bot play card", () => {
    it("should play a card", async () => {
      // given
      const card: Card = new Card(Suit.HEARTS, Rank.QUEEN);
      const player: Player = new Bot("Bot", 0);

      const round: Round = getDefaultRoundMock();
      round.getCardToPlay = vi.fn(() => card);

      // when
      const selectedCard: Card = await botPlayCard(player, round);

      // then
      expect(selectedCard).toBe(card);
    });
  });

  describe("Delay", () => {
    it("should delay for the specified time", async () => {
      // given
      const timeInMillis = 100;

      // when
      const start = Date.now();
      await delay(timeInMillis);
      const end = Date.now();

      // then
      expect(end - start).toBeGreaterThanOrEqual(timeInMillis);
    });
  });

  describe("Draw new game settings", () => {
    it("should draw the new game settings and resolve to a new game", async () => {
      // given
      const gameMode: GameMode = GameMode.DOUBLED_SPADES;
      const playerName = "Player 1";
      const teamName = "Team 1";
      const botsLevel = 2;
      const appDiv = document.createElement("div");
      appDiv.id = "app";
      document.body.appendChild(appDiv);

      // when
      const gamePromise = drawNewGameSettings();
      document.querySelector("#gameModeOptionDoubleSpades")?.setAttribute("selected", "selected");
      (document.querySelector("#playerNameInput") as HTMLInputElement).value = playerName;
      (document.querySelector("#teamNameInput") as HTMLInputElement).value = teamName;
      document.querySelector("#botsLevelOptionMedium")?.setAttribute("selected", "selected");
      document.querySelector("#startGameButton")?.dispatchEvent(new Event("click"));

      // then
      const game = await gamePromise;
      expect(game.gameMode).toBe(gameMode);
      expect(game.teams[0].name).toBe(teamName);
      expect(game.teams[0].player1.name).toBe(playerName);
      const bot = game.teams[1].player1;
      expect(bot).toBeInstanceOf(Bot);
      expect((bot as Bot).level).toBe(botsLevel);
    });
  });

  describe("Draw trump decision div", () => {
    it("should draw the trump decision div without possibility to pass and resolve to the selected trump suit", async () => {
      // given
      const player: Player = new Human("Player 1");
      const hand: Card[] = [new Card(Suit.HEARTS, Rank.QUEEN), new Card(Suit.DIAMONDS, Rank.JACK)];
      const canPass = false;
      const playerHands: Map<Player, Card[]> = new Map<Player, Card[]>();
      playerHands.set(player, hand);
      const round: Round = getDefaultRoundMock(player, playerHands);
      round.computeBestTrumpSuit = vi.fn(() => Suit.DIAMONDS);
      const suit = Suit.DIAMONDS;
      const appDiv = document.createElement("div");
      appDiv.id = "app";
      document.body.appendChild(appDiv);

      // when
      const trumpSuitPromise = drawTrumpDecisionDiv(round, player, canPass);
      document.querySelector("#suit" + suit)?.dispatchEvent(new Event("click"));

      // then
      const trumpSuit = await trumpSuitPromise;
      expect(trumpSuit).toBe(suit);
    });

    it("should draw the trump decision div with possibility to pass and resolve to the passed selected trump suit", async () => {
      // given
      const player: Player = new Human("Player 1");
      const teamMate: Player = new Bot("Bot mate", 0);
      const hand: Card[] = [new Card(Suit.HEARTS, Rank.QUEEN), new Card(Suit.DIAMONDS, Rank.JACK)];
      const playerHands: Map<Player, Card[]> = new Map<Player, Card[]>();
      playerHands.set(player, hand);
      const canPass = true;
      const teamMateSelectedSuit = Suit.HEARTS;
      const round: Round = getDefaultRoundMock(player, playerHands);
      round.computeBestTrumpSuit = vi.fn(() => Suit.DIAMONDS);
      round.getTeamMate = vi.fn(() => teamMate);
      round.decideTrumpSuit = vi.fn(() => Promise.resolve(teamMateSelectedSuit));
      const appDiv = document.createElement("div");
      appDiv.id = "app";
      document.body.appendChild(appDiv);

      // when
      const trumpSuitPromise = drawTrumpDecisionDiv(round, player, canPass);
      document.querySelector("#passButton")?.dispatchEvent(new Event("click"));

      // then
      const trumpSuit = await trumpSuitPromise;
      expect(trumpSuit).toBe(teamMateSelectedSuit);
    });
  });

  describe("Draw board", () => {
    it("should draw the board", () => {
      // given
      const appDiv = document.createElement("div");
      appDiv.id = "app";
      document.body.appendChild(appDiv);

      const player1: Player = new Human("Player 1");
      const bot1 = new Bot("Bot1", 0);
      const bot2 = new Bot("Bot2", 0);
      const bot3 = new Bot("Bot3", 0);

      const team1: Team = new Team(player1, bot1, "Team 1");
      const team2: Team = new Team(bot2, bot3, "Team 2");

      const playerHands: Map<Player, Card[]> = new Map<Player, Card[]>();
      playerHands.set(player1, [new Card(Suit.HEARTS, Rank.KING)]);
      playerHands.set(bot1, [new Card(Suit.HEARTS, Rank.JACK), new Card(Suit.DIAMONDS, Rank.QUEEN)]);
      playerHands.set(bot2, [new Card(Suit.HEARTS, Rank.EIGHT), new Card(Suit.DIAMONDS, Rank.ACE)]);
      playerHands.set(bot3, [new Card(Suit.HEARTS, Rank.SIX), new Card(Suit.DIAMONDS, Rank.TEN)]);

      const trick: Trick = {
        trumpSuit: Suit.HEARTS,
        playedCards: [],
        computeTrickScore: vi.fn(() => 2),
        computeWinningPlayedCard: vi.fn(() => undefined),
        getPlayedCardByPlayer: vi.fn(() => undefined),
      };

      const provisionalMelds = new Map<Player, Meld>();
      provisionalMelds.set(player1, new Meld(20, Rank.ACE, MeldType.THREE_IN_A_ROW, Suit.CLUBS));

      const definitiveMelds = new Map<Player, Meld>();
      definitiveMelds.set(player1, new Meld(20, Rank.ACE, MeldType.THREE_IN_A_ROW, Suit.CLUBS));

      const round: Round = getDefaultRoundMock(player1, playerHands);
      round.provisionalMelds = provisionalMelds;
      round.definitiveMelds = definitiveMelds;
      round.getPlayedTrumpCards = vi.fn(() => [new Card(Suit.HEARTS, Rank.QUEEN)]);
      round.currentTrick = trick;
      round.getAllowedCards = vi.fn(() => [new Card(Suit.HEARTS, Rank.KING), new Card(Suit.HEARTS, Rank.JACK)]);

      const scores = new Map<Team, number>();
      scores.set(team1, 0);
      scores.set(team2, 0);
      const game: Game = {
        teams: [team1, team2],
        scores: scores,
        rounds: [round],
        gameMode: GameMode.NORMAL,
        targetScore: 1000,
        resetScores: vi.fn(() => new Map<Team, number>()),
        start: vi.fn(() => Promise.resolve()),
        roundStart: vi.fn(() => Promise.resolve()),
        getNextPlayer: vi.fn(() => player1),
        getPlayerTeam: vi.fn(() => team1),
        computePlayerMeld: vi.fn(() => undefined),
        addWinningMeldsToTeamScores: vi.fn(),
        getWinningMelds: vi.fn(() => definitiveMelds),
        getHighestMeldEntry: vi.fn().mockReturnValue(definitiveMelds.entries().next().value),
        addScore: vi.fn(),
        addRoundScores: vi.fn(),
        isGameOver: vi.fn(() => false),
        getWinner: vi.fn(() => undefined),
        prettyPrintScores: vi.fn(() => ""),
      }

      // when
      drawBoard(game);

      // then
      //todo: improve test here
      expect(document.querySelector("#container")).not.toBeNull();
      expect(document.querySelector("#baize")).not.toBeNull();
      expect(document.querySelector("#scoreboard")).not.toBeNull();
      expect(document.querySelector("#round")).not.toBeNull();
      expect(document.querySelector("#trump")).not.toBeNull();
      expect(document.querySelector("#melds")).not.toBeNull();
      expect(document.querySelector("#playedTrumpCards")).not.toBeNull();
      expect(document.querySelector("#trickPointsValue")).not.toBeNull();
    });
  });

  describe("Draw game over dialog", () => {
    it("should draw the game over dialog", () => {
      // given
      const appDiv = document.createElement("div");
      appDiv.id = "app";
      document.body.appendChild(appDiv);
      const player1: Player = new Human("Player 1");
      const bot1 = new Bot("Bot1", 0);
      const bot2 = new Bot("Bot2", 0);
      const bot3 = new Bot("Bot3", 0);

      const team1: Team = new Team(player1, bot1, "Team 1");
      const team2: Team = new Team(bot2, bot3, "Team 2");

      const game = new Game([team1, team2], GameMode.DOUBLED_SPADES);
      game.scores.set(team1, 789);
      game.scores.set(team2, 1526);

      // when
      drawGameOverDialog(game);

      // then
      expect(document.querySelector("#gameOver")).not.toBeNull();
    });
  });
});

function getDefaultRoundMock(player: Player = new Bot("Bot", 0), playerHands: Map<Player, Card[]> = new Map<Player, Card[]>()): Round {
  return {
    currentTrick: undefined,
    trumpSuit: Suit.HEARTS,
    getCardToPlay: vi.fn(() => new Card(Suit.HEARTS, Rank.QUEEN)),
    playerHands: playerHands,
    provisionalMelds: new Map<Player, Meld>(),
    definitiveMelds: new Map<Player, Meld>(),
    number: 0,
    trumpDecider: player,
    teams: [],
    gameMode: GameMode.DOUBLED_SPADES,
    scores: new Map<Team, number>(),
    playedTricks: [],
    trumpDecisionPassed: false,
    computeBestTrumpSuit: vi.fn(() => Suit.HEARTS),
    getPlayedTrumpCards: vi.fn(() => []),
    getTeamMate: vi.fn(() => new Bot("Bot mate", 0)),
    getAllowedCards: vi.fn(() => []),
    decideTrumpSuit: vi.fn(() => Promise.resolve(Suit.HEARTS)),
    resetScores: vi.fn(() => new Map<Team, number>()),
    dealCardsToPlayers: vi.fn(),
    sortHumanPlayerHand: vi.fn(),
    generateDeck: vi.fn(),
    shuffleDeck: vi.fn(),
    computeStartingPlayer: vi.fn(() => player),
    playerMightStillHaveSuit: vi.fn(() => false),
    addScore: vi.fn(),
    addMatchBonus: vi.fn(),
    getOpponents: vi.fn(() => []),
  }
}
