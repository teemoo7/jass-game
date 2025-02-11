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

export function delay() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

export function drawNewGameSettings(): Promise<Game> {
  return new Promise(resolve => {
    const newGameSettingsDiv = document.createElement("div");
    newGameSettingsDiv.id = "newGameSettings";

    const modal = document.createElement("div");
    modal.id = "modal";
    const app = document.getElementById("app")!;
    app.appendChild(modal);

    const dialog = document.createElement("div");
    dialog.id = "dialog";
    app.appendChild(dialog);

    dialog.appendChild(newGameSettingsDiv);

    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = "New Game";
    newGameSettingsDiv.appendChild(title);

    const gameModeDiv = document.createElement("div");
    gameModeDiv.id = "gameMode";
    newGameSettingsDiv.appendChild(gameModeDiv);

    const gameModeTitle = document.createElement("div");
    gameModeTitle.classList.add("subtitle");
    gameModeTitle.textContent = "Game mode";
    gameModeDiv.appendChild(gameModeTitle);

    const gameModeOptions = document.createElement("div");
    gameModeOptions.classList.add("game-mode-options");
    gameModeDiv.appendChild(gameModeOptions);

    const gameModeNormalInput = document.createElement("input");
    gameModeNormalInput.type = "radio";
    gameModeNormalInput.name = "gameMode";
    gameModeNormalInput.value = GameMode.NORMAL;
    gameModeNormalInput.classList.add("game-mode-option");
    gameModeNormalInput.checked = true;
    gameModeOptions.appendChild(gameModeNormalInput);

    const gameModeNormalLabel = document.createElement("label");
    gameModeNormalLabel.textContent = "Normal (1000 pts)";
    gameModeOptions.appendChild(gameModeNormalLabel);

    const gameModeDoubledSpadesInput = document.createElement("input");
    gameModeDoubledSpadesInput.type = "radio";
    gameModeDoubledSpadesInput.name = "gameMode";
    gameModeDoubledSpadesInput.value = GameMode.DOUBLED_SPADES;
    gameModeDoubledSpadesInput.classList.add("game-mode-option");
    gameModeOptions.appendChild(gameModeDoubledSpadesInput);

    const gameModeDoubledSpadesLabel = document.createElement("label");
    gameModeDoubledSpadesLabel.textContent = "Doubled spades (1500 pts)";
    gameModeOptions.appendChild(gameModeDoubledSpadesLabel);

    const playerNameDiv = document.createElement("div");
    playerNameDiv.id = "playerName";
    newGameSettingsDiv.appendChild(playerNameDiv);

    const playerNameTitle = document.createElement("div");
    playerNameTitle.classList.add("subtitle");
    playerNameTitle.textContent = "Player name";
    playerNameDiv.appendChild(playerNameTitle);

    const playerNameInput = document.createElement("input");
    playerNameInput.type = "text";
    playerNameInput.id = "playerNameInput";
    playerNameInput.value = "Me";
    playerNameDiv.appendChild(playerNameInput);

    const teamNameDiv = document.createElement("div");
    teamNameDiv.id = "teamName";
    newGameSettingsDiv.appendChild(teamNameDiv);

    const teamNameTitle = document.createElement("div");
    teamNameTitle.classList.add("subtitle");
    teamNameTitle.textContent = "Team name";
    teamNameDiv.appendChild(teamNameTitle);

    const teamNameInput = document.createElement("input");
    teamNameInput.type = "text";
    teamNameInput.id = "teamNameInput";
    teamNameInput.value = "The best team";
    teamNameDiv.appendChild(teamNameInput);

    const botsLevelDiv = document.createElement("div");
    botsLevelDiv.id = "botsLevel";
    newGameSettingsDiv.appendChild(botsLevelDiv);

    const botsLevelTitle = document.createElement("div");
    botsLevelTitle.classList.add("subtitle");
    botsLevelTitle.textContent = "Bots level";
    botsLevelDiv.appendChild(botsLevelTitle);

    const botsLevelSelect = document.createElement("select");
    botsLevelSelect.id = "botsLevelSelect";
    botsLevelDiv.appendChild(botsLevelSelect);

    const botsLevelStupidOption = document.createElement("option");
    botsLevelStupidOption.value = "0";
    botsLevelStupidOption.textContent = "Stupid";
    botsLevelSelect.appendChild(botsLevelStupidOption);

    const botsLevelEasyOption = document.createElement("option");
    botsLevelEasyOption.value = "1";
    botsLevelEasyOption.textContent = "Easy";
    botsLevelSelect.appendChild(botsLevelEasyOption);

    const botsLevelMediumOption = document.createElement("option");
    botsLevelMediumOption.value = "2";
    botsLevelMediumOption.textContent = "Medium";
    botsLevelSelect.appendChild(botsLevelMediumOption);

    const botsLevelHardOption = document.createElement("option");
    botsLevelHardOption.value = "3";
    botsLevelHardOption.textContent = "Hard";
    botsLevelHardOption.selected = true;
    botsLevelSelect.appendChild(botsLevelHardOption);

    const startButton = document.createElement("button");
    startButton.textContent = "Start game";
    newGameSettingsDiv.appendChild(startButton);
    startButton.addEventListener("click", () => {
      const gameMode = (document.querySelector('input[name="gameMode"]:checked') as HTMLInputElement)!.value as GameMode;
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

    const trumpDecisionDiv = document.createElement("div");
    trumpDecisionDiv.id = "trumpDecision";

    const modal = document.createElement("div");
    modal.id = "modal";
    const app = document.getElementById("app")!;
    app.appendChild(modal);

    const dialog = document.createElement("div");
    dialog.id = "dialog";
    app.appendChild(dialog);

    dialog.appendChild(trumpDecisionDiv);

    const trumpDecisionTitle = document.createElement("div");
    trumpDecisionTitle.classList.add("title");
    trumpDecisionTitle.textContent = "Select trump suit";
    trumpDecisionDiv.appendChild(trumpDecisionTitle);

    const trumpDecisionInfo = document.createElement("div");
    trumpDecisionInfo.classList.add("lead", "trump-decision-info");
    trumpDecisionInfo.textContent = "Click on a suit below:";
    trumpDecisionDiv.appendChild(trumpDecisionInfo);

    const trumpSuitRecommendation = round.computeBestTrumpSuit(hand, canPass);

    const trumpDecisionSuits = document.createElement("div");
    trumpDecisionSuits.classList.add("trump-decision-suits");
    trumpDecisionDiv.appendChild(trumpDecisionSuits);
    SuitHelper.getSuits().forEach(suit => {
      const suitDiv = document.createElement("div");
      suitDiv.classList.add("trump-decision-suit");
      if (trumpSuitRecommendation && trumpSuitRecommendation === suit) {
        suitDiv.classList.add("trump-decision-suit-recommended");
      }
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
      const passActionDiv = document.createElement("div");
      passActionDiv.classList.add("trump-decision-pass");
      trumpDecisionDiv.appendChild(passActionDiv);

      const passButton = document.createElement("div");
      passButton.classList.add("pass-button");
      if (trumpSuitRecommendation === undefined) {
        passButton.classList.add("pass-button-recommended");
      }
      passButton.textContent = "Pass to team mate";
      passActionDiv.appendChild(passButton);
      passButton.addEventListener("click", () => {
        trumpDecisionDiv.remove();
        modal.remove();
        dialog.remove();
        console.log(`${player.name} passed the trump decision to ${round.getTeamMate(player).name}`);
        resolve(round.decideTrumpSuit(round.getTeamMate(player), false));
      });
    }

    const trumpDecisionHandTitle = document.createElement("div");
    trumpDecisionHandTitle.classList.add("lead", "trump-decision-info");
    trumpDecisionHandTitle.textContent = "Your hand:";
    trumpDecisionDiv.appendChild(trumpDecisionHandTitle);

    const trumpDecisionHand = document.createElement("div");
    trumpDecisionHand.classList.add("trump-decision-hand");
    trumpDecisionDiv.appendChild(trumpDecisionHand);

    for (const card of hand) {
      trumpDecisionHand.appendChild(makeCardImage(card, true, false, true));
    }

  });
}


export function drawBoard(game: Game) {
  const app = document.getElementById("app")!;

  if (app.firstChild) {
    app.removeChild(app.firstChild);
  }

  const round: Round | undefined = game.rounds[game.rounds.length - 1];
  const trick : Trick | undefined = round ? round.currentTrick : undefined;

  const players: Map<Position, Player> = new Map([
    [Position.BOTTOM,  game.teams[0].player1],
    [Position.RIGHT, game.teams[1].player1],
    [Position.TOP, game.teams[0].player2],
    [Position.LEFT, game.teams[1].player2]
  ]);

  const container = document.createElement("div");
  container.id = "container";
  app.appendChild(container);

  const baize = document.createElement("div");
  baize.id = "baize";
  container.appendChild(baize);

  /* Players areas */
  const playerAreas: Map<Position, HTMLDivElement> = new Map();
  PositionHelper.getPositions().forEach(position => {
    const playerArea = document.createElement("div");
    playerArea.classList.add("area", position + "-area");
    baize.appendChild(playerArea);
    playerAreas.set(position, playerArea);
  });

  /* Players names */
  PositionHelper.getPositions().forEach(position => {
    const playerName = document.createElement("div");
    playerName.classList.add("player-name", position + "-player-name");
    playerName.textContent = players.get(position)!.name;
    baize.appendChild(playerName);
  });

  /* Trick cards */
  const trickCardDivs: Map<Position, HTMLDivElement> = new Map();
  PositionHelper.getPositions().forEach(position => {
    const trickCard = document.createElement("div");
    trickCard.classList.add("trick-card", position + "-trick-card");
    baize.appendChild(trickCard);
    trickCardDivs.set(position, trickCard);
  });

  /* Scoreboard */

  const scoreboardDiv = document.createElement("div");
  scoreboardDiv.id = "scoreboard";
  container.appendChild(scoreboardDiv);
  const scoreboardTitle = document.createElement("div");
  scoreboardTitle.classList.add("title");
  scoreboardTitle.textContent = "Scoreboard";
  scoreboardDiv.appendChild(scoreboardTitle);

  for (const team of game.teams) {
    const teamScoreDiv = document.createElement("div");
    teamScoreDiv.classList.add("team-score");
    scoreboardDiv.appendChild(teamScoreDiv);

    const teamPointsDiv = document.createElement("div");
    teamPointsDiv.classList.add("team-points");
    teamPointsDiv.textContent = game.scores.get(team)!.toString();
    teamScoreDiv.appendChild(teamPointsDiv);

    const teamDetailsDiv = document.createElement("div");
    teamDetailsDiv.classList.add("team-details");
    teamScoreDiv.appendChild(teamDetailsDiv);

    const teamDiv = document.createElement("div");
    teamDiv.classList.add("team");
    teamDiv.textContent = team.name;
    teamDetailsDiv.appendChild(teamDiv);

    for (const player of team.getPlayers()) {
      const playerDiv = document.createElement("div");
      playerDiv.classList.add("player");
      playerDiv.textContent = player.name;
      if (player.isHuman()) {
        playerDiv.classList.add("human");
      }
      teamDetailsDiv.appendChild(playerDiv);
    }
  }

  if (round) {

    /* Round scoreboard */

    const roundDiv = document.createElement("div");
    roundDiv.id = "round";
    scoreboardDiv.appendChild(roundDiv);

    const roundTitle = document.createElement("div");
    roundTitle.classList.add("title");
    roundTitle.textContent = `Round ${round.number}`;
    roundDiv.appendChild(roundTitle);

    const trumpDiv = document.createElement("div");
    trumpDiv.id = "trump";
    roundDiv.appendChild(trumpDiv);

    const trumpSuitImage = document.createElement("img");
    trumpSuitImage.classList.add("trump-suit-image");
    trumpSuitImage.src = `${import.meta.env.BASE_URL}images/${RankHelper.getRankFromAbbreviation(Rank.ACE)}${SuitHelper.getSuitAbbreviation(round.trumpSuit!)}.png`;
    trumpDiv.appendChild(trumpSuitImage);

    const trumpDetailsDiv = document.createElement("div");
    trumpDetailsDiv.id = "trumpDetails";
    trumpDiv.appendChild(trumpDetailsDiv);

    const trumpTitle = document.createElement("div");
    trumpTitle.classList.add("subtitle");
    trumpTitle.textContent = "Trump";
    trumpDetailsDiv.appendChild(trumpTitle);

    const trumpSuit = document.createElement("div");
    trumpSuit.classList.add("trump-suit-value");
    trumpSuit.textContent = `${round.trumpSuit}`;
    trumpDetailsDiv.appendChild(trumpSuit);

    const trumpDeciderDiv = document.createElement("div");
    trumpDeciderDiv.classList.add("trump-decider");
    trumpDeciderDiv.textContent = `Decided by `;
    trumpDetailsDiv.appendChild(trumpDeciderDiv);

    const trumpDeciderPlayerSpan = document.createElement("span");
    trumpDeciderPlayerSpan.classList.add("trump-decider-player");
    trumpDeciderPlayerSpan.textContent = `${round.trumpDecider.name}`;
    trumpDeciderDiv.appendChild(trumpDeciderPlayerSpan);

    /* Melds */
    const meldsDiv = document.createElement("div");
    meldsDiv.id = "melds";
    roundDiv.appendChild(meldsDiv);

    const meldsTitle = document.createElement("div");
    meldsTitle.classList.add("subtitle");
    meldsTitle.textContent = "Melds";
    meldsDiv.appendChild(meldsTitle);

    if (round.provisionalMelds.size > 0) {
      const meldsTitle = document.createElement("div");
      meldsTitle.classList.add("lead");
      meldsTitle.textContent = "Provisional";
      meldsDiv.appendChild(meldsTitle);

      for (const [player, meld] of round.provisionalMelds) {
        meldsDiv.appendChild(makeMeldDiv(player, meld, false));
      }
    }

    if (round.definitiveMelds.size > 0) {
      const meldsTitle = document.createElement("div");
      meldsTitle.classList.add("lead");
      meldsTitle.textContent = "Definitive";
      meldsDiv.appendChild(meldsTitle);

      for (const [player, meld] of round.definitiveMelds) {
        meldsDiv.appendChild(makeMeldDiv(player, meld, true));
      }
    }

    const playedTrumpCards: Card[] = round.getPlayedTrumpCards();
    if (playedTrumpCards.length > 0) {
      const playedTrumpCardsDiv = document.createElement("div");
      playedTrumpCardsDiv.id = "playedTrumpCards";
      roundDiv.appendChild(playedTrumpCardsDiv);

      const playedTrumpCardsTitle = document.createElement("div");
      playedTrumpCardsTitle.classList.add("subtitle");
      playedTrumpCardsTitle.textContent = "Played trump cards";
      playedTrumpCardsDiv.appendChild(playedTrumpCardsTitle);

      for (const card of playedTrumpCards) {
        playedTrumpCardsDiv.appendChild(makeIllustrationCardImage(card));
      }
    }

    /* Trick scoreboard */
    const trickDiv = document.createElement("div");
    trickDiv.id = "trick";
    scoreboardDiv.appendChild(trickDiv);

    const trickTitle = document.createElement("div");
    trickTitle.classList.add("title");
    trickTitle.textContent = "Current trick";
    trickDiv.appendChild(trickTitle);

    if (trick) {
      const trickPointsDiv = document.createElement("div");
      trickDiv.appendChild(trickPointsDiv);

      const trickPointsTextSpan = document.createElement("span");
      trickPointsTextSpan.textContent = "Value: ";
      trickPointsDiv.appendChild(trickPointsTextSpan);

      const trickPointsValueSpan = document.createElement("span");
      trickPointsValueSpan.classList.add("trick-points");
      trickPointsValueSpan.textContent = `${trick.computeTrickScore()}`;
      trickPointsDiv.appendChild(trickPointsValueSpan);

      const winningPlayedCard = trick.computeWinningPlayedCard();
      if (winningPlayedCard) {
        const trickWinningPlayerDiv = document.createElement("div");
        trickWinningPlayerDiv.classList.add("trick-winning-player");
        trickDiv.appendChild(trickWinningPlayerDiv);
        trickWinningPlayerDiv.textContent = `Winning: `;

        const trickWinningPlayerNameSpan = document.createElement("span");
        trickWinningPlayerNameSpan.classList.add("trick-winning-player-name");
        trickWinningPlayerNameSpan.textContent = `${winningPlayedCard.player.name}`;
        trickWinningPlayerDiv.appendChild(trickWinningPlayerNameSpan);
      }
    }

    /* Hands */
    drawPlayerHandsDiv(round, playerAreas, players);

    /* Trick */
    if (trick) {
      drawPlayedTrickDiv(trick, players, trickCardDivs);
    }
  }

}

function drawPlayedTrickDiv(trick: Trick, players: Map<Position, Player>, trickCardDivs: Map<Position, HTMLDivElement>) {
  PositionHelper.getPositions().forEach(position => {
    const player = players.get(position)!;
    const playedCard = trick.getPlayedCardByPlayer(player);
    const trickCardDiv = trickCardDivs.get(position)!;
    if (playedCard) {
      trickCardDiv.appendChild(makePlayedCardImage(playedCard.card));
    }
  });
}

function drawPlayerHandsDiv(round: Round, playerAreas: Map<Position, HTMLDivElement>, players: Map<Position, Player>) {
  PositionHelper.getPositions().forEach(position => {
    const playerArea = playerAreas.get(position)!;
    const player = players.get(position)!;

    const playerHand = document.createElement("div");
    playerHand.classList.add("player-hand");
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
  const meldDiv = document.createElement("div");
  meldDiv.classList.add("meld");

  const meldPlayerDiv = document.createElement("div");
  meldPlayerDiv.classList.add("meld-player");
  meldPlayerDiv.textContent = `${player.name}`;
  meldDiv.appendChild(meldPlayerDiv);

  const meldTypeDiv = document.createElement("div");
  meldTypeDiv.classList.add("meld-type");
  meldTypeDiv.textContent = `${Meld.getMeldTypeString(meld.type)}`;
  meldDiv.appendChild(meldTypeDiv);

  const meldPointsDiv = document.createElement("div");
  meldPointsDiv.classList.add("meld-points");
  meldPointsDiv.textContent = `(${meld.points})`;
  meldDiv.appendChild(meldPointsDiv);

  if (definitive && meld.highestRank && meld.suit) {
    const meldHighestCardDiv = document.createElement("div");
    meldHighestCardDiv.classList.add("meld-highest-card");
    meldHighestCardDiv.appendChild(makeIllustrationCardImage(new Card(meld.suit, meld.highestRank)));
    meldDiv.appendChild(meldHighestCardDiv);
  }

  return meldDiv;
}

function makeCardImage(card: Card, visible: boolean, rotated: boolean, allowed: boolean): HTMLDivElement {
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");
  let cardImage = document.createElement("img");
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
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card", "card-small");
  cardDiv.setAttribute("alt", `${card.rank} of ${card.suit}`);

  let cardImage = document.createElement("img");
  cardImage.classList.add("card-image-small");
  cardImage.src = `${import.meta.env.BASE_URL}images/${card.rank}${SuitHelper.getSuitAbbreviation(card.suit)}.png`;
  cardDiv.appendChild(cardImage);

  return cardDiv;
}

function makePlayedCardImage(card: Card): HTMLDivElement {
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card", "card-normal");
  cardDiv.setAttribute("alt", `${card.rank} of ${card.suit}`);

  let cardImage = document.createElement("img");
  cardImage.classList.add("card-image");
  cardImage.src = `${import.meta.env.BASE_URL}images/${card.rank}${SuitHelper.getSuitAbbreviation(card.suit)}.png`;
  cardDiv.appendChild(cardImage);

  return cardDiv;
}
