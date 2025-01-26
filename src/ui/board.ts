import { Game } from "../models/game/game.ts";
import { Card } from "../models/card/card.ts";
import { SuitHelper } from "../models/card/suit.ts";
import { Rank, RankHelper } from "../models/card/rank.ts";
import { Player } from "../models/player/player.ts";
import { Round } from "../models/game/round.ts";
import { Trick } from "../models/game/trick.ts";

export function drawBoard(game: Game) {
  const app = document.getElementById("app");

  if (app.firstChild) {
    app.removeChild(app.firstChild);
  }

  const round: Round | undefined = game.rounds[game.rounds.length - 1];
  const trick : Trick | undefined = round ? round.currentTrick : undefined;

  const playerBottom = game.teams[0].player1;
  const playerRight = game.teams[1].player1;
  const playerTop = game.teams[0].player2;
  const playerLeft = game.teams[1].player2;

  const container = document.createElement("div");
  container.id = "container";
  app.appendChild(container);

  const baize = document.createElement("div");
  baize.id = "baize";
  container.appendChild(baize);

  /* Areas */

  const playerBottomArea = document.createElement("div");
  playerBottomArea.classList.add("area", "bottom-area");
  // playerBottomArea.textContent = playerBottom.name;
  baize.appendChild(playerBottomArea);

  const playerRightArea = document.createElement("div");
  playerRightArea.classList.add("area", "right-area");
  // playerRightHand.textContent = playerRight.name;
  baize.appendChild(playerRightArea);

  const playerTopArea = document.createElement("div");
  playerTopArea.classList.add("area", "top-area");
  // playerTopHand.textContent = playerTop.name;
  baize.appendChild(playerTopArea);

  const playerLeftArea = document.createElement("div");
  playerLeftArea.classList.add("area", "left-area");
  // playerLeftHand.textContent = playerLeft.name;
  baize.appendChild(playerLeftArea);

  const playerBottomName = document.createElement("div");
  playerBottomName.classList.add("player-name", "bottom-player-name");
  playerBottomName.textContent = playerBottom.name;
  baize.appendChild(playerBottomName);

  const playerRightName = document.createElement("div");
  playerRightName.classList.add("player-name", "right-player-name");
  playerRightName.textContent = playerRight.name;
  baize.appendChild(playerRightName);

  const playerTopName = document.createElement("div");
  playerTopName.classList.add("player-name", "top-player-name");
  playerTopName.textContent = playerTop.name;
  baize.appendChild(playerTopName);

  const playerLeftName = document.createElement("div");
  playerLeftName.classList.add("player-name", "left-player-name");
  playerLeftName.textContent = playerLeft.name;
  baize.appendChild(playerLeftName);


  /* Trick cards */

  const trickCardBottom = document.createElement("div");
  trickCardBottom.classList.add("trick-card", "bottom-trick-card");
  baize.appendChild(trickCardBottom);

  const trickCardRight = document.createElement("div");
  trickCardRight.classList.add("trick-card", "right-trick-card");
  baize.appendChild(trickCardRight);

  const trickCardTop = document.createElement("div");
  trickCardTop.classList.add("trick-card", "top-trick-card");
  baize.appendChild(trickCardTop);

  const trickCardLeft = document.createElement("div");
  trickCardLeft.classList.add("trick-card", "left-trick-card");
  baize.appendChild(trickCardLeft);

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
    teamPointsDiv.textContent = game.scores.get(team).toString();
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
      if (player.isHuman) {
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
    trumpSuitImage.src = `/images/${RankHelper.getRankFromAbbreviation(Rank.ACE)}${SuitHelper.getSuitAbbreviation(round.trumpSuit)}.png`;
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

    for (const [player, meld] of round.provisionalMelds) {
      const meldDiv = document.createElement("div");
      meldDiv.classList.add("meld");
      meldsDiv.appendChild(meldDiv);

      const meldPlayerDiv = document.createElement("div");
      meldPlayerDiv.classList.add("meld-player");
      meldPlayerDiv.textContent = `${player.name}`;
      meldDiv.appendChild(meldPlayerDiv);

      const meldTypeDiv = document.createElement("div");
      meldTypeDiv.classList.add("meld-type");
      meldTypeDiv.textContent = `${meld.type}`;
      meldDiv.appendChild(meldTypeDiv);

      const meldPointsDiv = document.createElement("div");
      meldPointsDiv.classList.add("meld-points");
      meldPointsDiv.textContent = `${meld.points}`;
      meldDiv.appendChild(meldPointsDiv);
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

    const playerBottomHand = document.createElement("div");
    playerBottomHand.classList.add("player-hand");
    playerBottomArea.appendChild(playerBottomHand);
    const playerBottomCards: Card[] = round.playerHands.get(playerBottom);
    let allowedCards = [];
    if (round.currentTrick) {
      allowedCards = round.getAllowedCards(playerBottom, round.currentTrick!, round.trumpSuit);
    }
    for (const card of playerBottomCards!) {
      playerBottomHand.appendChild(makeCardImage(card, playerBottom.isHuman, false, allowedCards.includes(card)));
    }

    const playerRightHand = document.createElement("div");
    playerRightHand.classList.add("player-hand");
    playerRightArea.appendChild(playerRightHand);
    const playerRightCards: Card[] = round.playerHands.get(playerRight);
    for (const card of playerRightCards!) {
      playerRightHand.appendChild(makeCardImage(card, playerRight.isHuman, true, playerRight.isHuman));
    }

    const playerTopHand = document.createElement("div");
    playerTopHand.classList.add("player-hand");
    playerTopArea.appendChild(playerTopHand);
    const playerTopCards: Card[] = round.playerHands.get(playerTop);
    for (const card of playerTopCards!) {
      playerTopHand.appendChild(makeCardImage(card, playerTop.isHuman, false, playerTop.isHuman));
    }

    const playerLeftHand = document.createElement("div");
    playerLeftHand.classList.add("player-hand");
    playerLeftArea.appendChild(playerLeftHand);
    const playerLeftCards: Card[] = round.playerHands.get(playerLeft);
    for (const card of playerLeftCards!) {
      playerLeftHand.appendChild(makeCardImage(card, playerLeft.isHuman, true, playerLeft.isHuman));
    }

    /* Trick */

    if (trick) {

      const playedCardBottom = trick.getPlayedCardByPlayer(playerBottom);
      if (playedCardBottom) {
        trickCardBottom.appendChild(makePlayedCardImage(playedCardBottom.card));
      }

      const playedCardRight = trick.getPlayedCardByPlayer(playerRight);
      if (playedCardRight) {
        trickCardRight.appendChild(makePlayedCardImage(playedCardRight.card));
      }

      const playedCardTop = trick.getPlayedCardByPlayer(playerTop);
      if (playedCardTop) {
        trickCardTop.appendChild(makePlayedCardImage(playedCardTop.card));
      }

      const playedCardLeft = trick.getPlayedCardByPlayer(playerLeft);
      if (playedCardLeft) {
        trickCardLeft.appendChild(makePlayedCardImage(playedCardLeft.card));
      }

    }
  }

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
    cardImage.src = `/images/${card.rank}${SuitHelper.getSuitAbbreviation(card.suit)}.png`;
    if (allowed) {
      cardDiv.classList.add("card-allowed");
    }
  } else {
    cardDiv.classList.add("card-back");
    if (rotated) {
      cardImage.classList.add("card-image-rotated");
      cardImage.src = "/images/gray_back_rotated.png";
    } else {
      cardImage.classList.add("card-image");
      cardImage.src = "/images/gray_back.png";
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

function makePlayedCardImage(card: Card): HTMLDivElement {
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card", "card-normal");
  cardDiv.setAttribute("alt", `${card.rank} of ${card.suit}`);

  let cardImage = document.createElement("img");
  cardImage.classList.add("card-image");
  cardImage.src = `/images/${card.rank}${SuitHelper.getSuitAbbreviation(card.suit)}.png`;
  cardDiv.appendChild(cardImage);

  return cardDiv;
}

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
      const card = round.getCardToPlay(player, round.currentTrick!, round.trumpSuit);
      resolve(card);
    }, 1000);
  });
}

export function delay() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}
