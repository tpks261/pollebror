const screens = {
  start: document.querySelector("#startScreen"),
  mana: document.querySelector("#manaScreen"),
  rune: document.querySelector("#runeScreen"),
  duel: document.querySelector("#duelScreen"),
  final: document.querySelector("#finalScreen"),
};

const manaCount = document.querySelector("#manaCount");
const stageCount = document.querySelector("#stageCount");
const manaGrid = document.querySelector("#manaGrid");
const codeForm = document.querySelector("#codeForm");
const codeInput = document.querySelector("#codeInput");
const codeFeedback = document.querySelector("#codeFeedback");
const bossHp = document.querySelector("#bossHp");
const duelFeedback = document.querySelector("#duelFeedback");
const confettiCanvas = document.querySelector("#confettiCanvas");
const confettiContext = confettiCanvas.getContext("2d");

let collectedMana = 0;
let activeMana = 0;
let bossHealth = 12;
let confettiPieces = [];
let confettiAnimation = null;

function showScreen(name, stage) {
  Object.values(screens).forEach((screen) => screen.classList.add("hidden"));
  screens[name].classList.remove("hidden");
  stageCount.textContent = stage;
}

function startQuest() {
  collectedMana = 0;
  bossHealth = 12;
  manaCount.textContent = "0/5";
  codeInput.value = "";
  codeFeedback.textContent = "";
  duelFeedback.textContent = "";
  bossHp.textContent = "12 HP";
  document.querySelectorAll(".spell").forEach((spell) => {
    spell.disabled = false;
    spell.classList.remove("used");
  });
  showScreen("mana", "1/3");
  renderManaGrid();
}

function renderManaGrid() {
  manaGrid.innerHTML = "";
  activeMana = Math.floor(Math.random() * 9);

  for (let index = 0; index < 9; index += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === activeMana ? "mana-card active" : "mana-card";
    button.setAttribute("aria-label", index === activeMana ? "Lysende mana" : "Tomt kort");
    button.textContent = index === activeMana ? "✦" : "◇";
    button.addEventListener("click", () => collectMana(index));
    manaGrid.append(button);
  }
}

function collectMana(index) {
  if (index !== activeMana) {
    return;
  }

  collectedMana += 1;
  manaCount.textContent = `${collectedMana}/5`;

  if (collectedMana >= 5) {
    showScreen("rune", "2/3");
    codeInput.focus();
    return;
  }

  renderManaGrid();
}

codeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (codeInput.value.trim() === "35") {
    codeFeedback.textContent = "Runen åbner. Pøllebror må gå videre.";
    window.setTimeout(() => showScreen("duel", "3/3"), 650);
    return;
  }

  codeFeedback.textContent = "Nope. Hint: han er blevet præcis så gammel, som han opfører sig.";
  codeInput.select();
});

document.querySelectorAll(".spell").forEach((spell) => {
  spell.addEventListener("click", () => {
    if (spell.disabled) {
      return;
    }

    const damage = Number(spell.dataset.damage);
    bossHealth = Math.max(0, bossHealth - damage);
    spell.disabled = true;
    spell.classList.add("used");
    bossHp.textContent = `${bossHealth} HP`;

    if (bossHealth === 0) {
      duelFeedback.textContent = "Critical hit. Gaveportalen er åben.";
      window.setTimeout(unlockGift, 750);
      return;
    }

    duelFeedback.textContent = `Du ramte for ${damage}. Voksenansvar vakler.`;
  });
});

function unlockGift() {
  showScreen("final", "3/3");
  fireConfetti();
}

function fireConfetti() {
  const colors = ["#ff4f8b", "#ffd166", "#4ee6a8", "#49c6ff", "#fff7d6"];
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiPieces = Array.from({ length: 130 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height,
    size: 5 + Math.random() * 7,
    speed: 2 + Math.random() * 4,
    drift: -1.5 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
  }));

  if (confettiAnimation) {
    cancelAnimationFrame(confettiAnimation);
  }

  animateConfetti();
  window.setTimeout(() => cancelAnimationFrame(confettiAnimation), 5200);
}

function animateConfetti() {
  confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach((piece) => {
    piece.y += piece.speed;
    piece.x += piece.drift;
    piece.rotation += 0.08;

    confettiContext.save();
    confettiContext.translate(piece.x, piece.y);
    confettiContext.rotate(piece.rotation);
    confettiContext.fillStyle = piece.color;
    confettiContext.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
    confettiContext.restore();
  });

  confettiAnimation = requestAnimationFrame(animateConfetti);
}

window.addEventListener("resize", () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

document.querySelector("#startButton").addEventListener("click", startQuest);
document.querySelector("#restartButton").addEventListener("click", startQuest);
