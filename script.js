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
            
            if (mediaInfo && mediaInfo.url && mediaInfo.url.trim() !== '') {
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
        // Replace this URL with your actual Google Sheets published CSV URL
        const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSRwqATt4_bfYL87qgBZSMyfubiRBkgs20ftZiCDAa0l8SlZC7Jg_9RI2v6o-ipp9yq2JyMh6FNVYj/pubhtml';
        
        fetch(sheetURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(csvText => {
                const data = Papa.parse(csvText, { header: true }).data;
                
                // Extract media banner data from the first row
                mediaData = [
                    { url: data[0]?.banner1_url || '' },
                    { url: data[0]?.banner2_url || '' },
                    { url: data[0]?.banner3_url || '' },
                    { url: data[0]?.banner4_url || '' }
                ].filter(banner => banner.url && banner.url.trim() !== '');
                
                // Only update banners if we have valid URLs
                if (mediaData.length > 0) {
                    updateMediaBanners(mediaData);
                }

                // Original leaderboard logic
                const students = data.filter(row => row.grade && row.name && row.score);
                grades.forEach(grade => {
                    const studentList = document.getElementById(`studentList-${grade}`);
                    if (!studentList) return;
                    
                    studentList.innerHTML = '';
                    const gradeStudents = students
                        .filter(student => parseInt(student.grade) === grade)
                        .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

                    gradeStudents.forEach((student, index) => {
                        const studentDiv = document.createElement('div');
                        studentDiv.classList.add('student');

                        if (index === 0) {
                            studentDiv.classList.add('top-student');
                            studentDiv.innerHTML += `<div class="crown">👑</div><div class="top-text">TOP 1</div>`;
                        } else if (index === 1) {
                            studentDiv.classList.add('second-student');
                            studentDiv.innerHTML += `<div class="top-text">TOP 2</div>`;
                        } else if (index === 2) {
                            studentDiv.classList.add('third-student');
                            studentDiv.innerHTML += `<div class="top-text">TOP 3</div>`;
                        }

                        studentDiv.innerHTML += `
                            <img src="${student.img || 'default.jpg'}" alt="${student.name}" onerror="this.src='default.jpg';">
                            <div class="student-name">${student.name}</div>
                            <div class="student-score" data-score="${student.score}">0</div>
                        `;

                        studentList.appendChild(studentDiv);

                        const scoreElement = studentDiv.querySelector('.student-score');
                        animateScore(scoreElement, 0, parseFloat(student.score), 2000);

                        studentDiv.style.animationDelay = `${index * 0.2}s`;
                        studentDiv.classList.add('fade-up');
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }

    function showNextSlide() {
        const leaderboards = document.querySelectorAll('.leaderboard');
        const banners = document.querySelectorAll('.media-banner');
        const allSlides = [...leaderboards, ...banners].filter(slide => {
            if (slide.classList.contains('media-banner')) {
                return slide.querySelector('.media-content').children.length > 0;
            }
            return true;
        });

        allSlides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        allSlides[currentSlideIndex].classList.add('active');
        currentSlideIndex = (currentSlideIndex + 1) % allSlides.length;

        // Only apply fade-up animation to leaderboard slides
        if (allSlides[currentSlideIndex].classList.contains('leaderboard')) {
            setTimeout(() => {
                document.querySelectorAll(`.leaderboard.active .student, .leaderboard.active .student-top`).forEach((student, index) => {
                    student.style.animation = 'none';
                    student.offsetHeight;
                    student.style.animation = '';
                    student.style.animationDelay = `${index * 0.2}s`;
                    student.classList.add('fade-up');
                });
            }, 100);
        }
    }

    fetchData();
    setInterval(fetchData, refreshInterval);
    showNextSlide();
    setInterval(showNextSlide, transitionInterval);
});
