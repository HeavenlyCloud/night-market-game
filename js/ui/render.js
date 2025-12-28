// js/ui/render.js

import { getRoute, routeTo } from "../core/router.js";
import { getState, update } from "../core/state.js";
import { saveNow } from "../core/storage.js";

import { panel, rarityTag } from "./templates.js";
import { pullOnce, multiPull } from "../systems/gacha.js";
import { getTowerView } from "../systems/tower.js";
import { ITEMS } from "../data/items.js";
import { listScenesForActiveRegion, isSceneUnlocked } from "../systems/scenes.js";
import { COSMETICS } from "../data/cosmetics.js";
import { canBuy, buyCosmetic } from "../systems/shop.js";
import { minigameManagerView } from "../minigames/minigameManager.js";

// ✅ Timing bar system (STOP the needle)
import {
  startTimingBar,
  stopTimingBar,
  setSlowMo,
  getStopResult
} from "../systems/timingBar.js";

export function render() {
  const s = getState();
  const view = document.getElementById("view");

  // Top HUD
  document.getElementById("coins").textContent = String(s.currencies.coins);
  document.getElementById("towerLevel").textContent = String(s.tower.level);
  document.getElementById("regionBadge").textContent = `Region: ${cap(s.meta.activeRegionId)}`;
  document.getElementById("streakBadge").textContent = `Streak: ${s.meta.streak ?? 0}`;

  // Tabs
  const route = getRoute();
  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("active", b.dataset.route === route);
  });

  // Render view
  if (route === "machine") view.innerHTML = renderMachine();
  else if (route === "collection") view.innerHTML = renderCollection();
  else if (route === "scenes") view.innerHTML = renderScenes();
  else if (route === "minigames") view.innerHTML = minigameManagerView();
  else if (route === "shop") view.innerHTML = renderShop();
  else if (route === "settings") view.innerHTML = renderSettings();
  else view.innerHTML = renderMachine();

  // Wire events for the new HTML
  wireEvents();

  // ✅ Start/stop the timing bar ONLY when on Machine screen
  if (route === "machine") {
    startTimingBar(() => ({
      needleEl: document.getElementById("needle"),
      containerEl: document.getElementById("bar-container"),
    }));
  } else {
    stopTimingBar();
  }
}

/* =========================
   MACHINE (STOP the needle)
========================= */

function renderMachine() {
  const tower = getTowerView();
  const s = getState();

  return panel(
    "Gacha Machine",
    "Stop the needle on Rare/Ultra zones for better pulls.",
    `
      <button class="pill" data-action="daily">Daily</button>
      <button class="pill" data-action="save">Save</button>
    `,
    `
      <div class="spread">
        <div>
          <div class="muted">Tower XP</div>
          <div style="font-weight:1000;font-size:18px">${tower.xpInLevel}/${tower.xpNeed}</div>
          <div class="muted" style="margin-top:6px">
            Pity: Mythic ${s.meta.pityMythic ?? 0} / Ultra ${s.meta.pityUltra ?? 0}
          </div>
        </div>

        <div class="row">
          <button class="pill" data-action="banner">Banner: Taiwan Standard</button>
        </div>
      </div>

      <div class="barWrap">
        <div class="skillLabel">
          <span>COMMON</span>
          <span>RARE</span>
          <span>ULTRA</span>
        </div>

        <div id="bar-container" class="barContainer" aria-label="timing bar">
          <div class="zone zone-common"></div>
          <div class="zone zone-rare"></div>
          <div class="zone zone-ultra"></div>
          <div id="needle" class="needle" aria-hidden="true"></div>
          <div class="shine" aria-hidden="true"></div>
        </div>

        <div class="row" style="margin-top:12px">
          <button class="cta small" id="stopBtn" data-action="stop">STOP</button>
          <button class="pill" data-action="pull10">Pull x10 (no skill)</button>
        </div>

        <p class="muted" style="margin:10px 0 0">
          Tip: hold STOP for slow-mo.
        </p>
      </div>

      <div style="height:12px"></div>

      <div class="card">
        <div class="cardTop">
          <div class="row">
            <div class="bigIcon">🫧</div>
            <div>
              <div style="font-weight:1000">Lumo</div>
              <div class="muted" id="tipLine">The Tower loves skilled pulls.</div>
            </div>
          </div>
          <button class="pill" data-action="gotoScenes">View Scenes</button>
        </div>

        <div style="height:12px"></div>
        <div id="lastPull" class="muted">No pull yet.</div>
      </div>
    `
  );
}

/* =========================
   COLLECTION
========================= */

function renderCollection() {
  const s = getState();
  const ownedEntries = Object.entries(s.collection.owned);
  const total = ownedEntries.reduce((a, [, c]) => a + c, 0);

  const cards = ownedEntries.map(([id, count]) => {
    const it = ITEMS.find(x => x.id === id);
    if (!it) return "";
    return `
      <div class="card">
        <div class="cardTop">
          <div class="row">
            <div class="bigIcon">${it.icon ?? "🎁"}</div>
            <div>
              <div style="font-weight:1000">${it.name}</div>
              <div class="muted">${it.desc}</div>
            </div>
          </div>
          ${rarityTag(it.rarity)}
        </div>
        <div style="height:10px"></div>
        <div class="spread">
          <div class="muted">Owned</div>
          <div style="font-weight:1000">${count}</div>
        </div>
      </div>
    `;
  }).join("");

  return panel(
    "Collection Book",
    `Total items owned: ${total}. Duplicates give less Tower XP but still help.`,
    `<button class="pill" data-action="gotoMachine">Back to Machine</button>`,
    `<div class="grid">${cards || `<div class="muted">Pull capsules to start collecting.</div>`}</div>`
  );
}

/* =========================
   SCENES
========================= */

function renderScenes() {
  const scenes = listScenesForActiveRegion();

  const cards = scenes.map(sc => {
    const unlocked = isSceneUnlocked(sc);
    const label = unlocked ? "UNLOCKED" : "LOCKED";
    const tagCls = unlocked ? "rare" : "common";

    return `
      <div class="card">
        <div class="cardTop">
          <div class="row">
            <div class="bigIcon">
              ${sc.theme === "taipei" ? "🏙️" : sc.theme === "jiufen" ? "🏮" : sc.theme === "taroko" ? "🪨" : "🗺️"}
            </div>
            <div>
              <div style="font-weight:1000">${sc.title}</div>
              <div class="muted">${sc.desc}</div>
            </div>
          </div>
          <span class="tag ${tagCls}">${label}</span>
        </div>
        <div style="height:12px"></div>
        <div class="row">
          <button class="pill" data-action="sceneHotspot" data-scene="${sc.id}" ${unlocked ? "" : "disabled"}>Tap Hotspot</button>
          <button class="pill" data-action="sceneOpen" data-scene="${sc.id}" ${unlocked ? "" : "disabled"}>Open</button>
        </div>
      </div>
    `;
  }).join("");

  return panel(
    "Scenes",
    "Visual-first postcards with light interaction. Unlock via tower levels and key items.",
    `<button class="pill" data-action="gotoMachine">Machine</button>`,
    `<div class="grid">${cards}</div>`
  );
}

/* =========================
   SHOP
========================= */

function renderShop() {
  const s = getState();

  const cards = COSMETICS.map(c => {
    const owned = !!s.unlocks.cosmetics[c.id];
    const btn = owned
      ? `<button class="pill" disabled>Owned</button>`
      : `<button class="pill" data-action="buy" data-id="${c.id}" ${canBuy(c.id) ? "" : "disabled"}>Buy</button>`;

    return `
      <div class="card">
        <div class="cardTop">
          <div class="row">
            <div class="bigIcon">${c.icon}</div>
            <div>
              <div style="font-weight:1000">${c.name}</div>
              <div class="muted">${c.desc}</div>
            </div>
          </div>
          <span class="tag rare">${c.cost}c</span>
        </div>
        <div style="height:12px"></div>
        <div class="row">${btn}</div>
      </div>
    `;
  }).join("");

  return panel(
    "Shop (Ethical)",
    "Coins only. Cosmetic-only. No forced ads.",
    `<span class="muted">Balance: <b>${s.currencies.coins}</b> coins</span>`,
    `<div class="grid">${cards}</div>`
  );
}

/* =========================
   SETTINGS
========================= */

function renderSettings() {
  const s = getState();
  return panel(
    "Settings",
    "Audio + Save controls.",
    `<button class="pill" data-action="gotoMachine">Machine</button>`,
    `
      <div class="card">
        <div class="spread">
          <div>
            <div style="font-weight:1000">Music</div>
            <div class="muted">Scene ambience (add audio files later)</div>
          </div>
          <button class="pill" data-action="toggleMusic">${s.meta.musicOn ? "ON" : "OFF"}</button>
        </div>

        <div style="height:10px"></div>

        <div class="spread">
          <div>
            <div style="font-weight:1000">SFX</div>
            <div class="muted">Clicks / rarity chimes</div>
          </div>
          <button class="pill" data-action="toggleSfx">${s.meta.sfxOn ? "ON" : "OFF"}</button>
        </div>

        <div style="height:14px"></div>

        <div class="row">
          <button class="pill" data-action="save">Save Now</button>
          <button class="pill" data-action="wipe">Wipe Save</button>
        </div>
      </div>
    `
  );
}

/* =========================
   EVENTS
========================= */

function wireEvents() {
  const view = document.getElementById("view");

  // Slow-mo on HOLD for STOP (only exists on machine route)
  const stopBtn = view.querySelector("#stopBtn");
  if (stopBtn) {
    const down = () => setSlowMo(true);
    const up = () => setSlowMo(false);

    stopBtn.addEventListener("mousedown", down);
    stopBtn.addEventListener("mouseup", up);
    stopBtn.addEventListener("mouseleave", up);

    stopBtn.addEventListener("touchstart", down, { passive: true });
    stopBtn.addEventListener("touchend", up, { passive: true });
  }

  view.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", () => {
      const a = el.dataset.action;

      if (a === "gotoMachine") return routeTo("machine");
      if (a === "gotoScenes") return routeTo("scenes");

      // ✅ STOP (skill pull)
      if (a === "stop") {
        const result = getStopResult(() => ({
          needleEl: document.getElementById("needle"),
          containerEl: document.getElementById("bar-container"),
        }));

        const res = pullWithSkillTier(result.tier);

        setLumo(`You hit ${result.tier}! Pulled ${res.rarity} (+${res.coins}c)`);
        updateLastPull(res);

        // re-render to refresh HUD + keep everything consistent
        render();
        return;
      }

      // x10 (no skill)
      if (a === "pull10") {
        const res = multiPull(10);
        const ultra = res.filter(x => x.rarity === "Ultra").length;
        const myth = res.filter(x => x.rarity === "Mythic").length;
        const rare = res.filter(x => x.rarity === "Rare").length;
        const coins = res.reduce((sum, x) => sum + x.coins, 0);

        setLumo(`x10 done! +${coins} coins (Ultra:${ultra} Mythic:${myth} Rare:${rare})`);
        updateLastPull(res[res.length - 1]);
        render();
        return;
      }

      if (a === "sceneHotspot") {
        doHotspot(el.dataset.scene);
        return;
      }

      if (a === "sceneOpen") {
        alert(`Scene opened: ${el.dataset.scene}\n\n(Next step: full scene viewer screen with art + hotspots.)`);
        return;
      }

      if (a === "buy") {
        const out = buyCosmetic(el.dataset.id);
        setLumo(out.ok ? "Purchased cosmetic!" : `Can't buy: ${out.reason}`);
        render();
        return;
      }

      if (a === "toggleMusic") {
        update(s => { s.meta.musicOn = !s.meta.musicOn; });
        render();
        return;
      }

      if (a === "toggleSfx") {
        update(s => { s.meta.sfxOn = !s.meta.sfxOn; });
        render();
        return;
      }

      if (a === "save") {
        saveNow(getState());
        setLumo("Saved.");
        return;
      }

      if (a === "wipe") {
        if (confirm("Wipe save? This deletes all progress.")) {
          localStorage.clear();
          location.reload();
        }
        return;
      }

      if (a === "daily") {
        claimDaily();
        render();
        return;
      }

      if (a === "banner") {
        alert("Banner selection UI is next. For now it's Taiwan Standard.");
        return;
      }
    });
  });
}

/* =========================
   SKILL → GACHA
   (keeps gacha spirit; skill nudges outcome)
========================= */

function pullWithSkillTier(tier) {
  // Common: normal pull
  if (tier === "Common") {
    return pullOnce("taiwan_standard");
  }

  // Rare tier: guarantee at least Rare (without breaking economy)
  if (tier === "Rare") {
    for (let i = 0; i < 6; i++) {
      const t = pullOnce("taiwan_standard");
      if (t.rarity !== "Common") return t;
    }
    // fallback
    return pullOnce("taiwan_standard");
  }

  // Ultra tier: push toward Mythic+ (Ultra still rare)
  for (let i = 0; i < 8; i++) {
    const t = pullOnce("taiwan_standard");
    if (t.rarity === "Ultra" || t.rarity === "Mythic") return t;
  }
  return pullOnce("taiwan_standard");
}

/* =========================
   SCENE HOTSPOT / DAILY / HUD text
========================= */

function doHotspot(sceneId) {
  const scenes = listScenesForActiveRegion();
  const sc = scenes.find(x => x.id === sceneId);
  if (!sc) return;

  if (!isSceneUnlocked(sc)) {
    setLumo("That scene is locked.");
    return;
  }

  const h = sc.hotspots[Math.floor(Math.random() * sc.hotspots.length)];
  update(st => { st.currencies.coins += (h.coins ?? 5); });
  setLumo(h.text);
  render();
}

function claimDaily() {
  const s = getState();
  const key = todayKey();

  if (s.meta.lastDailyKey === key) {
    setLumo("Daily already claimed today.");
    return;
  }

  const last = s.meta.lastDailyKey ? new Date(s.meta.lastDailyKey) : null;
  const now = new Date(key);
  const diffDays = last ? Math.round((now - last) / (1000 * 60 * 60 * 24)) : 999;

  update(st => {
    st.meta.streak = (diffDays === 1) ? (st.meta.streak + 1) : 1;
    st.meta.lastDailyKey = key;
    const reward = 30 + Math.min(120, st.meta.streak * 12);
    st.currencies.coins += reward;
  });

  setLumo(`Daily claimed! Streak ${getState().meta.streak} 🔥`);
}

function updateLastPull(res) {
  const el = document.getElementById("lastPull");
  if (!el) return;
  el.textContent = `Last pull: ${res.rarity} (+${res.coins}c) — check Collection for what you got.`;
}

function setLumo(text) {
  const l = document.getElementById("lumoLine");
  if (l) l.textContent = text;
}

function todayKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function cap(id) {
  return id ? id.charAt(0).toUpperCase() + id.slice(1) : "";
}
