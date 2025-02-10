import { Player } from "./player.ts";

export class Human extends Player {
  constructor(name: string) {
    super(name);
  }

  isHuman(): boolean {
    return true;
  }
}
