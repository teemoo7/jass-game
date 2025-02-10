export abstract class Player {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract isHuman(): boolean;
}
