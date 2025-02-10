import { drawBoard, drawNewGameSettings } from "./ui/board.ts";

const game = await drawNewGameSettings();
drawBoard(game);
await game.start();

