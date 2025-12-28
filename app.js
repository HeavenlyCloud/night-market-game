// LOADING SCREEN CONTROL
window.addEventListener("load", () => {
  const l = document.getElementById("loadingScreen");
  if (!l) return;
  setTimeout(() => l.classList.add("hide"), 1200);
});


(() => {
  const D = window.GG_DATA;
  if (!D) { alert("data.js not loaded"); return; }

  // =========================
  // Save / State
  // =========================
  const SAVE_KEY = "gg_v1_save";
  const defaultState = () => ({
    version: 1,
    route: "machine",
    meta: {
      activeRegionId: "taiwan",
      lastDailyKey: null,
      streak: 0,
      musicOn: true,
      sfxOn: true,
      pityMythic: 0,
      pityUltra: 0,
      activeCosmeticIds: [],
      ownedCosmetics: {}
    },
    currencies: { coins: 0 },
    tower: { xp: 0, level: 1 },
    collection: { owned: {} }, // itemId -> count
    unlocks: { scenes: {} },
    minigame: { best: 0 }
  });

  let S = loadSave() ?? defaultState();
  normalizeState();

  // =========================
  // SFX (safe init - AFTER S exists)
  // =========================
  const SFX = {
    click: new Audio("sounds/click_001.ogg"),
    stop: new Audio("sounds/confirmation_001.ogg"),
    drop: new Audio("sounds/impactSoft_heavy_002.ogg"),
    rare: new Audio("sounds/notification_004.ogg"),
  };

  function playSfx(name) {
    if (!S?.meta?.sfxOn) return;
    const s = SFX[name];
    if (!s) return;
    try {
      s.currentTime = 0;
      s.play().catch(() => { });
    } catch { }
  }


  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
  }
  function saveNow() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch { }
  }
  function wipeSave() {
    localStorage.removeItem(SAVE_KEY);
    S = defaultState();
    normalizeState();
    render();
  }
  function normalizeState() {
    const def = defaultState();
    S.meta ??= def.meta;
    S.currencies ??= { coins: 0 };
    S.tower ??= { xp: 0, level: 1 };
    S.collection ??= { owned: {} };
    S.collection.owned ??= {};
    S.unlocks ??= { scenes: {} };
    S.unlocks.scenes ??= {};
    S.minigame ??= { best: 0 };
    S.meta.ownedCosmetics ??= {};
    S.meta.activeCosmetics ??= {};
    recomputeTower();
  }

  function hasCosmetic(id) {
    return !!S.meta?.ownedCosmetics?.[id];
  }

  function applyCosmetics() {
    // Apply CSS toggles
    document.body.classList.toggle("themeNight", hasCosmetic("theme_night"));
    document.body.classList.toggle("trailSparkle", hasCosmetic("trail_sparkle"));
    document.body.classList.toggle("skinRibbon", hasCosmetic("skin_ribbon"));
    document.body.classList.toggle("themeSunrise", hasCosmetic("theme_sunrise"));
    document.body.classList.toggle("uiGlassPlus", hasCosmetic("ui_glassplus"));
    document.body.classList.toggle("sfxChimes", hasCosmetic("sfx_chimes"));
    document.body.classList.toggle("confettiBoost", hasCosmetic("confetti_boost"));
    document.body.classList.toggle("capsuleGlow", hasCosmetic("capsule_window_fx"));
  const b = document.body;
  b.classList.toggle("themeNight", !!S.meta.activeCosmetics["theme_night"]);
  b.classList.toggle("trailSparkle", !!S.meta.activeCosmetics["trail_sparkle"]);
  b.classList.toggle("skinRibbon", !!S.meta.activeCosmetics["skin_ribbon"]);
  b.classList.toggle("themeSunrise", !!S.meta.activeCosmetics["theme_sunrise"]);


  }

  S.minigame.tapBest ??= 0;

  let tapRunning = false, tapScore = 0, tapTime = 8, tapTimer = null, tapSpawn = null, tapReward = null;

  function tapReset() {
    tapRunning = false; tapScore = 0; tapTime = 8; tapReward = null;
    if (tapTimer) clearInterval(tapTimer);
    if (tapSpawn) clearInterval(tapSpawn);
    tapTimer = null; tapSpawn = null;
  }

  function tapStart() {
    tapReset();
    tapRunning = true;
    const field = document.getElementById("tapField");
    if (!field) return;
    field.innerHTML = "";
    document.getElementById("tapClaim").disabled = true;
    document.getElementById("tapReward").textContent = "—";
    document.getElementById("tapScore").textContent = "0";
    document.getElementById("tapTime").textContent = String(tapTime);

    // spawn lanterns
    tapSpawn = setInterval(() => {
      if (!tapRunning) return;
      const el = document.createElement("button");
      el.className = "tapLantern";
      el.textContent = "🏮";
      el.style.left = Math.random() * 90 + "%";
      el.style.top = Math.random() * 80 + "%";
      el.onclick = () => {
        tapScore++;
        document.getElementById("tapScore").textContent = String(tapScore);
        el.remove();
      };
      field.appendChild(el);
      setTimeout(() => el.remove(), 700);
    }, 220);

    // timer
    tapTimer = setInterval(() => {
      tapTime--;
      document.getElementById("tapTime").textContent = String(tapTime);
      if (tapTime <= 0) tapEnd();
    }, 1000);
  }

  function tapEnd() {
    tapRunning = false;
    if (tapTimer) clearInterval(tapTimer);
    if (tapSpawn) clearInterval(tapSpawn);

    const coins = 20 + tapScore * 2;
    const capsuleChance = Math.min(0.45, tapScore / 40);
    const gotCapsule = Math.random() < capsuleChance;
    tapReward = { coins, gotCapsule };

    S.minigame.tapBest = Math.max(S.minigame.tapBest || 0, tapScore);
    saveNow();

    document.getElementById("tapReward").textContent = gotCapsule ? `+${coins}c + Capsule!` : `+${coins}c`;
    document.getElementById("tapClaim").disabled = false;
  }

  function tapClaim() {
    if (!tapReward) return;
    S.currencies.coins += tapReward.coins;

    if (tapReward.gotCapsule) {
      const res = pullOnce("Rare");
      setLumo(`Lantern Rush capsule: ${getItem(res.itemId).name} (${res.rarity}) +${res.coins}c`);
    } else {
      setLumo(`Lantern Rush reward: +${tapReward.coins} coins!`);
    }

    saveNow();
    renderHud();
    document.getElementById("tapClaim").disabled = true;
  }



  // =========================
  // DOM helpers
  // =========================
  const $ = (sel) => document.querySelector(sel);
  const view = $("#view");
  const overlay = $("#overlay");
  const modal = $("#modal");
  const fx = $("#fx");
  const fxCtx = fx.getContext("2d");

  function safeText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function setLumo(text) { safeText("#lumoLine", text); }
  function cap(id) { return id ? id.charAt(0).toUpperCase() + id.slice(1) : ""; }
  function todayKey() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function rarityClass(r) {
    return r === "Ultra" ? "ultra" : r === "Mythic" ? "mythic" : r === "Rare" ? "rare" : "common";
  }
  function rarityTag(r) {
    const cls = rarityClass(r);
    return `<span class="tag ${cls}">${r.toUpperCase()}</span>`;
  }
  function coinRewardForRarity(r) {
    if (r === "Ultra") return 60;
    if (r === "Mythic") return 35;
    if (r === "Rare") return 15;
    return 6;
  }
  function rarityXp(r) {
    if (r === "Ultra") return 12;
    if (r === "Mythic") return 7;
    if (r === "Rare") return 4;
    return 2;
  }
  function getItem(id) { return D.items.find(x => x.id === id); }

  // =========================
  // Tower
  // =========================
  function recomputeTower() {
    let lvl = 1;
    let xp = S.tower.xp;
    let need = 20;

    while (xp >= need) {
      xp -= need;
      lvl += 1;
      need = 35 + (lvl - 3) * 20;
      need = Math.max(35, need);
    }
    S.tower.level = lvl;
    S.tower._xpInLevel = xp;
    S.tower._xpNeed = need;
  }

  // =========================
  // Scenes Unlock
  // =========================
  function isSceneUnlocked(sc) {
    if (S.unlocks.scenes[sc.id]) return true;
    const u = sc.unlock;
    if (!u) return true;
    if (u.type === "towerLevel") return S.tower.level >= u.value;
    if (u.type === "ownedItem") {
      const have = S.collection.owned[u.itemId] || 0;
      return have >= (u.count ?? 1);
    }
    return false;
  }

  // =========================
  // Routing
  // =========================
  function routeTo(route) {
    if (S.route === "minigame" && route !== "minigame" && mgRunning) mgEnd(false);
    S.route = route;
    render();
  }

  // =========================
  // Confetti FX
  // =========================
  function resizeFx() {
    fx.width = window.innerWidth;
    fx.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeFx);
  resizeFx();

  let confetti = [];
  function launchConfetti() {
    confetti = [];
    const count = hasCosmetic("confetti_boost") ? 220 : 140;
    for (let i = 0; i < count; i++) {
      confetti.push({
        x: window.innerWidth / 2,
        y: 150,
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
    if (!confetti.length) return;
    fxCtx.clearRect(0, 0, fx.width, fx.height);
    confetti.forEach(p => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.a -= 0.012;
      fxCtx.globalAlpha = Math.max(0, Math.min(1, p.a));
      fxCtx.fillRect(p.x, p.y, p.s, p.s);
    });
    confetti = confetti.filter(p => p.a > 0 && p.y < window.innerHeight + 40);
    requestAnimationFrame(animateConfetti);
  }

  // =========================
  // Timing Bar (STOP needle)
  // =========================
  let barRaf = null;
  let barRunning = false;
  let barPos = 0;
  let barDir = 1;
  // let barSpeed = 4.0;

  function getBarSpeed() {
    // harder as tower grows
    return 3.8 + Math.min(3.5, S.tower.level * 0.35);
  }

  let barSlow = false;

  function startBar() {
    stopBar();
    const needle = $("#needle");
    const cont = $("#bar-container");
    if (!needle || !cont) return;

    barRunning = true;
    barPos = 0;
    barDir = 1;
    let barSpeed = getBarSpeed();
    const ultraZone = document.querySelector(".zone-ultra");
    if (ultraZone) {
      const base = 7; // percent
      const shrink = Math.min(4, S.tower.level * 0.25);
      ultraZone.style.width = `${Math.max(2.5, base - shrink)}%`; // ✅ never negative
    }

    barSlow = false;

    const tick = () => {
      if (!barRunning) return;
      const maxPx = Math.max(1, cont.clientWidth - needle.clientWidth);
      const sp = (barSlow ? barSpeed * 0.35 : barSpeed) * barDir;

      barPos += sp;
      if (barPos <= 0) { barPos = 0; barDir = 1; }
      if (barPos >= maxPx) { barPos = maxPx; barDir = -1; }

      needle.style.left = `${barPos}px`;
      barRaf = requestAnimationFrame(tick);
    };

    barRaf = requestAnimationFrame(tick);
  }

  function stopBar() {
    barRunning = false;
    if (barRaf) cancelAnimationFrame(barRaf);
    barRaf = null;
  }

  function barTier() {
    const needle = $("#needle");
    const cont = $("#bar-container");
    if (!needle || !cont) return { tier: "Common", percent: 0 };

    const maxPx = Math.max(1, cont.clientWidth - needle.clientWidth);
    const percent = maxPx ? (barPos / maxPx) : 0;
    const p = percent * 100;

    // Common 0-55 | Rare 55-83 | Mythic 83-93 | Ultra 93-100
    let tier = "Common";
    if (p >= 93) tier = "Ultra";
    else if (p >= 83) tier = "Mythic";
    else if (p >= 55) tier = "Rare";

    return { tier, percent };
  }

  // =========================
  // Gacha Pull
  // =========================
  function rollFromRates(rates) {
    const r = Math.random();
    let acc = 0;
    for (const [rar, p] of Object.entries(rates)) {
      acc += p;
      if (r <= acc) return rar;
    }
    return "Common";
  }

  function pickItemByRarity(rarity) {
    let pool = D.items.filter(i => i.rarity === rarity);
    if (!pool.length) pool = D.items;

    const feat = D.banner.featured;
    if (feat?.itemIds?.length) {
      const boosted = pool.filter(i => feat.itemIds.includes(i.id));
      if (boosted.length && Math.random() < 0.35) pool = boosted;
    }
    return pool[Math.floor(Math.random() * pool.length)].id;
  }

  function applySkillToRates(skillTier) {
    const base = D.banner.baseRates;
    const out = { ...base };

    if (skillTier === "Rare") {
      out.Rare += 0.05; out.Common -= 0.05;
    } else if (skillTier === "Mythic") {
      out.Mythic += 0.05; out.Common -= 0.05;
    } else if (skillTier === "Ultra") {
      out.Ultra += 0.015; out.Rare += 0.01; out.Common -= 0.025;
    }

    out.Common = Math.max(0.01, out.Common);
    const sum = Object.values(out).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(out)) out[k] = out[k] / sum;
    return out;
  }

  function pullOnce(skillTier = "Common") {
    S.meta.pityMythic = (S.meta.pityMythic ?? 0) + 1;
    S.meta.pityUltra = (S.meta.pityUltra ?? 0) + 1;

    let rates = applySkillToRates(skillTier);
    let rarity = rollFromRates(rates);

    if (S.meta.pityMythic >= D.banner.pity.mythicAt) {
      rarity = (rarity === "Ultra") ? "Ultra" : "Mythic";
      S.meta.pityMythic = 0;
    }
    if (S.meta.pityUltra >= D.banner.pity.ultraAt) {
      rarity = "Ultra";
      S.meta.pityUltra = 0;
    }

    if (rarity === "Ultra") { S.meta.pityUltra = 0; S.meta.pityMythic = 0; }
    else if (rarity === "Mythic") { S.meta.pityMythic = 0; }

    const itemId = pickItemByRarity(rarity);

    const coins = coinRewardForRarity(rarity);
    S.currencies.coins += coins;

    S.collection.owned[itemId] = (S.collection.owned[itemId] || 0) + 1;

    const count = S.collection.owned[itemId];
    const xpGain = count === 1 ? rarityXp(rarity) : Math.max(1, Math.floor(rarityXp(rarity) * 0.35));
    S.tower.xp += xpGain;
    recomputeTower();
    updateTowerVisual();

    saveNow();
    return { itemId, rarity, coins, skillTier };
  }

  function startCapsuleRoll() {
    const win = document.querySelector(".capsuleWindow");
    if (!win) return;

    win.innerHTML = `<div class="capsuleRoll">
    ${D.items.slice(0, 5).map(i => i.icon).join("")}
  </div>`;
  }

  function stopCapsuleRoll(finalIcon) {
    const win = document.querySelector(".capsuleWindow");
    if (!win) return;
    win.innerHTML = `<span>${finalIcon}</span>`;
  }


  // =========================
  // Daily Bonus
  // =========================
  function claimDaily() {
    const key = todayKey();
    if (S.meta.lastDailyKey === key) {
      setLumo("Daily already claimed today.");
      return;
    }

    const last = S.meta.lastDailyKey ? new Date(S.meta.lastDailyKey) : null;
    const now = new Date(key);
    const diffDays = last ? Math.round((now - last) / (1000 * 60 * 60 * 24)) : 999;

    S.meta.streak = (diffDays === 1) ? (S.meta.streak + 1) : 1;
    S.meta.lastDailyKey = key;

    const reward = 30 + Math.min(120, S.meta.streak * 12);
    S.currencies.coins += reward;
    saveNow();
    setLumo(`Daily claimed! +${reward} coins (Streak ${S.meta.streak}) 🔥`);
  }

  function updateTowerVisual() {
    const t = document.getElementById("towerBg");
    if (!t) return;
    t.style.height = `${60 + S.tower.level * 22}px`;
  }


  // =========================
  // Modal
  // =========================
  function openModal(html) {
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
    modal.innerHTML = html;
    overlay.onclick = closeModal;
  }
  function closeModal() {
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
    modal.innerHTML = "";
  }

  // =========================
  // GAME MOMENT: Capsule Reveal
  // =========================
  function openCapsuleReveal({ tier, res, it }) {
    const cls = rarityClass(res.rarity);
    openModal(`
      <div class="panel">
        <div class="panelHead">
          <div>
            <h2 class="h2">Capsule POP! ✨</h2>
            <p class="muted">You stopped in <b>${tier}</b> zone</p>
          </div>
          <div class="row">
            <button class="pill" id="closePop">Close</button>
          </div>
        </div>

        <div class="capsuleStage">
          <div class="aura ${cls}"></div>

          <div class="capsuleRow">
            <div class="capsuleArt">${it.icon ?? "🎁"}</div>

            <div class="itemCardCute ${hasCosmetic("skin_ribbon") ? "ribbonSkin" : ""}">
              <div class="row" style="justify-content:space-between">
                <div>
                  <p class="itemName">${it.name}</p>
                  <p class="itemDesc">${it.desc}</p>
                </div>
                ${rarityTag(res.rarity)}
              </div>

              <div style="height:10px"></div>
              <div class="spread">
                <div class="muted">Coins gained</div>
                <div style="font-weight:1000">+${res.coins}c</div>
              </div>

              <div style="height:14px"></div>
              <button class="cta small" id="collectPop">Collect</button>
            </div>
          </div>
        </div>
      </div>
    `);

    $("#closePop").onclick = closeModal;
    $("#collectPop").onclick = closeModal;

    const vibe = (rar) => rar === "Ultra" ? "ULTRA!! 🌟" :
      rar === "Mythic" ? "MYTHIC!! 💖" :
        rar === "Rare" ? "RARE!! 💜" : "Common ✨";
    setLumo(`${vibe(res.rarity)} ${it.name} (+${res.coins}c)`);

    if (res.rarity === "Ultra" || res.rarity === "Mythic") launchConfetti();
  }

  // =========================
  // Scene Viewer
  // =========================
  function sceneArtStyle(theme) {
    if (theme === "taipei") return `
      background:
        radial-gradient(220px 180px at 25% 25%, rgba(255,204,0,.12), transparent 70%),
        radial-gradient(240px 200px at 78% 20%, rgba(106,76,255,.22), transparent 70%),
        linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.24));
    `;
    if (theme === "jiufen") return `
      background:
        radial-gradient(220px 180px at 25% 25%, rgba(255,90,120,.14), transparent 70%),
        radial-gradient(240px 200px at 78% 20%, rgba(255,204,0,.14), transparent 70%),
        linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.24));
    `;
    return `
      background:
        radial-gradient(220px 180px at 25% 25%, rgba(0,200,255,.12), transparent 70%),
        radial-gradient(240px 200px at 78% 20%, rgba(106,76,255,.18), transparent 70%),
        linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.24));
    `;
  }

  function dropCapsule(icon = "🫧") {
    const m = document.querySelector(".gachaMachine");
    if (!m) return;

    const c = document.createElement("div");
    c.className = "capsuleDrop";
    c.textContent = icon;
    m.appendChild(c);

    playSfx("drop");

    setTimeout(() => c.remove(), 700);
  }


  function openSceneModal(sceneId) {
    const sc = D.scenes.find(x => x.id === sceneId);
    if (!sc) return;

    openModal(`
      <div class="panel">
        <div class="panelHead">
          <div>
            <h2 class="h2">${sc.title}</h2>
            <p class="muted">${sc.desc}</p>
          </div>
          <div class="row">
            <button class="pill" id="sceneHotspotBtn">Tap Hotspot</button>
            <button class="pill" id="closeModalBtn">Close</button>
          </div>
        </div>

        <div class="sceneArt" style="${sceneArtStyle(sc.theme)}"></div>

        <div class="sceneInfo">
          <div class="muted">Hotspots give small rewards and cozy flavor.</div>
        </div>
      </div>
    `);

    $("#closeModalBtn").onclick = closeModal;
    $("#sceneHotspotBtn").onclick = () => {
      const h = sc.hotspots[Math.floor(Math.random() * sc.hotspots.length)];
      S.currencies.coins += (h.coins ?? 5);
      saveNow();
      setLumo(h.text);
      renderHud();
    };
  }

  // =========================
  // Mini-game: Lantern Balance
  // =========================
  let mgRunning = false;
  let mgScore = 0;
  let mgX = 0;
  let mgV = 0;
  let mgTimer = null;
  let mgReward = null;

  function mgReset() {
    mgRunning = false;
    mgScore = 0;
    mgX = 0;
    mgV = 0;
    mgReward = null;
    if (mgTimer) clearInterval(mgTimer);
    mgTimer = null;
  }

  function mgStart() {
    if (mgRunning) return;
    mgReset();
    mgRunning = true;
    mgScore = 0;
    mgReward = null;

    const scoreEl = $("#mgScore");
    const rewardEl = $("#mgReward");
    const lantern = $("#mgLantern");
    const field = $("#mgField");
    if (!scoreEl || !rewardEl || !lantern || !field) return;

    rewardEl.textContent = "—";
    $("#mgClaim").disabled = true;

    mgTimer = setInterval(() => {
      const wind = (Math.random() - 0.5) * 0.9;
      mgV += wind;
      mgV *= 0.96;
      mgX += mgV;

      const halfW = (field.clientWidth / 2) - 20;
      mgX = Math.max(-halfW, Math.min(halfW, mgX));

      const safeHalf = 70;
      const inside = Math.abs(mgX) <= safeHalf;

      if (inside) mgScore += 1;
      else mgScore = Math.max(0, mgScore - 2);

      scoreEl.textContent = String(mgScore);
      lantern.style.transform = `translate(calc(-50% + ${mgX}px), -50%)`;

      if (mgScore >= 120) mgEnd(true);
    }, 50);
  }

  // --- QUICK MINIGAME FIX (robust + rebind-safe) ---
  function mgBind() {
    const startBtn = document.getElementById("mgStart");
    const claimBtn = document.getElementById("mgClaim");
    const field = document.getElementById("mgField");

    // if minigame UI isn't on screen, stop timers safely
    if (!startBtn || !claimBtn || !field) {
      if (typeof mgRunning !== "undefined" && mgRunning) mgEnd(false);
      return;
    }

    startBtn.onclick = mgStart;
    claimBtn.onclick = mgClaim;

    field.onmousemove = (e) => mgPointerMove(e.clientX);
    field.ontouchmove = (e) => {
      if (e.touches?.length) mgPointerMove(e.touches[0].clientX);
    };

    // Also: don't keep claim enabled from an old run
    if (!mgReward) claimBtn.disabled = true;
  }


  function mgEnd(success) {
    if (!mgRunning) return;
    mgRunning = false;
    if (mgTimer) clearInterval(mgTimer);

    const score = mgScore;
    const coins = Math.max(12, Math.round(score / 2));
    const capsuleChance = Math.max(0.06, Math.min(0.55, score / 220));
    const gotCapsule = Math.random() < capsuleChance;

    mgReward = { coins, gotCapsule };

    S.minigame.best = Math.max(S.minigame.best || 0, score);
    saveNow();

    safeText("#mgReward", gotCapsule ? `+${coins}c + Capsule!` : `+${coins}c`);
    const claim = $("#mgClaim");
    if (claim) claim.disabled = false;

    setLumo(success ? "Great balance! Claim your reward." : "Try again — keep it centered!");
  }

  function mgClaim() {
    if (!mgReward) return;

    S.currencies.coins += mgReward.coins;

    if (mgReward.gotCapsule) {
      const res = pullOnce("Rare");
      setLumo(`Mini-game capsule: ${getItem(res.itemId).name} (${res.rarity}) +${res.coins}c`);
      if (res.rarity === "Ultra") launchConfetti();
    }

    saveNow();
    renderHud();
    const claim = $("#mgClaim");
    if (claim) claim.disabled = true;
    setLumo(`Reward claimed! +${mgReward.coins} coins.`);
  }

  function mgPointerMove(clientX) {
    if (!mgRunning) return;
    const field = $("#mgField");
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const px = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const target = (px / rect.width - 0.5) * rect.width;
    const diff = (target - mgX) * 0.02;
    mgV += diff;
  }

  // =========================
  // UI Render helpers
  // =========================
  function renderHud() {
    safeText("#coins", String(S.currencies.coins));
    safeText("#towerLevel", String(S.tower.level));
    safeText("#regionBadge", `Region: ${cap(S.meta.activeRegionId)}`);
    safeText("#streakBadge", `Streak: ${S.meta.streak ?? 0}`);
  }

  function panel(title, subtitle, rightHtml, bodyHtml) {
    return `
      <div class="panel">
        <div class="panelHead">
          <div>
            <h2 class="h2">${title}</h2>
            <p class="muted">${subtitle ?? ""}</p>
          </div>
          <div class="row">${rightHtml ?? ""}</div>
        </div>
        ${bodyHtml ?? ""}
      </div>
    `;
  }

  // =========================
  // SCREENS
  // =========================
  function renderMachine() {
    // Focus: machine in center. Buttons aligned. STOP is main action.
    return `
      <div class="machineScreen">
      <div class="towerBg" id="towerBg"></div>
      <div class="machineRow">
        <div class="lumoSide">
        <div class="lumoFace lumoWiggle"></div>
      <div class="lumoText">Stop the needle at the right timing~ ✨</div>
      </div>  


        <div class="gachaMachine">
          <div class="machineTop">
            <div class="machineTitle">Gachapon Globe</div>
            <div class="machineSub">Taiwan Treasures</div>
          </div>

          <div class="capsuleWindow">
            <span>🫧</span><span>🫧</span><span>🫧</span>
          </div>

          <div class="machineBar">
            <div class="skillLabel">
              <span>Common</span>
              <span>Rare</span>
              <span>Mythic</span>
              <span>Ultra</span>
            </div>

            <div id="bar-container" class="barContainer">
              <div class="zone zone-common"></div>
              <div class="zone zone-rare"></div>
              <div class="zone zone-myth"></div>
              <div class="zone zone-ultra"></div>
              <div class="shine"></div>
              <div id="needle" class="needle"></div>
            </div>

            <button class="stopButton" id="stopBtn">STOP</button>

            <div class="machineMeta">
              <span class="tag common">Pity M: ${S.meta.pityMythic ?? 0}/${D.banner.pity.mythicAt}</span>
              <span class="tag rare">Pity U: ${S.meta.pityUltra ?? 0}/${D.banner.pity.ultraAt}</span>
            </div>
          </div>
        </div>

        <div class="machineActions">
          <button class="roundBtn" data-route="collection">📖 Collection</button>
          <button class="roundBtn glow" id="pull10Btn">✨ Pull x10</button>
          <button class="roundBtn" data-route="scenes">🏮 Scenes</button>
        </div>

      </div>
    `;
  }

  function renderCollection() {
    const entries = Object.entries(S.collection.owned);
    const total = entries.reduce((a, [, c]) => a + c, 0);

    const cards = entries
      .sort((a, b) => (b[1] - a[1]))
      .map(([id, count]) => {
        const it = getItem(id);
        if (!it) return "";

        return `
        <div class="collectItem ${rarityClass(it.rarity)}">
          <div class="collectGlow"></div>

          <div class="collectIcon">
            ${it.icon}
            ${count === 1 ? `<span class="newBadge">NEW</span>` : ``}
          </div>


          <div class="collectInfo">
            <div class="collectName">${it.name}</div>
            <div class="collectDesc">${it.desc}</div>
          </div>

          <div class="collectFooter">
            ${rarityTag(it.rarity)}
            <div class="collectCount">×${count}</div>
          </div>
        </div>
      `;
      }).join("");

    return panel(
      "Collection Book",
      `Memories collected: ${total} • duplicates still grow the Tower`,
      `<button class="pill" id="toMachineBtn">Back to Machine</button>`,
      `<div class="collectionGrid">${cards || `<div class="muted">Pull capsules to start collecting ✨</div>`}</div>`
    );
  }


  function renderScenes() {
    const cards = D.scenes.map(sc => {
      const unlocked = isSceneUnlocked(sc);
      const label = unlocked ? "UNLOCKED" : "LOCKED";
      const tagCls = unlocked ? "rare" : "common";
      const icon = sc.theme === "taipei" ? "🏙️" : sc.theme === "jiufen" ? "🏮" : "🪨";

      return `
        <div class="card">
          <div class="cardTop">
            <div class="row">
              <div class="bigIcon">${icon}</div>
              <div>
                <div style="font-weight:1000">${sc.title}</div>
                <div class="muted">${sc.desc}</div>
              </div>
            </div>
            <span class="tag ${tagCls}">${label}</span>
          </div>

          <div style="height:12px"></div>
          <div class="row">
            <button class="pill" data-scene-open="${sc.id}" ${unlocked ? "" : "disabled"}>Open</button>
            <button class="pill" data-scene-hot="${sc.id}" ${unlocked ? "" : "disabled"}>Hotspot</button>
          </div>
        </div>
      `;
    }).join("");

    return panel(
      "Scenes",
      "Postcard scenes with hotspots. Unlock by Tower level or key items.",
      `<button class="pill" id="toMachineBtn">Machine</button>`,
      `<div class="grid">${cards}</div>`
    );
  }

  function renderMinigame() {
    S.minigame.tapBest ??= 0;

    return panel(
      "Mini-Games",
      "Play cozy mini-games for coins + capsule chances.",
      `<span class="tag rare">Balance Best: ${S.minigame.best || 0}</span>
     <span class="tag mythic">Rush Best: ${S.minigame.tapBest || 0}</span>`,
      `
      <!-- MINI-GAME 1 -->
      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:1000; font-size:16px; margin-bottom:6px">🏮 Lantern Balance</div>
        <div class="muted" style="margin:0 0 10px">Keep the lantern inside the safe zone.</div>

        <div class="spread">
          <div class="row">
            <button class="cta small" id="mgStart">Start</button>
            <button class="pill" id="mgClaim" disabled>Claim</button>
            <button class="pill" id="mgHow">How</button>
          </div>
          <div class="row">
            <span class="tag common">Score: <b id="mgScore">0</b></span>
            <span class="tag rare">Reward: <b id="mgReward">—</b></span>
          </div>
        </div>

        <div style="height:12px"></div>

        <div class="mgPlayfield" id="mgField">
          <div class="mgSafeZone"></div>
          <div class="mgLantern" id="mgLantern">🏮</div>
        </div>

        <p class="muted">Move mouse/finger left-right inside the playfield.</p>
      </div>

      <!-- MINI-GAME 2 -->
      <div class="card">
        <div style="font-weight:1000; font-size:16px; margin-bottom:6px">✨ Lantern Rush</div>
        <div class="muted" style="margin:0 0 10px">Tap lanterns quickly before time runs out.</div>

        <div class="spread">
          <div class="row">
            <button class="cta small" id="tapStart">Start</button>
            <button class="pill" id="tapClaim" disabled>Claim</button>
          </div>
          <div class="row">
            <span class="tag common">Score: <b id="tapScore">0</b></span>
            <span class="tag rare">Time: <b id="tapTime">8</b>s</span>
            <span class="tag mythic">Reward: <b id="tapReward">—</b></span>
          </div>
        </div>

        <div style="height:12px"></div>

        <div class="tapField" id="tapField"></div>
        <p class="muted">Tap the lanterns as they appear.</p>
      </div>
    `
    );
  }


  function renderShop() {
    const cards = D.cosmetics.map(c => {
      const owned = !!S.meta.ownedCosmetics[c.id];
      const active = !!S.meta.activeCosmetics[c.id];
      const canBuy = (!owned && S.currencies.coins >= c.cost);

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

          ${owned
          ? `<span class="tag ${active ? "ultra" : "common"}">${active ? "ON" : "OFF"}</span>`
          : `<span class="tag rare">${c.cost}c</span>`
        }
        </div>

        <div style="height:12px"></div>

        <div class="row">
          <button class="pill"
            data-shop-action="${c.id}"
            ${owned ? "" : (canBuy ? "" : "disabled")}
          >
            ${owned
          ? (active ? "Disable" : "Enable")
          : (canBuy ? "Buy" : "Need coins")
        }
          </button>
        </div>
      </div>
    `;
    }).join("");

    return panel(
      "Shop (Toggle Cosmetics)",
      "Buy once, then toggle ON/OFF anytime.",
      `<span class="muted">Balance: <b>${S.currencies.coins}</b> coins</span>`,
      `<div class="grid">${cards}</div>`
    );
  }


  function renderSettings() {
    return panel(
      "Settings",
      "Save controls + toggles.",
      `
        <button class="pill" id="saveBtn">Save Now</button>
        <button class="pill" id="wipeBtn">Wipe Save</button>
      `,
      `
        <div class="card">
          <div class="spread">
            <div>
              <div style="font-weight:1000">Music</div>
              <div class="muted">Ambience (placeholder — add audio later)</div>
            </div>
            <button class="pill" id="musicBtn">${S.meta.musicOn ? "ON" : "OFF"}</button>
          </div>

          <div style="height:12px"></div>

          <div class="spread">
            <div>
              <div style="font-weight:1000">SFX</div>
              <div class="muted">Clicks / rarity chimes (placeholder)</div>
            </div>
            <button class="pill" id="sfxBtn">${S.meta.sfxOn ? "ON" : "OFF"}</button>
          </div>
        </div>
      `
    );
  }

  // =========================
  // Render & Wire
  // =========================
  function render() {
    renderHud();
    applyCosmetics();

    document.querySelectorAll(".tab").forEach(t => {
      t.classList.toggle("active", t.dataset.route === S.route);
    });

    if (S.route === "machine") view.innerHTML = renderMachine();
    else if (S.route === "collection") view.innerHTML = renderCollection();
    else if (S.route === "scenes") view.innerHTML = renderScenes();
    else if (S.route === "minigame") view.innerHTML = renderMinigame();
    else if (S.route === "shop") view.innerHTML = renderShop();
    else if (S.route === "settings") view.innerHTML = renderSettings();
    else view.innerHTML = renderMachine();

    applyCosmetics();
    wireView();
    mgBind();

    if (S.route === "machine") startBar(); else stopBar();
  }

  function applyCosmetics() {
    document.body.classList.toggle("themeNight", !!S.meta.activeCosmetics["theme_night"]);
  }


  function shakeMachine() {
    const m = document.querySelector(".gachaMachine");
    if (!m) return;
    m.classList.add("shake");
    setTimeout(() => m.classList.remove("shake"), 360);
  }


  function wireView() {
    // Global buttons that might exist
    const dailyBtn = $("#dailyBtn");
    if (dailyBtn) dailyBtn.onclick = () => { claimDaily(); renderHud(); };

    const saveBtn = $("#saveBtn");
    if (saveBtn) saveBtn.onclick = () => { saveNow(); setLumo("Saved."); };

    const toMachineBtn = $("#toMachineBtn");
    if (toMachineBtn) toMachineBtn.onclick = () => routeTo("machine");

    const wipeBtn = $("#wipeBtn");
    if (wipeBtn) wipeBtn.onclick = () => {
      if (confirm("Wipe save? This deletes all progress.")) wipeSave();
    };

    // IMPORTANT: wire machine bottom nav buttons
    document.querySelectorAll("[data-route]").forEach(btn => {
      btn.onclick = () => routeTo(btn.dataset.route);
    });

    const tapStartBtn = document.getElementById("tapStart");
    if (tapStartBtn) tapStartBtn.onclick = tapStart;

    const tapClaimBtn = document.getElementById("tapClaim");
    if (tapClaimBtn) tapClaimBtn.onclick = tapClaim;


    // Machine actions
    const stopBtn = $("#stopBtn");
    if (stopBtn) {
      const down = () => (barSlow = true);
      const up = () => (barSlow = false);

      stopBtn.addEventListener("mousedown", down);
      stopBtn.addEventListener("mouseup", up);
      stopBtn.addEventListener("mouseleave", up);
      stopBtn.addEventListener("touchstart", down, { passive: true });
      stopBtn.addEventListener("touchend", up, { passive: true });

      stopBtn.onclick = () => {
        shakeMachine();
        playSfx("stop");

        startCapsuleRoll();
        const { tier } = barTier();
        const win = document.querySelector(".capsuleWindow");
        if (win && hasCosmetic("capsule_window_fx")) win.classList.add("glow");
        setTimeout(() => win && win.classList.remove("glow"), 600);


        const res = pullOnce(tier);
        if (res.rarity === "Ultra" || res.rarity === "Mythic") {
          playSfx("rare");
        }

        const it = getItem(res.itemId);
        dropCapsule(it.icon);
        if (hasCosmetic("sfx_chimes") && (res.rarity === "Rare" || res.rarity === "Mythic" || res.rarity === "Ultra")) {
          playSfx("rare");
        }


        safeText("#lastPull", `You hit ${tier}! ${it.name} (${res.rarity}) +${res.coins}c`);
        renderHud();

        // THE GAME MOMENT
        openCapsuleReveal({ tier, res, it });
      };
    }

    const pull10Btn = $("#pull10Btn");
    if (pull10Btn) {
      pull10Btn.onclick = () => {
        let coins = 0, ultra = 0, myth = 0, rare = 0;
        for (let i = 0; i < 10; i++) {
          const r = pullOnce("Common");
          coins += r.coins;
          if (r.rarity === "Ultra") ultra++;
          else if (r.rarity === "Mythic") myth++;
          else if (r.rarity === "Rare") rare++;
        }
        renderHud();
        safeText("#lastPull", `x10 done: +${coins}c (Ultra:${ultra} Mythic:${myth} Rare:${rare})`);
        setLumo("x10 is fast — skill pulls feel magical.");
        if (ultra || myth) launchConfetti();
      };
    }

    // Scenes buttons
    document.querySelectorAll("[data-scene-open]").forEach(b => {
      b.onclick = () => openSceneModal(b.getAttribute("data-scene-open"));
    });
    document.querySelectorAll("[data-scene-hot]").forEach(b => {
      b.onclick = () => {
        const sc = D.scenes.find(x => x.id === b.getAttribute("data-scene-hot"));
        if (!sc) return;
        const h = sc.hotspots[Math.floor(Math.random() * sc.hotspots.length)];
        S.currencies.coins += (h.coins ?? 5);
        saveNow();
        setLumo(h.text);
        renderHud();
      };
    });

    function tapBind() {
      const startBtn = document.getElementById("tapStart");
      const claimBtn = document.getElementById("tapClaim");
      const field = document.getElementById("tapField");

      // If minigames screen isn't mounted, stop safely
      if (!startBtn || !claimBtn || !field) {
        if (tapRunning) tapReset();
        return;
      }

      startBtn.onclick = tapStart;
      claimBtn.onclick = tapClaim;

      if (!tapReward) claimBtn.disabled = true;
    }


    // Minigame

    function renderMinigameTap() {
      return panel(
        "Lantern Rush",
        "Tap lanterns quickly before time runs out!",
        `<span class="tag rare">Best: ${S.minigame.tapBest || 0}</span>`,
        `
      <div class="spread">
        <div class="row">
          <button class="cta small" id="tapStart">Start</button>
          <button class="pill" id="tapClaim" disabled>Claim</button>
        </div>
        <div class="row">
          <span class="tag common">Score: <b id="tapScore">0</b></span>
          <span class="tag rare">Time: <b id="tapTime">8</b>s</span>
          <span class="tag mythic">Reward: <b id="tapReward">—</b></span>
        </div>
      </div>

      <div style="height:12px"></div>

      <div class="tapField" id="tapField"></div>
      <p class="muted">Tap the lanterns as they appear.</p>
    `
      );
    }



    const mgHow = $("#mgHow");
    if (mgHow) mgHow.onclick = () => alert(
      "How to play:\n\nMove mouse/finger left-right in the field to keep the lantern inside the green zone.\nHigher score = higher reward + higher capsule chance."
    );

    // Shop
    document.querySelectorAll("[data-shop-action]").forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute("data-shop-action");
        const c = D.cosmetics.find(x => x.id === id);
        if (!c) return;

        const owned = !!S.meta.ownedCosmetics[id];

        // If not owned: BUY
        if (!owned) {
          if (S.currencies.coins < c.cost) return;
          S.currencies.coins -= c.cost;
          S.meta.ownedCosmetics[id] = true;
          S.meta.activeCosmetics[id] = true; // auto-enable after buying
          saveNow();
          setLumo(`Purchased + enabled: ${c.name}`);
          render();
          return;
        }

        // If owned: TOGGLE
        S.meta.activeCosmetics[id] = !S.meta.activeCosmetics[id];
        saveNow();
        setLumo(`${S.meta.activeCosmetics[id] ? "Enabled" : "Disabled"}: ${c.name}`);
        render();
      };
    });


    // Settings toggles
    const musicBtn = $("#musicBtn");
    if (musicBtn) musicBtn.onclick = () => {
      S.meta.musicOn = !S.meta.musicOn;
      saveNow();
      render();
    };

    const sfxBtn = $("#sfxBtn");
    if (sfxBtn) sfxBtn.onclick = () => {
      S.meta.sfxOn = !S.meta.sfxOn;
      saveNow();
      render();
    };
  }

  // Tabs navigation
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => routeTo(btn.dataset.route));
  });

  // Boot
  render();
  saveNow();
})();
