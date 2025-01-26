import { Team } from "../player/team";
import { Player } from "../player/player.ts";
import { Round } from "./round.ts";
import { GameMode } from "./gamemode.ts";
import { botPlayCard, delay, drawBoard, waitForHumanPlayer } from "../../ui/board.ts";
import { Meld } from "./meld.ts";
import { Trick } from "./trick.ts";
import { PlayedCard } from "./playedcard.ts";
import { Card, CardHelper } from "../card/card.ts";
import { Suit, SuitHelper } from "../card/suit.ts";
import { Rank } from "../card/rank.ts";

export class Game {
  readonly teams: Team[];
  readonly gameMode: GameMode;
  readonly scores: Map<Team, number>;
  readonly targetScore: number;
  readonly rounds: Round[];

  constructor(teams: Team[], gameMode: GameMode) {
    this.teams = teams;
    this.gameMode = gameMode;
    this.scores = this.resetScores();
    this.targetScore = Game.computeTargetScore(gameMode);
    this.rounds = [];
  }

  resetScores(): Map<Team, number> {
    const scores = new Map();
    for (const team of this.teams) {
      scores.set(team, 0);
    }
    return scores;
  }

  async start() {
    let trumpDecider: Player | undefined = undefined;
    console.log(`Game started!`);
    while (!this.isGameOver()) {
      console.log(`Current score: ${this.prettyPrintScores()}`);
      const round = new Round(this.rounds.length + 1, this.teams, this.gameMode, trumpDecider);
      this.rounds.push(round);
      await this.roundStart(round);
      //todo: add bonus for winning all tricks
      this.addRoundScores(round);
      trumpDecider = this.getNextPlayer(round.trumpDecider);
    }
    console.log(`Game over after ${this.rounds.length} rounds with final score: ${this.prettyPrintScores()}`);
    console.log(`Winning team: ${this.getWinner()?.name}`);
  }

  async roundStart(round: Round) {
    const trumpDecider = round.trumpDecider;
    console.log(`Round ${round.number} started with ${trumpDecider.name} deciding the trump suit`);
    round.trumpSuit = this.decideTrumpSuit(trumpDecider, round.playerHands.get(trumpDecider));

    let currentPlayer = trumpDecider;

    drawBoard(this);

    for (let trickIndex = 1; trickIndex <= 9; trickIndex++) {

      console.log(`Trick ${trickIndex}`);
      round.currentTrick = new Trick(round.trumpSuit); //fixme: define currentTrick as a property of Game??

      drawBoard(this);

      for (let playerIndex = 1; playerIndex <= 4; playerIndex++) {
        const playerHand = round.playerHands.get(currentPlayer);
        if (trickIndex == 1) {
          const meld = this.computePlayerMeld(playerHand);
          if (meld) {
            round.provisionalMelds.set(currentPlayer, meld);
          }
          if (playerIndex == 4 && round.provisionalMelds.size > 0) {
            this.addWinningMeldsToTeamScores(round.provisionalMelds);
            round.provisionalMelds.clear();
          }
        }
        const card = currentPlayer.isHuman ? await waitForHumanPlayer(playerHand) : await botPlayCard(currentPlayer, round);

        // play it
        playerHand.splice(playerHand.indexOf(card), 1);
        round.currentTrick.playedCards.push(new PlayedCard(card, currentPlayer));
        console.log(
          `${currentPlayer.name} played ${card.rank} of ${card.suit} with value ${CardHelper.computeCardValue(card, round.trumpSuit === card.suit)}`
        );
        drawBoard(this);

        currentPlayer = this.getNextPlayer(currentPlayer);
      }

      // compute trick winner
      const computeWinningPlayedCard = round.currentTrick.computeWinningPlayedCard();

      let trickScore = round.currentTrick.computeTrickScore();
      if (trickIndex == 9) {
        trickScore += 5;
      }
      console.log(
        `${computeWinningPlayedCard!.player.name} won the trick with ${computeWinningPlayedCard!.card.rank} of ${computeWinningPlayedCard!.card.suit}, with a score of ${trickScore}`
      );

      const team = this.getPlayerTeam(computeWinningPlayedCard!.player);
      round.addScore(team, trickScore);

      await delay();

      currentPlayer = computeWinningPlayedCard!.player;
    }
    console.log(
      `Round ends with score: ${this.scores.get(this.teams[0])} - ${this.scores.get(this.teams[1])}`
    );
  }

  decideTrumpSuit(player: Player, hand: Card[]): Suit {

    console.log(`${player.name} is deciding trump suit with hand: ${hand.map((card) => `${card.rank} of ${card.suit}`).join(", ")}`);

    // compute valid candidates
    let candidates: [Suit, number][] = [];

    for (const suit of SuitHelper.getSuits()) {
      const suitCards = hand.filter((card) => card.suit === suit);
      if (
        (suitCards.length >= 5 && suitCards.some((card) => card.rank === Rank.ACE)) ||
        (suitCards.length >= 4 && suitCards.some((card) => card.rank === Rank.NINE)) ||
        (suitCards.length >= 3 && suitCards.some((card) => card.rank === Rank.JACK))
      ) {
        candidates.push([suit, suitCards.reduce((power, card) => power + CardHelper.computeCardPower(card, true), 0)]);
      }
    }

    console.log(`Candidates: ${candidates.map(([suit, power]) => `${suit}: ${power}`).join(", ")}`);

    if (candidates.length == 0) {
      //fixme: pass to teammate if possible
      candidates = SuitHelper.getSuits().map((suit) => [suit, hand.filter((card) => card.suit === suit).reduce((power, card) => power + CardHelper.computeCardPower(card, true), 0)]);
    }

    // take the highest power within candidates
    candidates.sort((a, b) => b[1] - a[1]);
    const trumpSuit = candidates[0][0];

    console.log(`${player.name} decided trump suit: ${trumpSuit}`);
    return trumpSuit;
  }

  getNextPlayer(currentPlayer: Player): Player {
    const players = [this.teams[0].player1, this.teams[1].player1, this.teams[0].player2, this.teams[1].player2];
    const currentIndex = players.indexOf(currentPlayer);
    return players[(currentIndex + 1) % 4];
  }

  getPlayerTeam(player: Player): Team {
    return this.teams.find((team) => team.hasPlayer(player)) as Team;
  }

  computePlayerMeld(hand: Card[]): Meld | undefined {
    return Meld.computeMeld(hand);
  }

  addWinningMeldsToTeamScores(melds: Map<Player, Meld>) {
    console.log(
      `Melds: ${Array.from(melds.entries())
        .map(([player, meld]) => `${player.name}: ${meld.points} points`)
        .join(", ")}`
    );
    const [highestPlayer, highestMeld] = this.getHighestMeldEntry(melds);
    const team = this.getPlayerTeam(highestPlayer);
    for (const player of team.getPlayers()) {
      const playerMeld = melds.get(player);
      this.addScore(team, playerMeld ? playerMeld.points : 0);
    }
    console.log(
      `${highestPlayer.name} has the highest meld: ${highestMeld.type} of ${highestMeld.highestRank} worth ${highestMeld.points} points`
    );
  }

  getHighestMeldEntry(melds: Map<Player, Meld>): [Player, Meld] {
    return Array.from(melds.entries()).reduce(([highestPlayer, highestMeld], [player, meld]) => {
      return meld.points > highestMeld.points ? [player, meld] : [highestPlayer, highestMeld];
    });
  }

  addScore(team: Team, score: number): void {
    this.scores.set(team, score + this.scores.get(team));
  }

  addRoundScores(round: Round) {
    this.scores.forEach((score, team) => {
      this.addScore(team, round.scores.get(team));
    });
  }

  isGameOver(): boolean {
    return this.getWinner() !== undefined;
  }

  getWinner(): Team | undefined {
    return Array.from(this.scores.entries()).find(([, score]) => score >= this.targetScore)?.[0];
  }

  static computeTargetScore(gameMode: GameMode): number {
    switch (gameMode) {
      case GameMode.NORMAL:
        return 1000;
      case GameMode.DOUBLED_SPADES:
        return 1500;
    }
  }

  prettyPrintScores(): string {
    return Array.from(this.scores).map(([team, score]) => `${team.name}: ${score}`).join(", ");
  }
}

