class Game {
  constructor() {
    const saved = Save.load();

    this.data = {
      coins: saved.coins || 100,
      gems: saved.gems || 10,
      inventory: saved.inventory || {},
      unlockedFloors: saved.unlockedFloors || 1
    };

    this.bindUI();
    this.updateUI();
    this.renderTower();
    ShopUI.render(this);
  }

  bindUI() {
    document.getElementById("pull-one").onclick = () => {
      if (this.data.gems < 1) return alert("Not enough gems");
      this.data.gems--;

      const item = Gacha.pullOne();
      this.addToInventory(item);
      this.showResults([item]);

      this.updateProgress();
      this.updateUI();
      Save.save(this.data);
    };

    document.getElementById("pull-ten").onclick = () => {
      if (this.data.gems < 10) return alert("Not enough gems");
      this.data.gems -= 10;

      const items = Gacha.pullTen();
      items.forEach(i => this.addToInventory(i));

      this.showResults(items);
      this.updateProgress();
      this.updateUI();
      Save.save(this.data);
    };
  }

  addToInventory(item) {
    if (!this.data.inventory[item.id]) this.data.inventory[item.id] = 0;
    this.data.inventory[item.id]++;
  }

  updateUI() {
    document.getElementById("coins").textContent = `Coins: ${this.data.coins}`;
    document.getElementById("gems").textContent = `Gems: ${this.data.gems}`;
    InventoryUI.render(this.data.inventory);
  }

  showResults(items) {
    const el = document.getElementById("results");
    el.innerHTML = items.map(i => i.name).join(", ");
  }

  updateProgress() {
    const totalItems = Object.values(this.data.inventory).reduce((a, b) => a + b, 0);

    TOWER_LEVELS.forEach(lvl => {
      if (totalItems >= lvl.requirement && this.data.unlockedFloors < lvl.id) {
        this.data.unlockedFloors = lvl.id;
        alert(`Unlocked: ${lvl.name}!`);
      }
    });

    this.renderTower();
  }

  renderTower() {
    const el = document.getElementById("tower");
    el.innerHTML = "";

    TOWER_LEVELS.forEach(lvl => {
      const d = document.createElement("div");
      d.className = "level";

      if (lvl.id <= this.data.unlockedFloors) {
        d.textContent = `✓ ${lvl.name}`;
      } else {
        d.textContent = `Locked — Need ${lvl.requirement} items`;
      }

      el.appendChild(d);
    });
  }
}

window.onload = () => new Game();

// inventory js 
window.InventoryUI = {
  render(inv) {
    const el = document.getElementById("inventory");
    el.innerHTML = "";

    Object.keys(inv).forEach(id => {
      const item = GAME_ITEMS.find(i => i.id === id);
      const count = inv[id];

      const d = document.createElement("div");
      d.className = "item";
      d.textContent = `${item.name} x${count}`;
      el.appendChild(d);
    });
  }
};

// items js
window.GAME_ITEMS = [
  {
    id: "bubble_tea",
    name: "Bubble Tea",
    rarity: "common"
  },
  {
    id: "pineapple_cake",
    name: "Pineapple Cake",
    rarity: "common"
  },
  {
    id: "red_lantern",
    name: "Red Lantern",
    rarity: "rare"
  },
  {
    id: "taiwan_map",
    name: "Taiwan Map",
    rarity: "rare"
  },
  {
    id: "lucky_charm",
    name: "Lucky Charm",
    rarity: "ultra"
  },
  {
    id: "stinky_tofu",
    name: "Stinky Tofu Plate",
    rarity: "common"
  }
];

// save js
window.Save = {
  load() {
    return JSON.parse(localStorage.getItem("gg_save") || "{}");
  },

  save(data) {
    localStorage.setItem("gg_save", JSON.stringify(data));
  }
};

// levels js
window.TOWER_LEVELS = [
  { id: 1, name: "Night Market Floor", requirement: 3 },
  { id: 2, name: "Temple Garden Floor", requirement: 6 },
  { id: 3, name: "Mountain Lookout Floor", requirement: 10 }
];

const scenes = {
  "Taipei 101": "assets/scenes/taipei101.jpg",
  "Jiufen Lantern": "assets/scenes/jiufen.jpg"
};

function loadScene(sceneName) {
  document.getElementById("scene-display").innerHTML =
    `<img src="${scenes[sceneName]}" class="scene-img">`;
}

