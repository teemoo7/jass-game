import { Player } from "./player.ts";

export class Team {
  readonly player1: Player;
  readonly player2: Player;
  readonly name: string;

  constructor(player1: Player, player2: Player, name: string) {
    this.player1 = player1;
    this.player2 = player2;
    this.name = name;
  }

  getPlayers(): Player[] {
    return [this.player1, this.player2];
  }

  hasPlayer(player: Player) {
    return this.player1 === player || this.player2 === player;
  }

  getTeamMate(player: Player): Player {
    if (this.player1 === player) {
      return this.player2;
    } else if (this.player2 === player) {
      return this.player1;
    }
    throw new Error("Player is not in the team");
  }
}
