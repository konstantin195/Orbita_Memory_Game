"use strict";

// Всяко ниво използва различен брой двойки от един и същ набор.
const symbolsText = ["🪐", "🌙", "🌍", "☀️", "🚀", "🛸", "👨‍🚀", "☄️", "🌌", "🔭", "🔴", "💎"];
const levels = { easy: 6, medium: 8, hard: 12 };
const translations = {
  "en": {
    "title": "Orbita — memory game",
    "brand": "Orbita",
    "home": "Orbita — home",
    "game": "Memory game",
    "heading": "A little focus. A universe to discover.",
    "intro": "Flip the cards and find every matching pair.",
    "difficulty": "Difficulty",
    "easy": "Easy · 6 pairs",
    "medium": "Medium · 8 pairs",
    "hard": "Hard · 12 pairs",
    "restart": "New game",
    "moves": "Moves",
    "time": "Time",
    "pairs": "Pairs",
    "best": "Personal best",
    "progress": "Matched pairs",
    "board": "Cards",
    "ready": "Two cards. One pair. Your next move.",
    "one": "Choose one more card.",
    "match": "A match! Keep going.",
    "different": "Different cards. Remember their places.",
    "tryAgain": "Try another pair.",
    "done": "Done! You found every pair.",
    "hint": "The timer starts with your first card.",
    "storage": "Saving is unavailable. You can still play without a saved record.",
    "languageStorage": "Your language choice could not be saved. It applies for this visit.",
    "rulesTitle": "How to play",
    "rules": "Choose two cards. Matching cards stay face up; different cards turn back over. Choosing two different cards counts as one move. Find every pair in as few moves as possible. If moves are equal, the shorter time wins. Changing difficulty starts a new game. Use Tab and Enter or Space to play with a keyboard.",
    "footer": "Learning project created with AI assistance · HTML, CSS and JavaScript",
    "winTitle": "You found every pair!",
    "again": "Play again",
    "close": "View cards",
    "language": "Language",
    "newRecord": "New personal best for this difficulty!",
    "sessionRecord": "New best for this session. Saving is unavailable.",
    "another": "Another round to improve your score?",
    "hidden": "hidden",
    "card": "Card",
    "matched": "matched pair",
    "movesWord": "moves",
    "resultEnd": "Great focus!",
    "names": [
      "Saturn",
      "Moon",
      "Earth",
      "Sun",
      "Rocket",
      "Flying saucer",
      "Astronaut",
      "Comet",
      "Galaxy",
      "Telescope",
      "Mars",
      "Asteroid"
    ]
  },
  "bg": {
    "title": "Орбита — игра за памет",
    "brand": "Орбита",
    "home": "Орбита — начало",
    "game": "Игра за памет",
    "heading": "Малко фокус. Много открития.",
    "intro": "Обърни картите и открий всички еднакви двойки.",
    "difficulty": "Трудност",
    "easy": "Лесно · 6 двойки",
    "medium": "Средно · 8 двойки",
    "hard": "Трудно · 12 двойки",
    "restart": "Нова игра",
    "moves": "Ходове",
    "time": "Време",
    "pairs": "Двойки",
    "best": "Личен рекорд",
    "progress": "Открити двойки",
    "board": "Карти",
    "ready": "Две карти. Една двойка. Твоят следващ ход.",
    "one": "Избери още една карта.",
    "match": "Откри двойка! Продължавай.",
    "different": "Различни са. Запомни местата им.",
    "tryAgain": "Опитай друга двойка.",
    "done": "Готово! Откри всички двойки.",
    "hint": "Таймерът започва с първата карта.",
    "storage": "Запазването е недостъпно. Можеш да играеш без рекорд.",
    "languageStorage": "Избраният език не може да се запази. Той важи за това посещение.",
    "rulesTitle": "Как се играе?",
    "rules": "Избери две карти. Еднаквите остават открити, а различните се скриват. Един ход е отварянето на две различни карти. Открий всички двойки с възможно най-малко ходове. При равни ходове печели по-краткото време. Трудността започва нова игра. С клавиатура използвай Tab и Enter или интервал.",
    "footer": "Учебен проект, създаден с помощта на AI · HTML, CSS и JavaScript",
    "winTitle": "Всички двойки са открити!",
    "again": "Играй отново",
    "close": "Виж картите",
    "language": "Език",
    "newRecord": "Нов личен рекорд за тази трудност!",
    "sessionRecord": "Нов рекорд за тази сесия. Запазването е недостъпно.",
    "another": "Още една игра за по-добър резултат?",
    "hidden": "скрита",
    "card": "Карта",
    "matched": "открита двойка",
    "movesWord": "хода",
    "resultEnd": "Отличен фокус!",
    "names": [
      "Сатурн",
      "Луна",
      "Земя",
      "Слънце",
      "Ракета",
      "Летяща чиния",
      "Космонавт",
      "Комета",
      "Галактика",
      "Телескоп",
      "Марс",
      "Астероид"
    ]
  }
};
const languageKey = "orbita-language-v1";
let language = readLanguage();
let statusKey = "ready";
let winResult = null;
const t = key => translations[language][key];
const board = document.querySelector("#board");
const difficulty = document.querySelector("#difficulty");
const movesDisplay = document.querySelector("#moves");
const timeDisplay = document.querySelector("#time");
const pairsDisplay = document.querySelector("#pairs");
const bestDisplay = document.querySelector("#best");
const progress = document.querySelector("#progress");
const statusDisplay = document.querySelector("#status");
const winDialog = document.querySelector("#win");
const storageKey = "orbita-best-v1";

let firstCard = null;
let locked = false;
let moves = 0;
let matchedPairs = 0;
let startedAt = null;
let timer = null;
let hideTimeout = null;
let records = readRecords();

function readRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const valid = {};
    // Повредени или ръчно променени данни не трябва да спират играта.
    for (const level of Object.keys(levels)) {
      const item = saved?.[level];
      if (Number.isInteger(item?.moves) && item.moves >= levels[level] && Number.isInteger(item?.seconds) && item.seconds >= 0) valid[level] = item;
    }
    return valid;
  } catch {
    document.querySelector("#storage-note").hidden = false;
    return {};
  }
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function elapsedSeconds() {
  return startedAt === null ? 0 : Math.floor((performance.now() - startedAt) / 1000);
}

// Fisher–Yates: разменяме всяка карта със случайна карта преди нея.
function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function updateStats() {
  movesDisplay.textContent = String(moves).padStart(2, "0");
  pairsDisplay.textContent = `${matchedPairs} / ${levels[difficulty.value]}`;
  progress.value = matchedPairs;
  const best = records[difficulty.value];
  bestDisplay.textContent = best ? `${best.moves} ${t("movesWord")} · ${formatTime(best.seconds)}` : "—";
}

function newGame() {
  // Почистваме и забавеното скриване, ако новата игра започне по средата на ход.
  clearInterval(timer);
  clearTimeout(hideTimeout);
  if (winDialog.open) winDialog.close();
  firstCard = null;
  winResult = null;
  locked = false;
  moves = 0;
  matchedPairs = 0;
  startedAt = null;
  timeDisplay.textContent = "00:00";
  setStatus("ready");
  const pairCount = levels[difficulty.value];
  progress.max = pairCount;
  board.dataset.level = difficulty.value;
  board.replaceChildren();
  const symbols = Array.from({ length: pairCount }, (_, index) => index);
  const deck = shuffle([...symbols, ...symbols]);

  deck.forEach((symbol, index) => {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.dataset.symbol = symbol;
    card.dataset.position = index + 1;
    updateCardLabel(card);
    card.innerHTML = '<span class="back" aria-hidden="true">✦</span><span class="art" aria-hidden="true"></span>';
    card.querySelector(".art").textContent = symbolsText[symbol];
    card.style.setProperty("--x", `${(symbol % 4) * 100 / 3}%`);
    card.style.setProperty("--y", `${Math.floor(symbol / 4) * 50}%`);
    card.addEventListener("click", () => flipCard(card));
    board.append(card);
  });
  updateStats();
}

function flipCard(card) {
  if (locked || card.disabled || card === firstCard) return;
  if (startedAt === null) {
    startedAt = performance.now();
    timer = setInterval(() => { timeDisplay.textContent = formatTime(elapsedSeconds()); }, 250);
  }
  card.classList.add("open");
  updateCardLabel(card);
  if (firstCard === null) {
    firstCard = card;
    setStatus("one");
    return;
  }
  moves++;
  const previous = firstCard;
  firstCard = null;
  if (previous.dataset.symbol === card.dataset.symbol) {
    for (const match of [previous, card]) {
      match.classList.add("matched");
      match.disabled = true;
      updateCardLabel(match);
    }
    matchedPairs++;
    setStatus("match");
    updateStats();
    if (matchedPairs === levels[difficulty.value]) finishGame();
  } else {
    locked = true;
    setStatus("different");
    updateStats();
    hideTimeout = setTimeout(() => {
      for (const hidden of [previous, card]) {
        hidden.classList.remove("open");
        updateCardLabel(hidden);
      }
      locked = false;
      setStatus("tryAgain");
    }, 900);
  }
}

function finishGame() {
  clearInterval(timer);
  const seconds = elapsedSeconds();
  timeDisplay.textContent = formatTime(seconds);
  const level = difficulty.value;
  const best = records[level];
  const improved = !best || moves < best.moves || (moves === best.moves && seconds < best.seconds);
  let saved = true;
  if (improved) {
    records[level] = { moves, seconds };
    try { localStorage.setItem(storageKey, JSON.stringify(records)); }
    catch { saved = false; document.querySelector("#storage-note").hidden = false; }
  }
  updateStats();
  setStatus("done");
  winResult = { seconds, improved, saved };
  renderWin();
  winDialog.showModal();
}


// Language changes only update labels; the deck, timer and records stay intact.
function readLanguage() {
  try { return localStorage.getItem("orbita-language-v1") === "bg" ? "bg" : "en"; }
  catch { return "en"; }
}

function setStatus(key) {
  statusKey = key;
  statusDisplay.textContent = t(key);
}

function updateCardLabel(card) {
  const name = t("names")[card.dataset.symbol];
  const description = card.classList.contains("matched") ? `${name}, ${t("matched")}` : `${t("card")} ${card.dataset.position}, ${card.classList.contains("open") ? name : t("hidden")}`;
  card.setAttribute("aria-label", description);
}

function renderWin() {
  if (!winResult) return;
  const { seconds, improved, saved } = winResult;
  document.querySelector("#win-result").textContent = language === "en" ? `${moves} moves in ${formatTime(seconds)}. ${t("resultEnd")}` : `${moves} хода за ${formatTime(seconds)}. ${t("resultEnd")}`;
  document.querySelector("#win-record").textContent = t(improved ? (saved ? "newRecord" : "sessionRecord") : "another");
}

function renderLanguage() {
  document.documentElement.lang = language;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach(element => { element.setAttribute("aria-label", t(element.dataset.i18nAria)); });
  document.querySelectorAll(".language-choice").forEach(select => { select.value = language; });
  board.querySelectorAll(".card").forEach(updateCardLabel);
  setStatus(statusKey);
  updateStats();
  renderWin();
}

document.querySelectorAll(".language-choice").forEach(select => {
  select.addEventListener("change", () => {
    language = select.value;
    try { localStorage.setItem(languageKey, language); }
    catch { document.querySelector("#language-note").hidden = false; }
    renderLanguage();
  });
});

document.querySelector("#restart").addEventListener("click", newGame);
difficulty.addEventListener("change", newGame);
document.querySelector("#play-again").addEventListener("click", newGame);
document.querySelector("#close-win").addEventListener("click", () => { winDialog.close(); document.querySelector("#restart").focus(); });
winDialog.addEventListener("cancel", () => { document.querySelector("#restart").focus(); });
newGame();
renderLanguage();
