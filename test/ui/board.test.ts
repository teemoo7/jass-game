import { afterEach, describe, expect, it } from "vitest";
import {
  botPlayCard,
  delay,
  drawBoard,
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
      document.body.querySelector("#" + card1Div.id)?.click();

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

      const round: Round = {
        currentTrick: undefined,
        trumpSuit: Suit.HEARTS,
        getCardToPlay: vi.fn(() => card),
      };

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
      document.querySelector("#startGameButton")?.click();

      // then
      const game = await gamePromise;
      expect(game.gameMode).toBe(gameMode);
      expect(game.teams[0].name).toBe(teamName);
      expect(game.teams[0].player1.name).toBe(playerName);
      expect(game.teams[1].player1).toBeInstanceOf(Bot);
      expect(game.teams[1].player1.level).toBe(botsLevel);
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
      const round: Round = {
        playerHands: playerHands,
        computeBestTrumpSuit: vi.fn(() => Suit.DIAMONDS),
      }
      const suit = Suit.DIAMONDS;
      const appDiv = document.createElement("div");
      appDiv.id = "app";
      document.body.appendChild(appDiv);

      // when
      const trumpSuitPromise = drawTrumpDecisionDiv(round, player, canPass);
      document.querySelector("#suit" + suit)?.click();

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
      const round: Round = {
        playerHands: playerHands,
        computeBestTrumpSuit: vi.fn(() => Suit.DIAMONDS),
        getTeamMate: vi.fn(() => teamMate),
        async decideTrumpSuit(player: Player, canPass: boolean): Promise<Suit> {
          return teamMateSelectedSuit;
        },
      }
      const appDiv = document.createElement("div");
      appDiv.id = "app";
      document.body.appendChild(appDiv);

      // when
      const trumpSuitPromise = drawTrumpDecisionDiv(round, player, canPass);
      document.querySelector("#passButton")?.click();

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

      const playedCard = new Card(Suit.DIAMONDS, Rank.JACK);

      const trick: Trick = {
        computeTrickScore: vi.fn(() => 2),
        computeWinningPlayedCard: vi.fn(() => undefined),
        getPlayedCardByPlayer: vi.fn(() => undefined),
      };

      const provisionalMelds = new Map<Player, Meld>();
      provisionalMelds.set(player1, new Meld(20, Rank.ACE, MeldType.THREE_IN_A_ROW, Suit.CLUBS));

      const definitiveMelds = new Map<Player, Meld>();
      definitiveMelds.set(player1, new Meld(20, Rank.ACE, MeldType.THREE_IN_A_ROW, Suit.CLUBS));

      const round: Round = {
        number: 0,
        trumpSuit: Suit.HEARTS,
        trumpDecider: player1,
        provisionalMelds: provisionalMelds,
        definitiveMelds: definitiveMelds,
        playerHands: playerHands,
        getPlayedTrumpCards: vi.fn(() => [new Card(Suit.HEARTS, Rank.QUEEN)]),
        currentTrick: trick,
        getAllowedCards: vi.fn(() => [new Card(Suit.HEARTS, Rank.KING), new Card(Suit.HEARTS, Rank.JACK)]),
      };

      const scores = new Map<Team, number>();
      scores.set(team1, 0);
      scores.set(team2, 0);
      const game: Game = {
        teams: [team1, team2],
        scores: scores,
        rounds: [round],
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
});
