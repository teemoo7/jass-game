import { Team } from "../player/team.ts";
import { Player } from "../player/player.ts";
import { Trick } from "./trick.ts";
import { Suit, SuitHelper } from "../card/suit.ts";
import { Card, CardHelper } from "../card/card.ts";
import { Rank, RankHelper } from "../card/rank.ts";
import Utils from "../../utils/utils.ts";
import { GameMode } from "./gamemode.ts";
import { Meld } from "./meld.ts";

export class Round {
  readonly number: number;
  readonly teams: Team[];
  readonly gameMode: GameMode;
  readonly scores: Map<Team, number>;
  currentTrick: Trick;
  trumpSuit: Suit;
  readonly trumpDecider: Player;
  readonly playerHands: Map<Player, Card[]>;
  provisionalMelds: Map<Player, Meld>;

  constructor(number: number, teams: Team[], gameMode: GameMode, trumpDecider?: Player) {
    this.number = number;
    this.teams = teams;
    this.gameMode = gameMode;
    this.scores = this.resetScores();
    this.playerHands = this.dealCardsToPlayers();
    this.sortHumanPlayerHand();
    if (trumpDecider) {
      this.trumpDecider = trumpDecider;
    } else {
      this.trumpDecider = this.computeStartingPlayer();
    }
    this.provisionalMelds = new Map();
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

    /* Ideas:
    - If you are the last to play and your partner is winning the meld, play the card with the highest value, but preferably a ten rather than an ace
    - If you are the last to play and your partner is losing the meld, play the card with the lowest value, and the lowest rank
    - If you are the last to play and you have a better card than the one that is winning, play it
    - If you are the first to play and you have a card that is winning over all remaining cards in all hands, play it, unless it's in trump suit
    - If you are the first to play and you have chosen the trump suit, play the most powerful card in that suit, unless you know that the other team has no more trump cards
    - If you are the first to play and you know that your teammate has cards with high power in a suit, play a card in that suit
    - If there is a high value in the current meld, and you are not sure that your partner will win it, and you have a trump card, play it
    - If you don't know, play a random card
     */


    // select a random card for now
    return Utils.getRandomElement(allowedCards);
  }

  addScore(team: Team, score: number): void {
    this.scores.set(team, score + this.scores.get(team));
  }

}
