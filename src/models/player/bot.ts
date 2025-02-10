import { Player } from "./player.ts";

export class Bot extends Player {
  readonly level: number;

  constructor(name: string, level: number) {
    super(name);
    this.level = level;
  }

  isHuman(): boolean {
    return false;
  }

}
