import { describe, expect, it } from "vitest";
import { Bot } from "../../../src/models/player/bot.ts";

describe("Bot", () => {
  describe("constructor", () => {
    it("should create a new bot player", () => {
      // given
      const name = "Bot";
      const level = 2;

      // when
      const player = new Bot(name, level);

      // then
      expect(player.name).toBe(name);
      expect(player.level).toBe(level);
      expect(player.isHuman()).toBe(false);
    });
  });
});
