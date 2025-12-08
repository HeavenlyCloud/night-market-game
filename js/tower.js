function updateTower() {
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  const towerHeight = Math.floor(inventory.length / 5); // 5 items per level
  const towerDiv = document.getElementById("tower");
  towerDiv.style.height = `${towerHeight * 50}px`; // each floor = 50px
  towerDiv.innerHTML = `Tower Level: ${towerHeight}`;
}
