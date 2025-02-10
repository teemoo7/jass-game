import { describe, expect, it } from "vitest";
import { Card } from "../../../src/models/card/card.ts";
import { Suit } from "../../../src/models/card/suit.ts";
import { Rank } from "../../../src/models/card/rank.ts";
import { PlayedCard } from "../../../src/models/game/playedcard.ts";
import { Human } from "../../../src/models/player/human.ts";

describe("PlayedCard", () => {
  describe("constructor", () => {
    it("should create a new played card", () => {
      // given
      const card = new Card(Suit.HEARTS, Rank.QUEEN);
      const player = new Human("John");

      // when
      const playedCard = new PlayedCard(card, player);

      // then
      expect(playedCard.card).toBe(card);
      expect(playedCard.player).toBe(player);
    });
  });
});
