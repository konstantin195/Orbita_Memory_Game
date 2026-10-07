"use strict";

// Всяко ниво използва различен брой двойки от един и същ набор.
const levels = { easy: 6, medium: 8, hard: 12 };
const names = ["Сатурн", "Луна", "Земя", "Слънце", "Ракета", "Летяща чиния", "Космонавт", "Комета", "Галактика", "Телескоп", "Марс", "Астероид"];
const symbolsText = ["🪐", "🌙", "🌍", "☀️", "🚀", "🛸", "👨‍🚀", "☄️", "🌌", "🔭", "🔴", "💎"];
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
  bestDisplay.textContent = best ? `${best.moves} хода · ${formatTime(best.seconds)}` : "—";
}

function newGame() {
  // Почистваме и забавеното скриване, ако новата игра започне по средата на ход.
  clearInterval(timer);
  clearTimeout(hideTimeout);
  if (winDialog.open) winDialog.close();
  firstCard = null;
  locked = false;
  moves = 0;
  matchedPairs = 0;
  startedAt = null;
  timeDisplay.textContent = "00:00";
  statusDisplay.textContent = "Две карти. Една двойка. Твоят следващ ход.";
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
    card.setAttribute("aria-label", `Карта ${index + 1}, скрита`);
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
  card.setAttribute("aria-label", `Карта ${card.dataset.position}, ${names[card.dataset.symbol]}`);
  if (firstCard === null) {
    firstCard = card;
    statusDisplay.textContent = "Избери още една карта.";
    return;
  }
  moves++;
  const previous = firstCard;
  firstCard = null;
  if (previous.dataset.symbol === card.dataset.symbol) {
    for (const match of [previous, card]) {
      match.classList.add("matched");
      match.disabled = true;
      match.setAttribute("aria-label", `${names[match.dataset.symbol]}, открита двойка`);
    }
    matchedPairs++;
    statusDisplay.textContent = "Откри двойка! Продължавай.";
    updateStats();
    if (matchedPairs === levels[difficulty.value]) finishGame();
  } else {
    locked = true;
    statusDisplay.textContent = "Различни са. Запомни местата им.";
    updateStats();
    hideTimeout = setTimeout(() => {
      for (const hidden of [previous, card]) {
        hidden.classList.remove("open");
        hidden.setAttribute("aria-label", `Карта ${hidden.dataset.position}, скрита`);
      }
      locked = false;
      statusDisplay.textContent = "Опитай друга двойка.";
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
  statusDisplay.textContent = "Готово! Откри всички двойки.";
  document.querySelector("#win-result").textContent = `${moves} хода за ${formatTime(seconds)}. Отличен фокус!`;
  document.querySelector("#win-record").textContent = improved ? (saved ? "Нов личен рекорд за тази трудност!" : "Нов рекорд за тази сесия. Запазването е недостъпно.") : "Още една игра за по-добър резултат?";
  winDialog.showModal();
}

document.querySelector("#restart").addEventListener("click", newGame);
difficulty.addEventListener("change", newGame);
document.querySelector("#play-again").addEventListener("click", newGame);
document.querySelector("#close-win").addEventListener("click", () => { winDialog.close(); document.querySelector("#restart").focus(); });
winDialog.addEventListener("cancel", () => { document.querySelector("#restart").focus(); });
newGame();
