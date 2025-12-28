import { createInitialState, getState, setState } from "./core/state.js";
import { loadSave, saveNow, wipeSave } from "./core/storage.js";
import { routerInit, routeTo } from "./core/router.js";
import { audioInit } from "./core/audio.js";
import { render } from "./ui/render.js";

import { REGIONS } from "./data/regions.js";
import { setActiveRegion } from "./systems/scenes.js";

// Boot
(function init(){
  const loaded = loadSave();
  const state = loaded ?? createInitialState();
  setState(state);

  audioInit();
  routerInit();
  render();

  // Default region: Taiwan
  if (!getState().meta.activeRegionId) {
    setActiveRegion("taiwan");
  }

  // Tabs
  document.querySelectorAll(".tab").forEach(btn=>{
    btn.addEventListener("click", ()=> routeTo(btn.dataset.route));
  });

  // Save on unload
  window.addEventListener("beforeunload", ()=> saveNow(getState()));

  // Dev helpers (optional)
  window.gg = {
    getState,
    wipe: ()=> { wipeSave(); location.reload(); },
    region: (id)=> { if (REGIONS[id]) { setActiveRegion(id); render(); } }
  };
})();
