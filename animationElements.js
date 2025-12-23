document.querySelectorAll('.game-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault(); 


    const titleCard = document.getElementById('title-card');
    const blackBackground =  document.getElementById('blackBackground');
    const whiteFadeIn = document.getElementById('whiteFadeIn');
    const home_leaderboard_transition = document.getElementById('home_leaderboard_transition');

    // Reset animation
    titleCard.style.animation = 'none';
    void titleCard.offsetWidth; // Force reflow to restart animation

    blackBackground.style.animation = 'none';
    void blackBackground.offsetWidth; // Force reflow to restart animation

    whiteFadeIn.style.animation = 'none';
    void whiteFadeIn.offsetWidth; // Force reflow to restart animation

    home_leaderboard_transition.style.animation = 'none';
    void home_leaderboard_transition.offsetWidth; // Force reflow to restart animation


    titleCard.style.animationName = 'gitlogZoomIn';
    titleCard.style.animationDuration = '1.55s';
    titleCard.style.animationFillMode = 'forwards';
    titleCard.style.animationTimingFunction = 'ease-in-out';

    blackBackground.style.animationName = 'blackBackgroundFadeIn';
    blackBackground.style.animationDuration = '1s';
    blackBackground.style.animationTimingFunction = 'ease-in-out';
    blackBackground.style.animationFillMode = 'forwards';
    
    whiteFadeIn.style.animationName = 'whiteFadeIn_Expand';
    whiteFadeIn.style.animationDuration = '1.55s';
    whiteFadeIn.style.animationTimingFunction = 'ease-in-out';
    whiteFadeIn.style.animationFillMode = 'forwards';



    // Optional: Delay navigation until animation ends
    setTimeout(() => {
      window.location.href = this.getAttribute('href');
    }, 1500); // match with animation duration
  });
});
