import { Card } from "../card/card.ts";
import { Player } from "../player/player.ts";

export class PlayedCard {
  readonly card: Card;
  readonly player: Player;

  constructor(card: Card, player: Player) {
    this.card = card;
    this.player = player;
  }
}
