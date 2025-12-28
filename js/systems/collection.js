import { update, getState } from "../core/state.js";
import { ITEMS } from "../data/items.js";

export function addItem(itemId){
  const item = ITEMS.find(i=>i.id===itemId);
  if (!item) return;

  update(s=>{
    s.collection.owned[itemId] = (s.collection.owned[itemId] || 0) + 1;
    s.collection.discovered[itemId] = true;

    // Tower XP: duplicates still help but less
    const count = s.collection.owned[itemId];
    const xpGain = count === 1 ? rarityXp(item.rarity) : Math.max(1, Math.floor(rarityXp(item.rarity) * 0.35));
    s.tower.xp += xpGain;
  });
}

export function totalOwnedCount(){
  const s = getState();
  return Object.values(s.collection.owned).reduce((a,b)=>a+b,0);
}

export function rarityXp(r){
  if (r==="Ultra") return 12;
  if (r==="Mythic") return 7;
  if (r==="Rare") return 4;
  return 2;
}
