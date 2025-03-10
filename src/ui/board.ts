import { Game } from "../models/game/game.ts";
import { Card } from "../models/card/card.ts";
import { Suit, SuitHelper } from "../models/card/suit.ts";
import { Rank, RankHelper } from "../models/card/rank.ts";
import { Player } from "../models/player/player.ts";
import { Round } from "../models/game/round.ts";
import { Trick } from "../models/game/trick.ts";
import { Meld } from "../models/game/meld.ts";
import { Position, PositionHelper } from "./position.ts";
import { GameMode } from "../models/game/gamemode.ts";
import { Team } from "../models/player/team.ts";
import { Human } from "../models/player/human.ts";
import { Bot } from "../models/player/bot.ts";
import {
  ButtonBuilder,
  DivBuilder,
  ImgBuilder,
  InputBuilder,
  LabelBuilder,
  OptionBuilder,
  SelectBuilder,
  SpanBuilder
} from "./builders.ts";

export function waitForHumanPlayer(hand: Card[]): Promise<Card> {
  return new Promise(resolve => {
    const cardDivs = document.querySelectorAll(".card-allowed");
    cardDivs.forEach(cardDiv => {
      cardDiv.classList.add("card-playable");
      cardDiv.addEventListener("click", function onClick() {
        const cardString = cardDiv.getAttribute("data-card");
        cardDiv.removeEventListener("click", onClick);
        const suit = SuitHelper.getSuitFromAbbreviation(cardString!.charAt(0));
        const rank = RankHelper.getRankFromAbbreviation(cardString!.slice(1));
        const card = hand.find(c => c.suit === suit && c.rank === rank);
        resolve(card!);
      });
    });
  });
}

export function botPlayCard(player: Player, round: Round): Promise<Card> {
  return new Promise(resolve => {
    setTimeout(() => {
      const card = round.getCardToPlay(player, round.currentTrick!, round.trumpSuit!);
      resolve(card);
    }, 1000);
  });
}

export function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function drawNewGameSettings(): Promise<Game> {
  return new Promise(resolve => {

    const app = document.getElementById("app")!;

    const modal = new DivBuilder().withId("modal").build();
    app.appendChild(modal);

    const dialog = new DivBuilder().withId("dialog").build();
    app.appendChild(dialog);

    const newGameSettingsDiv = new DivBuilder().withId("newGameSettings").build();
    dialog.appendChild(newGameSettingsDiv);

    newGameSettingsDiv.appendChild(new DivBuilder().withClassList(["title"]).withTextContent("New Game").build());

    const gameModeDiv = new DivBuilder().build();
    newGameSettingsDiv.appendChild(gameModeDiv);
    gameModeDiv.appendChild(new LabelBuilder().withTextContent("Game mode").build());
    const gameModeSelect = new SelectBuilder().withId("gameModeSelect").build();
    gameModeDiv.appendChild(gameModeSelect);
    gameModeSelect.appendChild(new OptionBuilder().withValue(GameMode.NORMAL).withId("gameModeOptionNormal").withTextContent("Normal (1000 pts)").build());
    gameModeSelect.appendChild(new OptionBuilder().withValue(GameMode.DOUBLED_SPADES).withId("gameModeOptionDoubleSpades").withTextContent("Doubled spades (1500 pts)").build());

    const playerNameDiv = new DivBuilder().build();
    newGameSettingsDiv.appendChild(playerNameDiv);
    playerNameDiv.appendChild(new LabelBuilder().withTextContent("Player name").build());
    playerNameDiv.appendChild(new InputBuilder().withType("text").withId("playerNameInput").withValue("Me").build());

    const teamNameDiv = new DivBuilder().withId("teamName").build();
    newGameSettingsDiv.appendChild(teamNameDiv);
    teamNameDiv.appendChild(new LabelBuilder().withTextContent("Team name").build());
    teamNameDiv.appendChild(new InputBuilder().withType("text").withId("teamNameInput").withValue("The best team").build());

    const botsLevelDiv = new DivBuilder().build();
    newGameSettingsDiv.appendChild(botsLevelDiv);
    botsLevelDiv.appendChild(new LabelBuilder().withTextContent("Bots level").build());
    const botsLevelSelect = new SelectBuilder().withId("botsLevelSelect").build();
    botsLevelDiv.appendChild(botsLevelSelect);
    botsLevelSelect.appendChild(new OptionBuilder().withValue(Bot.LEVEL_STUPID.toString()).withId("botsLevelOptionStupid").withTextContent("Stupid").build());
    botsLevelSelect.appendChild(new OptionBuilder().withValue(Bot.LEVEL_EASY.toString()).withId("botsLevelOptionEasy").withTextContent("Easy").build());
    botsLevelSelect.appendChild(new OptionBuilder().withValue(Bot.LEVEL_MEDIUM.toString()).withId("botsLevelOptionMedium").withTextContent("Medium").build());
    botsLevelSelect.appendChild(new OptionBuilder().withValue(Bot.LEVEL_HARD.toString()).withId("botsLevelOptionHard").withTextContent("Hard").withSelected(true).build());

    const startButtonDiv = new DivBuilder().build();
    newGameSettingsDiv.appendChild(startButtonDiv);

    const startButton = new ButtonBuilder().withTextContent("Start game").withId("startGameButton").build();
    startButtonDiv.appendChild(startButton);

    startButton.addEventListener("click", () => {
      const gameMode = (document.getElementById("gameModeSelect") as HTMLSelectElement).value as GameMode;
      const playerName = (document.getElementById("playerNameInput") as HTMLInputElement).value;
      const playerHuman: Player = new Human(playerName);
      const botsLevel = parseInt((document.getElementById("botsLevelSelect") as HTMLSelectElement).value);
      const playerBot1: Player = new Bot("Bot top", botsLevel);
      const playerBot2: Player = new Bot("Bot right", botsLevel);
      const playerBot3: Player = new Bot("Bot left", botsLevel);
      const teamName = (document.getElementById("teamNameInput") as HTMLInputElement).value;
      const team1: Team = new Team(playerHuman, playerBot1, teamName);
      const team2: Team = new Team(playerBot2, playerBot3, "Bots invaders");
      const game = new Game([team1, team2], gameMode);
      newGameSettingsDiv.remove();
      modal.remove();
      dialog.remove();
      resolve(game);
    });

  });
}

export function drawTrumpDecisionDiv(round: Round, player: Player, canPass: boolean): Promise<Suit> {
  return new Promise(resolve => {
    const hand: Card[] = round.playerHands.get(player)!;

    const modal = new DivBuilder().withId("modal").build();
    const app = document.getElementById("app")!;
    app.appendChild(modal);

    const dialog = new DivBuilder().withId("dialog").build();
    app.appendChild(dialog);

    const trumpDecisionDiv = new DivBuilder().withId("trumpDecision").build();
    dialog.appendChild(trumpDecisionDiv);

    trumpDecisionDiv.appendChild(new DivBuilder().withClassList(["title"]).withTextContent("Select trump suit").build());

    trumpDecisionDiv.appendChild(new DivBuilder().withClassList(["lead", "trump-decision-info"]).withTextContent("Click on a suit below:").build());

    const trumpSuitRecommendation = round.computeBestTrumpSuit(hand, canPass);

    const trumpDecisionSuits = new DivBuilder().withClassList(["trump-decision-suits"]).build();
    trumpDecisionDiv.appendChild(trumpDecisionSuits);
    SuitHelper.getSuits().forEach(suit => {
      let classes = ["trump-decision-suit"];
      if (trumpSuitRecommendation && trumpSuitRecommendation === suit) {
        classes.push("trump-decision-suit-recommended");
      }
      const suitDiv = new DivBuilder().withId("suit" + suit).withClassList(classes).build();
      suitDiv.appendChild(makeCardImage(new Card(suit, Rank.ACE), true, false, true));
      trumpDecisionSuits.appendChild(suitDiv);
      suitDiv.addEventListener("click", () => {
        trumpDecisionDiv.remove();
        modal.remove();
        dialog.remove();
        resolve(suit);
      });
    });

    if (canPass) {
      const passActionDiv = new DivBuilder().withClassList(["trump-decision-pass"]).build();
      trumpDecisionDiv.appendChild(passActionDiv);

      let classes = ["pass-button"];
      if (trumpSuitRecommendation === undefined) {
        classes.push("pass-button-recommended");
      }
      const passButton = new DivBuilder().withId("passButton").withClassList(classes).withTextContent("Pass to team mate").build();
      passActionDiv.appendChild(passButton);
      passButton.addEventListener("click", () => {
        trumpDecisionDiv.remove();
        modal.remove();
        dialog.remove();
        console.log(`${player.name} passed the trump decision to ${round.getTeamMate(player).name}`);
        resolve(round.decideTrumpSuit(round.getTeamMate(player), false));
      });
    }

    trumpDecisionDiv.appendChild(new DivBuilder().withClassList(["lead", "trump-decision-info"]).withTextContent("Your hand:").build());

    const trumpDecisionHand = new DivBuilder().withClassList(["trump-decision-hand"]).build();
    trumpDecisionDiv.appendChild(trumpDecisionHand);
    for (const card of hand) {
      trumpDecisionHand.appendChild(makeCardImage(card, true, false, true));
    }
  });
}

export function drawGameOverDialog(game: Game) {
  const modal = new DivBuilder().withId("modal").build();
  const app = document.getElementById("app")!;
  app.appendChild(modal);

  const dialog = new DivBuilder().withId("dialog").build();
  app.appendChild(dialog);

  const gameOverDiv = new DivBuilder().withId("gameOver").build();
  dialog.appendChild(gameOverDiv);

  gameOverDiv.appendChild(new DivBuilder().withClassList(["title"]).withTextContent("Game over").build());

  const winningTeam = game.getWinner();
  gameOverDiv.appendChild(new DivBuilder().withTextContent(`Winning team: ${winningTeam?.name}`).build());

  const scoresDiv = new DivBuilder().withId("scores").build();
  gameOverDiv.appendChild(scoresDiv);

  for (const team of game.teams) {
    const teamDiv = new DivBuilder().withClassList(["team"]).build();
    scoresDiv.appendChild(teamDiv);

    teamDiv.appendChild(new DivBuilder().withClassList(["team-name"]).withTextContent(team.name).build());

    teamDiv.appendChild(new DivBuilder().withClassList(["team-points"]).withTextContent(game.scores.get(team)!.toString()).build());
  }

  const newGameButton = new ButtonBuilder().withTextContent("New game").withId("newGameButton").build();
  gameOverDiv.appendChild(newGameButton);

  newGameButton.addEventListener("click", () => {
    dialog.remove();
    modal.remove();
    drawNewGameSettings().then(newGame => newGame.start());
  });
}

export function drawBoard(game: Game) {
  const app = document.getElementById("app")!;

  if (app.firstChild) {
    app.removeChild(app.firstChild);
  }

  const round: Round | undefined = game.rounds[game.rounds.length - 1];
  const trick: Trick | undefined = round ? round.currentTrick : undefined;

  const players: Map<Position, Player> = new Map([
    [Position.BOTTOM, game.teams[0].player1],
    [Position.RIGHT, game.teams[1].player1],
    [Position.TOP, game.teams[0].player2],
    [Position.LEFT, game.teams[1].player2]
  ]);

  const container = new DivBuilder().withId("container").build();
  app.appendChild(container);

  const baize = new DivBuilder().withId("baize").build();
  container.appendChild(baize);

  /* Players areas */
  const playerAreas: Map<Position, HTMLDivElement> = new Map();
  PositionHelper.getPositions().forEach(position => {
    const playerArea = new DivBuilder().withClassList(["area", position + "-area"]).build();
    baize.appendChild(playerArea);
    playerAreas.set(position, playerArea);
  });

  /* Players names */
  PositionHelper.getPositions().forEach(position => {
    baize.appendChild(new DivBuilder().withClassList(["player-name", position + "-player-name"]).withTextContent(players.get(position)!.name).build());
  });

  /* Trick cards */
  const trickCardDivs: Map<Position, HTMLDivElement> = new Map();
  PositionHelper.getPositions().forEach(position => {
    const trickCard = new DivBuilder().withClassList(["trick-card", position + "-trick-card"]).build();
    baize.appendChild(trickCard);
    trickCardDivs.set(position, trickCard);
  });

  /* Scoreboard */

  const scoreboardDiv = makeScoreboard(game);
  container.appendChild(scoreboardDiv);

  if (round) {

    /* Round scoreboard */

    const roundDiv = new DivBuilder().withId("round").build();
    scoreboardDiv.appendChild(roundDiv);

    roundDiv.appendChild(new DivBuilder().withClassList(["title"]).withTextContent(`Round ${round.number}`).build());

    const trumpDiv = new DivBuilder().withId("trump").build();
    roundDiv.appendChild(trumpDiv);

    if (round.trumpSuit) {
      trumpDiv.appendChild(new ImgBuilder().withSrc(`${import.meta.env.BASE_URL}images/${RankHelper.getRankFromAbbreviation(Rank.ACE)}${SuitHelper.getSuitAbbreviation(round.trumpSuit!)}.png`).withClassList(["trump-suit-image"]).build());

      const trumpDetailsDiv = new DivBuilder().withId("trumpDetails").build();
      trumpDiv.appendChild(trumpDetailsDiv);

      trumpDetailsDiv.appendChild(new DivBuilder().withClassList(["subtitle"]).withTextContent("Trump").build());

      trumpDetailsDiv.appendChild(new DivBuilder().withClassList(["trump-suit-value"]).withTextContent(round.trumpSuit).build());

      const trumpDeciderDiv = new DivBuilder().withClassList(["trump-decider"]).withTextContent("Decided by ").build();
      trumpDetailsDiv.appendChild(trumpDeciderDiv);

      trumpDeciderDiv.appendChild(new SpanBuilder().withClassList(["trump-decider-player"]).withTextContent(round.trumpDecider.name).build());
    }

    /* Melds */
    const meldsDiv = new DivBuilder().withId("melds").build();
    roundDiv.appendChild(meldsDiv);

    const meldsTitle = new DivBuilder().withClassList(["subtitle"]).withTextContent("Melds").build();
    meldsDiv.appendChild(meldsTitle);

    const meldsContentDiv = new DivBuilder().withId("meldsContent").build();
    meldsDiv.appendChild(meldsContentDiv);

    if (round.provisionalMelds.size > 0) {
      meldsTitle.textContent += " (prov.)";
      for (const [player, meld] of round.provisionalMelds) {
        meldsContentDiv.appendChild(makeMeldDiv(player, meld, false));
      }
    }

    if (round.definitiveMelds.size > 0) {
      meldsTitle.textContent += " (final)";
      for (const [player, meld] of round.definitiveMelds) {
        meldsContentDiv.appendChild(makeMeldDiv(player, meld, true));
      }
    }

    const playedTrumpCards: Card[] = round.getPlayedTrumpCards();
    if (playedTrumpCards.length > 0) {
      roundDiv.appendChild(new DivBuilder().withClassList(["subtitle"]).withTextContent("Played trump cards (" + playedTrumpCards.length + ")").build());

      const playedTrumpCardsDiv = new DivBuilder().withId("playedTrumpCards").build();
      roundDiv.appendChild(playedTrumpCardsDiv);

      for (const card of playedTrumpCards) {
        playedTrumpCardsDiv.appendChild(makeIllustrationCardImage(card));
      }
    }

    /* Hands */
    drawPlayerHandsDiv(round, playerAreas, players);

    /* Trick */
    if (trick) {
      baize.appendChild(new SpanBuilder().withId("trickPointsValue").withTextContent(trick.computeTrickScore().toString()).build());
      drawPlayedTrickDiv(trick, players, trickCardDivs);
    }
  }

}

function makeScoreboard(game: Game): HTMLDivElement {
  const scoreboardDiv = new DivBuilder().withId("scoreboard").build();
  scoreboardDiv.appendChild(new DivBuilder().withClassList(["title"]).withTextContent("Scoreboard").build());

  const teamsDiv = new DivBuilder().withId("teams").build();
  scoreboardDiv.appendChild(teamsDiv);

  for (const team of game.teams) {
    const teamScoreDiv = new DivBuilder().withClassList(["team-score"]).build();
    teamsDiv.appendChild(teamScoreDiv);

    teamScoreDiv.appendChild(new DivBuilder().withClassList(["team-points"]).withTextContent(game.scores.get(team)!.toString()).build());

    const teamDetailsDiv = new DivBuilder().withClassList(["team-details"]).build();
    teamScoreDiv.appendChild(teamDetailsDiv);

    teamDetailsDiv.appendChild(new DivBuilder().withClassList(["team"]).withTextContent(team.name).build());

    for (const player of team.getPlayers()) {
      let classes = ["player"];
      if (player.isHuman()) {
        classes.push("human");
      }
      teamDetailsDiv.appendChild(new DivBuilder().withClassList(classes).withTextContent(player.name).build());
    }
  }
  return scoreboardDiv;
}

function drawPlayedTrickDiv(trick: Trick, players: Map<Position, Player>, trickCardDivs: Map<Position, HTMLDivElement>) {
  const winningPlayedCard = trick.computeWinningPlayedCard();
  PositionHelper.getPositions().forEach(position => {
    const player = players.get(position)!;
    const playedCard = trick.getPlayedCardByPlayer(player);
    const trickCardDiv = trickCardDivs.get(position)!;
    if (playedCard) {
      trickCardDiv.appendChild(makePlayedCardImage(playedCard.card, playedCard === winningPlayedCard));
    }
  });
}

function drawPlayerHandsDiv(round: Round, playerAreas: Map<Position, HTMLDivElement>, players: Map<Position, Player>) {
  PositionHelper.getPositions().forEach(position => {
    const playerArea = playerAreas.get(position)!;
    const player = players.get(position)!;

    const playerHand = new DivBuilder().withClassList(["player-hand"]).build();
    playerArea.appendChild(playerHand);
    const playerCards: Card[] = round.playerHands.get(player)!;
    const rotated: boolean = position === Position.RIGHT || position === Position.LEFT;
    if (position === Position.BOTTOM) {
      let allowedCards: Card[] = [];
      if (round.currentTrick) {
        allowedCards = round.getAllowedCards(player, round.currentTrick!, round.trumpSuit!);
      }
      for (const card of playerCards!) {
        playerHand.appendChild(makeCardImage(card, player.isHuman(), rotated, allowedCards.includes(card)));
      }
    } else {
      for (const card of playerCards!) {
        playerHand.appendChild(makeCardImage(card, player.isHuman(), rotated, player.isHuman()));
      }
    }
  });

}

function makeMeldDiv(player: Player, meld: Meld, definitive: boolean): HTMLDivElement {
  const meldDiv = new DivBuilder().withClassList(["meld"]).build();

  meldDiv.appendChild(new DivBuilder().withClassList(["meld-player"]).withTextContent(player.name).build());

  meldDiv.appendChild(new DivBuilder().withClassList(["meld-type"]).withTextContent(Meld.getMeldTypeString(meld.type)).build());

  meldDiv.appendChild(new DivBuilder().withClassList(["meld-points"]).withTextContent(`(${meld.points})`).build());

  if (definitive && meld.highestRank && meld.suit) {
    const meldHighestCardDiv = new DivBuilder().withClassList(["meld-highest-card"]).build();
    meldHighestCardDiv.appendChild(makeIllustrationCardImage(new Card(meld.suit, meld.highestRank)));
    meldDiv.appendChild(meldHighestCardDiv);
  }

  return meldDiv;
}

function makeCardImage(card: Card, visible: boolean, rotated: boolean, allowed: boolean): HTMLDivElement {
  const cardDiv = new DivBuilder().withClassList(["card"]).build();
  const cardImage = new ImgBuilder().build();
  if (rotated) {
    cardDiv.classList.add("card-rotated");
  } else {
    cardDiv.classList.add("card-normal");
  }
  if (visible) {
    cardDiv.setAttribute("data-card", `${SuitHelper.getSuitAbbreviation(card.suit)}${card.rank}`);
    cardDiv.setAttribute("alt", `${card.rank} of ${card.suit}`);
    cardImage.classList.add("card-image");
    cardImage.src = `${import.meta.env.BASE_URL}images/${card.rank}${SuitHelper.getSuitAbbreviation(card.suit)}.png`;
    if (allowed) {
      cardDiv.classList.add("card-allowed");
    }
  } else {
    cardDiv.classList.add("card-back");
    if (rotated) {
      cardImage.classList.add("card-image-rotated");
      cardImage.src = `${import.meta.env.BASE_URL}images/gray_back_rotated.png`;
    } else {
      cardImage.classList.add("card-image");
      cardImage.src = `${import.meta.env.BASE_URL}images/gray_back.png`;
    }
  }
  cardDiv.appendChild(cardImage);
  if (!allowed && visible) {
    const cardCover = document.createElement("div");
    cardCover.classList.add("card-cover");
    cardDiv.appendChild(cardCover);
  }
  return cardDiv;
}

function makeIllustrationCardImage(card: Card): HTMLDivElement {
  const cardDiv = new DivBuilder().withClassList(["card", "card-small"]).build();
  cardDiv.setAttribute("alt", `${card.rank} of ${card.suit}`);
  cardDiv.appendChild(new ImgBuilder().withSrc(`${import.meta.env.BASE_URL}images/${card.rank}${SuitHelper.getSuitAbbreviation(card.suit)}.png`).withClassList(["card-image-small"]).build());
  return cardDiv;
}

function makePlayedCardImage(card: Card, isWinning: boolean): HTMLDivElement {
  let classes = ["card", "card-normal"];
  if (isWinning) {
    classes.push("card-winning");
  }
  const cardDiv = new DivBuilder().withClassList(classes).build();
  cardDiv.setAttribute("alt", `${card.rank} of ${card.suit}`);

  cardDiv.appendChild(new ImgBuilder().withSrc(`${import.meta.env.BASE_URL}images/${card.rank}${SuitHelper.getSuitAbbreviation(card.suit)}.png`).withClassList(["card-image"]).build());

  return cardDiv;
}
