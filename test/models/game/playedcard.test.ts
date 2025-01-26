import { describe, it, expect } from "vitest";
import { Card } from "../../../src/models/card/card.ts";
import { Suit } from "../../../src/models/card/suit.ts";
import { Rank } from "../../../src/models/card/rank.ts";
import { Player } from "../../../src/models/player/player.ts";
import { PlayedCard } from "../../../src/models/game/playedcard.ts";

describe("PlayedCard", () => {
  describe("constructor", () => {
    it("should create a new played card", () => {
      // given
      const card = new Card(Suit.HEARTS, Rank.QUEEN);
      const player = new Player("John", true);

      // when
      const playedCard = new PlayedCard(card, player);

      // then
      expect(playedCard.card).toBe(card);
      expect(playedCard.player).toBe(player);
    });
  });
});
