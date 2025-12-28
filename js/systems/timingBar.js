// js/systems/timingBar.js
// Controls the moving needle + returns a "rarity tier" based on where you stopped.

let rafId = null;
let running = false;

let pos = 0;
let dir = 1;
let baseSpeed = 4.0;
let slowMo = false;

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export function startTimingBar(getEls) {
  stopTimingBar();

  const { needleEl, containerEl } = getEls();
  if (!needleEl || !containerEl) return;

  running = true;
  pos = 0;
  dir = 1;
  baseSpeed = 4.0;
  slowMo = false;

  const tick = () => {
    if (!running) return;

    const maxPx = Math.max(1, containerEl.clientWidth - needleEl.clientWidth);
    const speed = (slowMo ? baseSpeed * 0.35 : baseSpeed) * dir;

    pos += speed;
    if (pos <= 0) { pos = 0; dir = 1; }
    if (pos >= maxPx) { pos = maxPx; dir = -1; }

    needleEl.style.left = `${pos}px`;
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
}

export function stopTimingBar() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

export function setSlowMo(v) { slowMo = !!v; }

export function getStopResult(getEls) {
  const { needleEl, containerEl } = getEls();
  if (!needleEl || !containerEl) return { percent: 0, tier: "Common" };

  const maxPx = Math.max(1, containerEl.clientWidth - needleEl.clientWidth);
  const percent = clamp(pos / maxPx, 0, 1);

  // Match your old feel:
  // Common: 0% - 55%
  // Rare:   55% - 85%
  // Ultra:  85% - 100%
  const p = percent * 100;
  let tier = "Common";
  if (p >= 85) tier = "Ultra";
  else if (p >= 55) tier = "Rare";

  return { percent, tier };
}
