// ===== DOM =====
const needle = document.getElementById("needle");
const stopBtn = document.getElementById("stopBtn");

const rewardCard = document.getElementById("rewardCard");
const rewardRarity = document.getElementById("rewardRarity");
const rewardName = document.getElementById("rewardName");
const rewardDesc = document.getElementById("rewardDesc");

const pullAgain = document.getElementById("pullAgain");
const shareFake = document.getElementById("shareFake");

const inventoryToggle = document.getElementById("inventoryToggle");
const drawer = document.getElementById("drawer");
const drawerClose = document.getElementById("drawerClose");
const overlay = document.getElementById("overlay");
const inventoryGrid = document.getElementById("inventoryGrid");
const invCount = document.getElementById("invCount");

const towerLevelEl = document.getElementById("towerLevel");
const towerProgressText = document.getElementById("towerProgressText");
const towerProgressFill = document.getElementById("towerProgressFill");
const coinsEl = document.getElementById("coins");

const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

// ===== GAME STATE =====
let position = 0;
let speed = 3;
let moving = true;
let slowing = false;

let currentFilter = "ALL";

// ===== STORAGE =====
function loadState() {
  return {
    inventory: JSON.parse(localStorage.getItem("inventory_v2")) || [],
    coins: Number(localStorage.getItem("coins")) || 0,
  };
}
function saveState(state) {
  localStorage.setItem("inventory_v2", JSON.stringify(state.inventory));
  localStorage.setItem("coins", String(state.coins));
}

// ===== HELPERS =====
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function getRarityByPosition(px) {
  // needle range: 0..(containerWidth-needleWidth). Our CSS zones are 55/30/15.
  // We'll use simple thresholds by percentage.
  const container = document.getElementById("bar-container");
  const maxPx = container.clientWidth - 10; // needle width approx
  const p = (px / maxPx) * 100;

  if (p >= 85) return "Ultra";
  if (p >= 55) return "Rare";
  return "Common";
}

function getRandomItem(rarity) {
  const pool = ITEMS.filter(i => i.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function rarityTagClass(r) {
  if (r === "Ultra") return "tag-ultra";
  if (r === "Rare") return "tag-rare";
  return "tag-common";
}

// ===== UI RENDER =====
function renderHud() {
  const state = loadState();
  coinsEl.textContent = state.coins;

  const total = state.inventory.length;
  const level = Math.floor(total / 5) + 1;
  const inLevel = total % 5;

  towerLevelEl.textContent = String(level);
  towerProgressText.textContent = `${inLevel}/5`;
  towerProgressFill.style.width = `${(inLevel / 5) * 100}%`;
}

function renderInventory() {
  const state = loadState();
  invCount.textContent = `${state.inventory.length} items collected`;

  inventoryGrid.innerHTML = "";

  const filtered = state.inventory.filter(it => currentFilter === "ALL" ? true : it.rarity === currentFilter);

  filtered.slice().reverse().forEach(it => {
    const div = document.createElement("div");
    div.className = "itemCard";

    div.innerHTML = `
      <div class="itemName">${it.name}</div>
      <div class="itemMeta">
        <span>${it.rarity}</span>
        <span>+${it.rarity === "Ultra" ? 50 : it.rarity === "Rare" ? 15 : 5}c</span>
      </div>
    `;
    inventoryGrid.appendChild(div);
  });
}

// ===== DRAWER =====
function openDrawer() {
  drawer.classList.add("open");
  overlay.classList.remove("hidden");
  renderInventory();
}
function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.add("hidden");
}

// ===== JUICE: SHAKE + SLOWMO =====
function screenShake(ms = 250) {
  const machine = document.getElementById("machine");
  machine.style.transition = "transform 0.05s";
  let t = 0;
  const interval = setInterval(() => {
    t += 1;
    const x = (Math.random() - 0.5) * 6;
    const y = (Math.random() - 0.5) * 6;
    machine.style.transform = `translate(${x}px, ${y}px)`;
    if (t > ms / 50) {
      clearInterval(interval);
      machine.style.transform = "";
      machine.style.transition = "";
    }
  }, 50);
}

function slowMoStart() {
  slowing = true;
}
function slowMoEnd() {
  slowing = false;
}

// ===== CONFETTI =====
function resizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeConfetti);
resizeConfetti();

let confettiParticles = [];
function launchConfetti() {
  const count = 120;
  confettiParticles = [];
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2,
      y: 160,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -10 - 4,
      g: 0.25 + Math.random() * 0.2,
      s: 4 + Math.random() * 4,
      a: 1
    });
  }
  animateConfetti();
}

function animateConfetti() {
  if (confettiParticles.length === 0) return;
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach(p => {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.a -= 0.01;

    ctx.globalAlpha = clamp(p.a, 0, 1);
    ctx.fillRect(p.x, p.y, p.s, p.s);
  });

  confettiParticles = confettiParticles.filter(p => p.a > 0 && p.y < window.innerHeight + 40);

  requestAnimationFrame(animateConfetti);
}

// ===== NEEDLE MOVEMENT =====
function moveNeedle() {
  if (!moving) return;

  const container = document.getElementById("bar-container");
  const maxPx = container.clientWidth - 10;

  // slow-mo when we’re near stop click (optional feel)
  const effectiveSpeed = slowing ? speed * 0.35 : speed;

  position += effectiveSpeed;
  if (position >= maxPx || position <= 0) speed *= -1;

  needle.style.left = position + "px";
  requestAnimationFrame(moveNeedle);
}
moveNeedle();

// ===== PULL RESOLUTION =====
function showReward(item) {
  rewardCard.classList.remove("hidden");

  rewardRarity.textContent = item.rarity.toUpperCase();
  rewardRarity.className = `rarityTag ${rarityTagClass(item.rarity)}`;

  rewardName.textContent = item.name;
  rewardDesc.textContent = item.desc || "A collectible memory.";

  // extra juice for ultra
  if (item.rarity === "Ultra") {
    screenShake(350);
    launchConfetti();
  } else if (item.rarity === "Rare") {
    screenShake(180);
  }
}

function awardCoins(rarity) {
  const state = loadState();
  const add = rarity === "Ultra" ? 50 : rarity === "Rare" ? 15 : 5;
  state.coins += add;
  saveState(state);
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function loadMeta() {
  return JSON.parse(localStorage.getItem("meta")) || {
    lastDaily: null,
    streak: 0,
    pity: 0
  };
}
function saveMeta(meta) {
  localStorage.setItem("meta", JSON.stringify(meta));
}

function updateStreakUI() {
  const meta = loadMeta();
  const el = document.getElementById("streakText");
  if (el) el.textContent = `Streak: ${meta.streak} day(s)`;
}

document.getElementById("dailyBtn").addEventListener("click", () => {
  const meta = loadMeta();
  const t = todayKey();

  if (meta.lastDaily === t) {
    alert("Already claimed today!");
    return;
  }

  // streak logic
  // if lastDaily was yesterday, streak++; else streak = 1
  const last = meta.lastDaily ? new Date(meta.lastDaily) : null;
  const now = new Date(t);
  const diffDays = last ? Math.round((now - last) / (1000*60*60*24)) : 999;

  meta.streak = (diffDays === 1) ? meta.streak + 1 : 1;
  meta.lastDaily = t;
  saveMeta(meta);

  // reward: coins scale with streak
  const state = loadState();
  const rewardCoins = 20 + Math.min(80, meta.streak * 10);
  state.coins += rewardCoins;
  saveState(state);

  renderHud();
  updateStreakUI();
  alert(`Daily claimed! +${rewardCoins} coins`);
});

updateStreakUI();

function saveItem(item) {
  const state = loadState();
  state.inventory.push(item);
  saveState(state);
}

function applyPity(rarity) {
  const meta = loadMeta();

  // if not Rare/Ultra, increase pity; else reset
  if (rarity === "Common") meta.pity += 1;
  else meta.pity = 0;

  // guarantee Rare after 7 commons
  if (meta.pity >= 7) {
    meta.pity = 0;
    saveMeta(meta);
    return "Rare";
  }

  saveMeta(meta);
  return rarity;
}

// ===== STOP BUTTON =====
stopBtn.addEventListener("mousedown", slowMoStart);
stopBtn.addEventListener("touchstart", slowMoStart, { passive: true });

stopBtn.addEventListener("mouseup", slowMoEnd);
stopBtn.addEventListener("mouseleave", slowMoEnd);
stopBtn.addEventListener("touchend", slowMoEnd);

stopBtn.addEventListener("click", () => {
  if (!moving) return;
  moving = false;
  slowMoEnd();

  const rarity = getRarityByPosition(position);
  const item = getRandomItem(rarity);

  // apply pity system
  item.rarity = applyPity(item.rarity);
  
  awardCoins(rarity);
  saveItem(item);

  renderHud();
  renderInventory();
  showReward(item);

  // auto-ready for next pull but keep reward visible
  setTimeout(() => {
    position = 0;
    moving = true;
    moveNeedle();
  }, 650);
});

// ===== REWARD BUTTONS =====
pullAgain.addEventListener("click", () => {
  rewardCard.classList.add("hidden");
});

shareFake.addEventListener("click", () => {
  // fake share for MVP: just copy to clipboard
  const text = `I pulled ${rewardName.textContent} in Gachapon Globe!`;
  navigator.clipboard?.writeText(text);
  shareFake.textContent = "Copied!";
  setTimeout(() => (shareFake.textContent = "Share"), 900);
});

// ===== INVENTORY DRAWER =====
inventoryToggle.addEventListener("click", openDrawer);
drawerClose.addEventListener("click", closeDrawer);
overlay.addEventListener("click", closeDrawer);

// ===== FILTER CHIPS =====
document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderInventory();
  });
});

// initial render
renderHud();
renderInventory();
