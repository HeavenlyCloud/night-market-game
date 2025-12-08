window.Gacha = {
  rarityTable: {
    common: 0.75,
    rare: 0.20,
    ultra: 0.05
  },

  rollRarity() {
    let r = Math.random();
    if (r < this.rarityTable.ultra) return "ultra";
    if (r < this.rarityTable.ultra + this.rarityTable.rare) return "rare";
    return "common";
  },

  pullOne() {
    const rarity = this.rollRarity();
    const pool = GAME_ITEMS.filter(i => i.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
  },

  pullTen() {
    return Array.from({ length: 10 }).map(() => this.pullOne());
  }
};
