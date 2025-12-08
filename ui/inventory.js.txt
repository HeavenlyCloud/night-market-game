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
