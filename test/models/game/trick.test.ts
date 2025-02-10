import { describe, expect, it } from "vitest";
import { Trick } from "../../../src/models/game/trick.ts";
import { Suit } from "../../../src/models/card/suit.ts";
import { PlayedCard } from "../../../src/models/game/playedcard.ts";
import { Card } from "../../../src/models/card/card.ts";
import { Rank } from "../../../src/models/card/rank.ts";
import { Human } from "../../../src/models/player/human.ts";

describe("Trick", () => {
  describe("constructor", () => {
    it("should create a new trick", () => {
      // given
      const trumpSuit = Suit.DIAMONDS;

      // when
      const trick = new Trick(trumpSuit);

      // then
      expect(trick.trumpSuit).toBe(trumpSuit);
      expect(trick.playedCards).toEqual([]);
    });
  });

  describe("Compute trick score", () => {
    it("should compute the trick score to be 0 when no card is played yet", () => {
      // given
      const trumpSuit = Suit.DIAMONDS;

      // when
      const trick = new Trick(trumpSuit);

      // then
      expect(trick.computeTrickScore()).toBe(0);
    });

    it("should compute the trick score to be the sum of the card values", () => {
      // given
      const trumpSuit = Suit.DIAMONDS;
      const playedCard1 = new PlayedCard(new Card(trumpSuit, Rank.JACK), new Human("John"));
      const playedCard2 = new PlayedCard(new Card(Suit.SPADES, Rank.JACK), new Human("Jack"));
      const playedCard3 = new PlayedCard(new Card(trumpSuit, Rank.SEVEN), new Human("Joe"));

      // when
      const trick = new Trick(trumpSuit);
      trick.playedCards.push(playedCard1, playedCard2, playedCard3);

      // then
      expect(trick.computeTrickScore()).toBe(20 + 2 + 0);
    });
  });

  describe("Compute winning played card", () => {
    it("should return undefined when no card is played yet", () => {
      // given
      const trumpSuit = Suit.DIAMONDS;
      const trick = new Trick(trumpSuit);

      // when
      const winningPlayedCard = trick.computeWinningPlayedCard();

      // then
      expect(winningPlayedCard).toBe(undefined);
    });

    it("should return the only played card when only one card is played", () => {
      // given
      const trumpSuit = Suit.DIAMONDS;
      const playedCard = new PlayedCard(new Card(trumpSuit, Rank.JACK), new Human("John"));
      const trick = new Trick(trumpSuit);
      trick.playedCards.push(playedCard);

      // when
      const winningPlayedCard = trick.computeWinningPlayedCard();

      // then
      expect(winningPlayedCard).toBe(playedCard);
    });

    it("should return the highest card when multiple cards are played", () => {
      // given
      const trumpSuit = Suit.DIAMONDS;
      const playedCard1 = new PlayedCard(new Card(trumpSuit, Rank.JACK), new Human("John"));
      const playedCard2 = new PlayedCard(new Card(Suit.SPADES, Rank.JACK), new Human("Jack"));
      const playedCard3 = new PlayedCard(new Card(trumpSuit, Rank.SEVEN), new Human("Joe"));
      const trick = new Trick(trumpSuit);
      trick.playedCards.push(playedCard1, playedCard2, playedCard3);

      // when
      const winningPlayedCard = trick.computeWinningPlayedCard();

      // then
      expect(winningPlayedCard).toBe(playedCard1);
    });
  });

  describe("Get played card by player", () => {
    it("should return the played card of the player", () => {
      // given
      const trumpSuit = Suit.DIAMONDS;
      const player1 = new Human("John");
      const player2 = new Human("Jack");
      const playedCard1 = new PlayedCard(new Card(trumpSuit, Rank.JACK), player1);
      const playedCard2 = new PlayedCard(new Card(Suit.SPADES, Rank.JACK), player2);
      const trick = new Trick(trumpSuit);
      trick.playedCards.push(playedCard1, playedCard2);

      // when
      const actualPlayedCard1 = trick.getPlayedCardByPlayer(player1);
      const actualPlayedCard2 = trick.getPlayedCardByPlayer(player2);

      // then
      expect(actualPlayedCard1).toBe(playedCard1);
      expect(actualPlayedCard2).toBe(playedCard2);
    });

    it("should return undefined if the player has not played a card", () => {
      // given
      const trumpSuit = Suit.DIAMONDS;
      const player1 = new Human("John");
      const player2 = new Human("Jack");
      const playedCard1 = new PlayedCard(new Card(trumpSuit, Rank.JACK), player1);
      const trick = new Trick(trumpSuit);
      trick.playedCards.push(playedCard1);

      // when
      const actualPlayedCard2 = trick.getPlayedCardByPlayer(player2);

      // then
      expect(actualPlayedCard2).toBe(undefined);
    });
  });
});
