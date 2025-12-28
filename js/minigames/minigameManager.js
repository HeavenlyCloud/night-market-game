import { panel } from "../ui/templates.js";
import { lanternBalanceView } from "./lanternBalance.js";
import { foodStallView } from "./foodStallServing.js";

export function minigameManagerView(){
  return panel(
    "Mini-Games",
    "Replayable games that reward coins + capsule chances.",
    ``,
    `
      <div class="grid">
        ${lanternBalanceView()}
        ${foodStallView()}
      </div>
    `
  );
}
