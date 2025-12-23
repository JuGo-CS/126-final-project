document.addEventListener("DOMContentLoaded", scalePageElements);
window.addEventListener("load", scalePageElements);
window.addEventListener("resize", scalePageElements);

function scalePageElements() {
  const gameContainer = document.getElementById("game-container");

  if (gameContainer) {
    const fontSize = gameContainer.offsetHeight * 0.05;
    gameContainer.style.fontSize = `${fontSize}px`;
  }
}