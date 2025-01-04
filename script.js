document.addEventListener('DOMContentLoaded', () => {
    const refreshInterval = 30000; // 30 seconds
    const transitionInterval = 10000; // 10 seconds
    const grades = [4, 5, 6, 13, 14];
    let currentSlideIndex = 0;
    let mediaData = [];

    function animateScore(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = `${Math.floor(progress * (end - start) + start)}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function updateMediaBanners(mediaData) {
        for (let i = 1; i <= 4; i++) {
            const banner = document.querySelector(`#banner-${i} .media-content`);
            const mediaInfo = mediaData[i - 1];
            
            if (mediaInfo && mediaInfo.url) {
                banner.innerHTML = ''; // Clear existing content
                
                if (mediaInfo.url.match(/\.(mp4|webm|ogg)$/i)) {
                    // Video content
                    const video = document.createElement('video');
                    video.src = mediaInfo.url;
                    video.autoplay = true;
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;
                    banner.appendChild(video);
                } else if (mediaInfo.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    // Image content
                    const img = document.createElement('img');
                    img.src = mediaInfo.url;
                    img.alt = `Banner ${i}`;
                    banner.appendChild(img);
                }
            }
        }
    }

    function fetchData() {
        fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRSRwqATt4_bf
