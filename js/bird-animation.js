
(function () {
    const BIRD_COUNT_FILES = 6;
    const MAX_CONCURRENT_BIRDS = 6;
    const MIN_SPAWN_DELAY = 1500;
    const MAX_SPAWN_DELAY = 4000;
    const MAX_TOP_PERCENT = 65; // keeps birds within the upper 70% of the viewport

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function spawnBird(layer) {
        if (layer.childElementCount >= MAX_CONCURRENT_BIRDS) return;

        const birdNum = Math.floor(randomBetween(1, BIRD_COUNT_FILES + 1));
        const isLTR = Math.random() < 0.5;
        const size = randomBetween(70, 100); // px
        const top = randomBetween(2, MAX_TOP_PERCENT);
        const duration = randomBetween(9, 19); // seconds
        const delay = randomBetween(0, 1.2);

        const wrapper = document.createElement('div');
        wrapper.className = 'flying-bird';
        wrapper.style.top = `${top}%`;
        wrapper.style.animationName = isLTR ? 'birdFlyLTR' : 'birdFlyRTL';
        wrapper.style.animationDuration = `${duration}s`;
        wrapper.style.animationDelay = `${delay}s`;

        const img = document.createElement('img');
        img.src = `assets/birds/bird${birdNum}.gif`;
        img.alt = "";
        img.style.width = `${size}px`;
        if (!isLTR) img.className = 'bird-flip';

        wrapper.appendChild(img);
        layer.appendChild(wrapper);

        wrapper.addEventListener('animationend', () => {
            if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        });
    }

    function scheduleNextBird(layer) {
        const delay = randomBetween(MIN_SPAWN_DELAY, MAX_SPAWN_DELAY);
        setTimeout(() => {
            spawnBird(layer);
            scheduleNextBird(layer);
        }, delay);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const layer = document.getElementById('bird-layer');
        if (!layer) return;

        // Seed a couple of birds immediately so the sky isn't empty on load
        spawnBird(layer);
        setTimeout(() => spawnBird(layer), 700);

        scheduleNextBird(layer);
    });
})();