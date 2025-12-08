const capsules = [
  { name: "Taipei 101 Capsule", rarity: "common", image: "assets/items/taipei101.png" },
  { name: "Shilin Night Market Capsule", rarity: "common", image: "assets/items/shilin.png" },
  // ... add all 20 Taiwan items for MVP
];

function pullCapsule() {
  const randIndex = Math.floor(Math.random() * capsules.length);
  const capsule = capsules[randIndex];
  revealCapsule(capsule);
  saveToInventory(capsule);
}

function revealCapsule(capsule) {
  const display = document.getElementById("capsule-display");
  display.innerHTML = `<img src="${capsule.image}" class="capsule-item" />
                       <p>${capsule.name} (${capsule.rarity})</p>`;
}

function saveToInventory(capsule) {
  let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  inventory.push(capsule);
  localStorage.setItem("inventory", JSON.stringify(inventory));
  updateInventoryUI();
}

function updateInventoryUI() {
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const invDiv = document.getElementById("inventory");
  invDiv.innerHTML = inventory.map(c => `<img src="${c.image}" class="inv-icon" />`).join("");
}
