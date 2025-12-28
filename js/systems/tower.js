import { update, getState } from "../core/state.js";

export function recomputeTower(){
  update(s=>{
    // level curve: each level needs more XP
    // L1->2: 20 xp, L2->3: 35 xp, then +20 each level
    let lvl = 1;
    let xp = s.tower.xp;
    let need = 20;

    while (xp >= need){
      xp -= need;
      lvl += 1;
      need = 35 + (lvl-3)*20;
      need = Math.max(35, need);
    }
    s.tower.level = lvl;
    s.tower._xpInLevel = xp;
    s.tower._xpNeed = need;
  });
}

export function getTowerView(){
  const s = getState();
  return {
    level: s.tower.level,
    xpInLevel: s.tower._xpInLevel ?? 0,
    xpNeed: s.tower._xpNeed ?? 20
  };
}
