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
