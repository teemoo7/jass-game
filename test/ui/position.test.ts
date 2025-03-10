import { describe, it, expect } from "vitest";
import { Position, PositionHelper } from "../../src/ui/position.ts";

describe("Position", () => {
  it("should return all positions", () => {
    // given
    const expectedPositions = [Position.BOTTOM, Position.RIGHT, Position.TOP, Position.LEFT];

    // when
    const positions = PositionHelper.getPositions();

    // then
    expect(positions).toEqual(expectedPositions);
  });
});
