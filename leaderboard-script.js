document.addEventListener("DOMContentLoaded", initializePage);

function initializePage(){
    document.querySelectorAll('#leaderboard-table-container table').forEach(table =>{
        table.classList.add('inactive-board');
    });
}

function selectBoard(boardNum) {
    const radio = document.getElementById(`game${boardNum}-radio`);
    if (radio) {
        radio.checked = true;
    }
}

fetch('leaderboard_game1.php')
  .then(response => response.text())
  .then(data => {
    document.getElementById("leaderboard-game1-body").innerHTML = data;
  })
  .catch(error => {
    console.error("Error loading leaderboard:", error);
  });

fetch('leaderboard_game2.php')
.then(response => response.text())
.then(data => {
  document.getElementById("leaderboard-game2-body").innerHTML = data;
})
.catch(error => {
  console.error("Error loading leaderboard:", error);
});