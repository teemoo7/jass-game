import { Player } from "./player.ts";

export class Bot extends Player {
  public static readonly LEVEL_STUPID: number = 0;
  public static readonly LEVEL_EASY: number = 1;
  public static readonly LEVEL_MEDIUM: number = 2;
  public static readonly LEVEL_HARD: number = 3;

  readonly level: number;

  constructor(name: string, level: number) {
    super(name);
    this.level = level;
  }

  isHuman(): boolean {
    return false;
  }

}
