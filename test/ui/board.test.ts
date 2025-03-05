import { afterEach, describe, expect, it } from "vitest";
import { botPlayCard, waitForHumanPlayer } from "../../src/ui/board.ts";
import { Card } from "../../src/models/card/card.ts";
import { Suit, SuitHelper } from "../../src/models/card/suit.ts";
import { Rank, RankHelper } from "../../src/models/card/rank.ts";
import { Player } from "../../src/models/player/player.ts";
import { Bot } from "../../src/models/player/bot.ts";
import { Round } from "../../src/models/game/round.ts";

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
        currentTrick: [],
        trumpSuit: Suit.HEARTS,
        getCardToPlay: vi.fn(() => card),
      };

      // when
      const selectedCard: Card = await botPlayCard(player, round);

      // then
      expect(selectedCard).toBe(card);
    });
  });
});
