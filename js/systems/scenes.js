import { getState, update } from "../core/state.js";
import { SCENES } from "../data/scenes.js";

export function setActiveRegion(regionId){
  update(s=>{ s.meta.activeRegionId = regionId; });
}

export function isSceneUnlocked(scene){
  const s = getState();
  if (s.unlocks.scenes[scene.id]) return true;

  const rule = scene.unlockRule;
  if (!rule) return true;

  if (rule.type === "towerLevel") return s.tower.level >= rule.value;

  if (rule.type === "ownedItem"){
    const count = s.collection.owned[rule.itemId] || 0;
    return count >= (rule.count ?? 1);
  }
  return false;
}

export function unlockScene(sceneId){
  update(s=>{ s.unlocks.scenes[sceneId] = true; });
}

export function listScenesForActiveRegion(){
  const s = getState();
  return SCENES.filter(sc => sc.region === s.meta.activeRegionId);
}
