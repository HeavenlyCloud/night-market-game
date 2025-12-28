import { getState, update } from "../core/state.js";
import { COSMETICS } from "../data/cosmetics.js";

export function canBuy(id){
  const s = getState();
  const c = COSMETICS.find(x=>x.id===id);
  if (!c) return false;
  if (s.unlocks.cosmetics[id]) return false;
  return s.currencies.coins >= c.cost;
}

export function buyCosmetic(id){
  const c = COSMETICS.find(x=>x.id===id);
  if (!c) return { ok:false, reason:"Missing" };
  const s = getState();
  if (s.unlocks.cosmetics[id]) return { ok:false, reason:"Owned" };
  if (s.currencies.coins < c.cost) return { ok:false, reason:"Not enough coins" };

  update(st=>{
    st.currencies.coins -= c.cost;
    st.unlocks.cosmetics[id] = true;
  });
  return { ok:true };
}
