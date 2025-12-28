import { getState, update } from "../core/state.js";
import { ITEMS } from "../data/items.js";
import { BANNERS } from "../data/banners.js";
import { addItem } from "./collection.js";
import { recomputeTower } from "./tower.js";

function rand(){ return Math.random(); }

function rollRarity(rates){
  const r = rand();
  let acc = 0;
  for (const [rar, p] of Object.entries(rates)){
    acc += p;
    if (r <= acc) return rar;
  }
  return "Common";
}

function pickItem(regionId, rarity, banner){
  let pool = ITEMS.filter(i => i.region === regionId && i.rarity === rarity);
  if (pool.length === 0) pool = ITEMS.filter(i => i.rarity === rarity);

  // featured boost
  if (banner?.featured?.itemIds?.length){
    const boosted = pool.filter(i => banner.featured.itemIds.includes(i.id));
    if (boosted.length && rand() < 0.35) {
      // 35% chance to pick from featured pool
      return boosted[Math.floor(rand()*boosted.length)].id;
    }
  }
  return pool[Math.floor(rand()*pool.length)].id;
}

export function pullOnce(bannerId="taiwan_standard"){
  const s = getState();
  const banner = BANNERS.find(b=>b.id===bannerId) ?? BANNERS[0];
  const regionId = s.meta.activeRegionId;

  // Track pity counters in meta
  let pityMythic = s.meta.pityMythic ?? 0;
  let pityUltra  = s.meta.pityUltra ?? 0;

  // Roll base rarity
  let rarity = rollRarity(banner.rates);

  // Pity logic: if too long without Mythic+, force Mythic
  pityMythic += 1;
  pityUltra  += 1;

  const hitMythicOrUltra = (rarity === "Mythic" || rarity === "Ultra");
  if (hitMythicOrUltra) pityMythic = 0;
  if (rarity === "Ultra") pityUltra = 0;

  if (banner.pity?.mythicAt && pityMythic >= banner.pity.mythicAt){
    rarity = "Mythic";
    pityMythic = 0;
  }
  if (banner.pity?.ultraAt && pityUltra >= banner.pity.ultraAt){
    rarity = "Ultra";
    pityUltra = 0;
  }

  // Pick item
  const itemId = pickItem(regionId, rarity, banner);

  // Currency reward per pull (ethical: always gives something)
  const coins = rarity === "Ultra" ? 60 : rarity === "Mythic" ? 35 : rarity === "Rare" ? 15 : 6;

  update(st=>{
    st.currencies.coins += coins;
    st.meta.pityMythic = pityMythic;
    st.meta.pityUltra  = pityUltra;
  });

  addItem(itemId);
  recomputeTower();

  return { itemId, rarity, coins, bannerId };
}

export function multiPull(n=10, bannerId="taiwan_standard"){
  const results = [];
  for (let i=0;i<n;i++) results.push(pullOnce(bannerId));
  return results;
}
