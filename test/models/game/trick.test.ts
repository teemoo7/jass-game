import { describe, it, expect } from "vitest";
import { Trick } from "../../../src/models/game/trick.ts";
import { Suit } from "../../../src/models/card/suit.ts";
import { Player } from "../../../src/models/player/player.ts";
import { PlayedCard } from "../../../src/models/game/playedcard.ts";
import { Card } from "../../../src/models/card/card.ts";
import { Rank } from "../../../src/models/card/rank.ts";

describe("Trick", () => {
  describe("constructor", () => {
    it("should create a new trick", () => {
      // given
      const playerHands = new Map();
      const trumpSuit = Suit.DIAMONDS;

      // when
      const trick = new Trick(playerHands, trumpSuit);

      // then
      expect(trick.playerHands).toBe(playerHands);
      expect(trick.trumpSuit).toBe(trumpSuit);
      expect(trick.playedCards).toEqual([]);
    });
  });

  describe("Compute trick score", () => {
    it("should compute the trick score to be 0 when no card is played yet", () => {
      // given
      const playerHands = new Map();
      const trumpSuit = Suit.DIAMONDS;

      // when
      const trick = new Trick(playerHands, trumpSuit);

      // then
      expect(trick.computeTrickScore()).toBe(0);
    });

    it("should compute the trick score to be the sum of the card values", () => {
      // given
      const playerHands = new Map();
      const trumpSuit = Suit.DIAMONDS;
      const playedCard1 = new PlayedCard(new Card(trumpSuit, Rank.JACK), new Player("John", true));
      const playedCard2 = new PlayedCard(new Card(Suit.SPADES, Rank.JACK), new Player("Jack", true));
      const playedCard3 = new PlayedCard(new Card(trumpSuit, Rank.SEVEN), new Player("Joe", true));

      // when
      const trick = new Trick(playerHands, trumpSuit);
      trick.playedCards.push(playedCard1, playedCard2, playedCard3);

      // then
      expect(trick.computeTrickScore()).toBe(20 + 2 + 0);
    });
  });
});
