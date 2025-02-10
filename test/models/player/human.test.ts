import { describe, expect, it } from "vitest";
import { Human } from "../../../src/models/player/human.ts";

describe("Human", () => {
  describe("constructor", () => {
    it("should create a new human player", () => {
      // given
      const name = "John";

      // when
      const player = new Human(name);

      // then
      expect(player.name).toBe(name);
      expect(player.isHuman()).toBe(true);
    });
  });
});
