export function foodStallView(){
  return `
    <div class="card">
      <div class="cardTop">
        <div class="row">
          <div class="bigIcon">🍢</div>
          <div>
            <div style="font-weight:1000">Food Stall Serving</div>
            <div class="muted">Match orders fast. More combos = better rewards.</div>
          </div>
        </div>
        <button class="pill" onclick="alert('Prototype UI. Next step: implement order queue + timer.')">Play</button>
      </div>
      <div style="height:12px"></div>
      <div class="muted">Orders: bubble tea / stinky tofu / rice ball</div>
    </div>
  `;
}
