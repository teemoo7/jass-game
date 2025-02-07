import { Team } from "../player/team.ts";
import { Player } from "../player/player.ts";
import { Trick } from "./trick.ts";
import { Suit, SuitHelper } from "../card/suit.ts";
import { Card, CardHelper } from "../card/card.ts";
import { Rank, RankHelper } from "../card/rank.ts";
import Utils from "../../utils/utils.ts";
import { GameMode } from "./gamemode.ts";
import { Meld } from "./meld.ts";
import { drawTrumpDecisionDiv } from "../../ui/board.ts";

export class Round {
  readonly number: number;
  readonly teams: Team[];
  readonly gameMode: GameMode;
  readonly scores: Map<Team, number>;
  currentTrick: Trick;
  playedTricks: Trick[];
  trumpSuit: Suit;
  readonly trumpDecider: Player;
  trumpDecisionPassed: boolean;
  readonly playerHands: Map<Player, Card[]>;
  provisionalMelds: Map<Player, Meld>;
  definitiveMelds: Map<Player, Meld>;

  constructor(number: number, teams: Team[], gameMode: GameMode, trumpDecider?: Player) {
    this.number = number;
    this.teams = teams;
    this.gameMode = gameMode;
    this.scores = this.resetScores();
    this.playerHands = this.dealCardsToPlayers();
    this.sortHumanPlayerHand();
    this.trumpDecisionPassed = false;
    if (trumpDecider) {
      this.trumpDecider = trumpDecider;
    } else {
      this.trumpDecider = this.computeStartingPlayer();
    }
    this.provisionalMelds = new Map();
    this.definitiveMelds = new Map();
    this.playedTricks = [];
  }

  resetScores(): Map<Team, number> {
    const scores = new Map();
    for (const team of this.teams) {
      scores.set(team, 0);
    }
    return scores;
  }

  dealCardsToPlayers(): Map<Player, Card[]> {
    const deck = this.shuffleDeck(this.generateDeck());
    const playerHands: Map<Player, Card[]> = new Map();
    let startingIndex = 0;
    const cardsPerPlayer = 9;
    for (const team of this.teams) {
      for (const player of team.getPlayers()) {
        playerHands.set(player, deck.slice(startingIndex, startingIndex + cardsPerPlayer));
        startingIndex += cardsPerPlayer;
      }
    }
    return playerHands;
  }

  sortHumanPlayerHand(): void {
    // first group by suit, then sort by rank
    for (const [player, hand] of this.playerHands) {
      if (player.isHuman) {
        let sortedHand: Card[] = [];
        for (const suit of SuitHelper.getSuits()) {
          console.log(`Current suit to be sorted: ${suit}`);
          const cardsOfSuit = hand.filter((card) => card.suit === suit);
          cardsOfSuit.sort((a, b) => CardHelper.computeCardPower(a, false) - CardHelper.computeCardPower(b, false));
          sortedHand.push(...cardsOfSuit);
        }
        this.playerHands.set(player, sortedHand);
      }
    }
  }

  generateDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SuitHelper.getSuits()) {
      for (const rank of RankHelper.getRanks()) {
        deck.push(new Card(suit, rank));
      }
    }
    return deck;
  }

  shuffleDeck(deck: Card[]): Card[] {
    return Utils.shuffleArray(deck);
  }

  computeStartingPlayer(): Player {
    let cardToFind;
    switch (this.gameMode) {
      case GameMode.NORMAL:
        cardToFind = new Card(Suit.DIAMONDS, Rank.SEVEN);
        break;
      case GameMode.DOUBLED_SPADES:
        cardToFind = new Card(Suit.SPADES, Rank.QUEEN);
        break;
    }

    for (const [player, hand] of this.playerHands) {
      const selection = hand.filter((card) => card.suit === cardToFind.suit && card.rank === cardToFind.rank);
      if (selection.length > 0) {
        return player;
      }
    }
    throw new Error("Starting player not found");
  }

  getAllowedCards(currentPlayer: Player, currentTrick: Trick, trumpSuit: Suit): Card[] {
    const hand = this.playerHands.get(currentPlayer);
    let allowedCards = [];

    const trickFirstCard = currentTrick.playedCards[0];
    if (trickFirstCard) {
      // Must follow suit
      const suit = trickFirstCard.card.suit;
      const allowedCardsOfSuit = hand.filter((card) => card.suit === suit);
      allowedCards.push(...allowedCardsOfSuit);

      if (allowedCardsOfSuit.length === 0) {
        // Can play any non-trump card
        const nonTrumpCards = hand.filter((card) => card.suit !== trumpSuit);
        allowedCards.push(...nonTrumpCards);
      }

    }

    // Can play trump card which are higher than the highest trump card played (if any)
    const trumpCards = hand.filter((card) => card.suit === trumpSuit);
    const playedTrumpCards = currentTrick.playedCards.filter((playedCard) => playedCard.card.suit === trumpSuit);
    if (playedTrumpCards.length > 0) {
      const highestPlayedTrumpCard = playedTrumpCards.reduce((highest, playedCard) => {
        return CardHelper.computeCardPower(playedCard.card, true) > CardHelper.computeCardPower(highest.card, true)
          ? playedCard
          : highest;
      });
      const allowedTrumpCards = trumpCards.filter(
        (card) =>
          CardHelper.computeCardPower(card, true) > CardHelper.computeCardPower(highestPlayedTrumpCard.card, true)
      );
      allowedCards.push(...allowedTrumpCards);
    } else {
      if (allowedCards.length > 0) {
        allowedCards.push(...trumpCards);
      }
    }

    if (allowedCards.length === 0) {
      // Can play any card
      allowedCards = hand;
    }
    return allowedCards;
  }

  getCardToPlay(currentPlayer: Player, currentTrick: Trick, trumpSuit: Suit): Card {
    const allowedCards = this.getAllowedCards(currentPlayer, currentTrick, trumpSuit);
    const nonTrumpCards = allowedCards.filter((card) => card.suit !== trumpSuit);
    const trumpCards = allowedCards.filter((card) => card.suit === trumpSuit);

    const teamMate = this.getTeamMate(currentPlayer);
    const isLastToPlay: boolean = currentTrick.playedCards.length === 3;
    const isFirstToPlay: boolean = currentTrick.playedCards.length === 0;
    const currentTrickWinner: Player | undefined = currentTrick.computeWinningPlayedCard()?.player;
    const suitToFollow: Suit | undefined = currentTrick.playedCards[0]?.card.suit;
    const trickScore: number = currentTrick.computeTrickScore();

    if (isLastToPlay && currentTrickWinner === teamMate) {
      // If you are the last to play and your partner is winning the trick, play the card with the highest value, but preferably a ten rather than an ace
      if (nonTrumpCards.length > 0) {
        const tenCard = nonTrumpCards.find((card) => card.rank === Rank.TEN);
        if (tenCard) {
          console.log("AI: If you are the last to play and your partner is winning the trick, play a non-trump ten");
          return tenCard;
        }
      }
      if (suitToFollow === trumpSuit) {
        const tenCard = allowedCards.find((card) => card.rank === Rank.TEN);
        if (tenCard) {
          console.log("AI: If you are the last to play and your partner is winning the trick, play a trump ten");
          return tenCard;
        }
      }
    }

    if (isLastToPlay && currentTrickWinner !== teamMate) {
      // If you are the last to play and your partner is losing the trick, and you have a better card to win the trick, play it, otherwise play the card with the lowest value
      const winningCard = currentTrick.computeWinningPlayedCard()?.card;

      const betterNonTrumpCard = nonTrumpCards.find((card) => CardHelper.computeCardPower(card, card.suit === trumpSuit) > CardHelper.computeCardPower(winningCard!, winningCard!.suit === trumpSuit));
      if (betterNonTrumpCard) {
        console.log("AI: If you are the last to play and your partner is losing the trick, and you have a better non-trump card to win the trick, play it");
        return betterNonTrumpCard;
      }
      if (nonTrumpCards.length > 0) {
        console.log("AI: If you are the last to play and your partner is losing the trick, play the non-trump card with the lowest value");
        return nonTrumpCards.reduce((lowest, card) => {
          return CardHelper.computeCardValue(card, card.suit === trumpSuit) < CardHelper.computeCardValue(lowest, lowest.suit === trumpSuit) ? card : lowest;
        });
      }
    }

    if (!isFirstToPlay && currentTrickWinner !== teamMate) {
      // If there is a high value in the current trick, and you are not sure that your partner will win it, and you have a trump card, play it
      if (trickScore >= 10 && trumpCards.length > 0) {
        console.log("AI: If there is a high value in the current trick, and you are not sure that your partner will win it, and you have a trump card, play it");
        return trumpCards.reduce((lowest, card) => {
          return CardHelper.computeCardValue(card, card.suit === trumpSuit) < CardHelper.computeCardValue(lowest, lowest.suit === trumpSuit) ? card : lowest;
        });
      }
    }

    if (isFirstToPlay && nonTrumpCards.length > 0) {
      // If you are the first to play, and you have a card that is winning over all remaining cards in all hands, play it, unless it's in trump suit
      SuitHelper.getSuits().filter((suit) => suit !== this.trumpSuit).forEach((suit) => {
        const suitCards = nonTrumpCards.filter((card) => card.suit === suit);
        if (suitCards.length > 0) {
          const maxPowerCardInSuit = suitCards.reduce((max, card) => {
            return CardHelper.computeCardPower(card, false) > CardHelper.computeCardPower(max, false) ? card : max;
          });
          // If the opponent team players don't have a card of the suit, play it
          if (this.getOpponents(currentPlayer).every((opponent) => !this.playerMightStillHaveSuit(opponent, suit))) {
            console.log("AI: If you are the first to play, and you have a card that is winning over all remaining cards in all hands, play it, unless it's in trump suit");
            return maxPowerCardInSuit;
          }
        }
      });
    }

    // If you are the first to play, and you have chosen the trump suit, play the most powerful card in that suit, unless you know that the other team has no more trump cards
    if (isFirstToPlay && this.trumpDecider === currentPlayer && trumpCards.length > 0) {
      const maxPowerInTrump = trumpCards.reduce((max, card) => {
        return CardHelper.computeCardPower(card, true) > CardHelper.computeCardPower(max, true) ? card : max;
      });
      if (this.getOpponents(currentPlayer).some((opponent) => this.playerMightStillHaveSuit(opponent, trumpSuit))) {
        console.log("AI: If you are the first to play, and you have chosen the trump suit, play the most powerful card in that suit, unless you know that the other team has no more trump cards");
        return maxPowerInTrump;
      }
    }


    /* Ideas:
    - If you are the first to play, and you know that your teammate has cards with high power in a suit, play a card in that suit
     */


    // If you don't know, play a random card
    console.log("AI: Playing a random card");
    return Utils.getRandomElement(allowedCards);
  }

  playerMightStillHaveSuit(player: Player, suit: Suit): boolean {
    // Try to determine if the player has not played a card of the suit in the played tricks when they should have if they had some
    this.playedTricks.forEach((trick) => {
      const firstPlayedCard = trick.playedCards[0];
      if (firstPlayedCard!.card.suit === suit && firstPlayedCard!.player !== player) {
        if (trick.playedCards.some((playedCard) => playedCard.player === player && playedCard.card.suit !== suit && (playedCard.card.suit !== this.trumpSuit || suit === this.trumpSuit))) {
          return false;
        }
      }
    });
    return true;
  }

  addScore(team: Team, score: number): void {
    this.scores.set(team, score + this.scores.get(team));
  }

  getPlayedTrumpCards(): Card[] {
    return this.playedTricks
      .flatMap((trick) => trick.playedCards)
      .filter((playedCard) => playedCard.card.suit === this.trumpSuit)
      .map((playedCard) => playedCard.card);
  }

  async decideTrumpSuit(player: Player, canPass: boolean): Promise<Suit> {
    let trumpSuit: Suit;

    const hand: Card[] = this.playerHands.get(player);
    console.log(`${player.name} is deciding trump suit with hand: ${hand.map((card) => `${card.rank} of ${card.suit}`).join(", ")}`);

    const recommendedTrumpSuit = this.computeBestTrumpSuit(hand, canPass);
    if (recommendedTrumpSuit) {
      trumpSuit = recommendedTrumpSuit;
    } else {
      this.trumpDecisionPassed = true;
      const teamMate = this.getTeamMate(player);
      console.log(`${player.name} passed to ${teamMate.name}`);
      let teamMateTrumpSuit: Suit;
      if (teamMate.isHuman) {
        trumpSuit = await drawTrumpDecisionDiv(this, teamMate, false);
      } else {
        trumpSuit = await this.decideTrumpSuit(teamMate, false);
      }
    }

    console.log(`${player.name} decided trump suit: ${trumpSuit}`);
    return new Promise<Suit>((resolve) => resolve(trumpSuit));
  }

  computeBestTrumpSuit(hand: Card[], canPass: boolean): Suit | undefined {
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
      if (canPass) {
        return undefined;
      } else {
        candidates = SuitHelper.getSuits().map((suit) => [suit, hand.filter((card) => card.suit === suit).reduce((power, card) => power + CardHelper.computeCardPower(card, true), 0)]);
      }
    }

    // take the highest power within candidates
    candidates.sort((a, b) => b[1] - a[1]);
    return candidates[0][0];
  }


  getTeamMate(player: Player): Player {
    return this.teams.find((team) => team.hasPlayer(player)).getTeamMate(player);
  }

  getOpponents(player: Player): Player[] {
    return this.teams.find((team) => !team.hasPlayer(player)).getPlayers();
  }
}
