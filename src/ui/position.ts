export enum Position {
  BOTTOM = "bottom",
  RIGHT = "right",
  TOP = "top",
  LEFT = "left",
}

export class PositionHelper {

  static getPositions(): Position[] {
    return Object.keys(Position).map((position) => Position[position]);
  }
}
