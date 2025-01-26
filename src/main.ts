import { Game } from "./models/game/game.ts";
import { Player } from "./models/player/player.ts";
import { Team } from "./models/player/team.ts";
import { GameMode } from "./models/game/gamemode.ts";
import { drawBoard } from "./ui/board.ts";

const playerHuman: Player = new Player("Me", true);
const playerBot1: Player = new Player("Bot top", false);
const playerBot2: Player = new Player("Bot right", false);
const playerBot3: Player = new Player("Bot left", false);

const team1: Team = new Team(playerHuman, playerBot1, "The best team");
const team2: Team = new Team(playerBot2, playerBot3, "Bots invadors");

const gameMode = GameMode.NORMAL;

const game = new Game([team1, team2], gameMode);

drawBoard(game);
await game.start();

