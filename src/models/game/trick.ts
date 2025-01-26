import { Player } from "../player/player.ts";
import { CardHelper } from "../card/card.ts";
import { PlayedCard } from "./playedcard.ts";
import { Suit } from "../card/suit.ts";

export class Trick {
  readonly trumpSuit: Suit;
  readonly playedCards: PlayedCard[];

  constructor(trumpSuit: Suit) {
    this.playedCards = [];
    this.trumpSuit = trumpSuit;
  }

  computeTrickScore(): number {
    return this.playedCards.reduce((score, playedCard) => {
      return score + CardHelper.computeCardValue(playedCard.card, this.trumpSuit === playedCard.card.suit);
    }, 0);
  }

  computeWinningPlayedCard(): PlayedCard | undefined {
    if (this.playedCards.length === 0) {
      return undefined;
    }

    if (this.playedCards.length === 1) {
      return this.playedCards[0];
    }

    const firstCard = this.playedCards[0];
    const firstCardSuit = firstCard.card.suit;

    const remainingCards = this.playedCards.filter((playedCard) => playedCard.card.suit === firstCardSuit || playedCard.card.suit === this.trumpSuit);

    return remainingCards.reduce((highest, playedCard) => {
      return CardHelper.computeCardPower(playedCard.card, playedCard.card.suit === this.trumpSuit) >
      CardHelper.computeCardPower(highest.card, highest.card.suit === this.trumpSuit)
        ? playedCard
        : highest;
    });
  }

  getPlayedCardByPlayer(player: Player): PlayedCard | undefined {
    return this.playedCards.find((playedCard) => playedCard.player === player);
  }
}
