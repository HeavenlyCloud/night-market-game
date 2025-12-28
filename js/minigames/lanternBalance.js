import { getState, update } from "../core/state.js";

export function lanternBalanceView(){
  return `
    <div class="card">
      <div class="cardTop">
        <div class="row">
          <div class="bigIcon">🏮</div>
          <div>
            <div style="font-weight:1000">Lantern Balance</div>
            <div class="muted">Simple skill game. Reward scales with score.</div>
          </div>
        </div>
        <button class="pill" onclick="alert('Prototype UI. Next step: implement playfield + score loop like your MVP version.')">Play</button>
      </div>
      <div style="height:12px"></div>
      <div class="muted">Best: (coming from save) • Rewards: coins + chance capsule</div>
    </div>
  `;
}
