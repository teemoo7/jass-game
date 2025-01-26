import { describe, expect, it } from "vitest";
import { Player } from "../../../src/models/player/player.ts";

describe("Player", () => {
  describe("constructor", () => {
    it("should create a new player", () => {
      // given
      const name = "John";
      const isHuman = true;

      // when
      const player = new Player(name, isHuman);

      // then
      expect(player.name).toBe(name);
      expect(player.isHuman).toBe(isHuman);
    });
  });
});
