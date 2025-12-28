let _state = null;

export function createInitialState(){
  return {
    version: 1,
    meta: {
      playerName: "Collector",
      activeRegionId: "taiwan",
      lastDailyKey: null,
      streak: 0,
      pity: 0,
      musicOn: true,
      sfxOn: true
    },
    currencies: { coins: 0 },
    tower: { level: 1, xp: 0 },
    collection: {
      owned: {},     // itemId -> count
      discovered: {} // itemId -> true
    },
    unlocks: {
      regions: { taiwan: true }, // future
      scenes: {},                // sceneId -> true
      cosmetics: {}              // cosmeticId -> true
    }
  };
}

export function getState(){ return _state; }
export function setState(s){ _state = s; }
export function update(mutator){
  const s = structuredClone(_state);
  mutator(s);
  _state = s;
}
