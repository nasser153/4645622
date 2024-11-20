document.addEventListener('DOMContentLoaded', () => {
    const refreshInterval = 30000; // 30 seconds
    const transitionInterval = 10000; // 10 seconds
    let currentSlideIndex = 0;

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

    function fetchData() {
        fetch('https://docs.google.com/spreadsheets/d/e/YOUR_SPREADSHEET_ID/pub?output=csv')
            .then(response => response.text())
            .then(csvText => {
                const students = Papa.parse(csvText, { header: true }).data;
                
                // Current champion
                updateLeaderboard('current', students[0]); // Top student
                
                // Future champion (second highest scorer)
                updateLeaderboard('future', students[1]); // Second-best student
            })
            .catch(error => {
                console.error("Error fetching CSV data:", error);
            });
    }

    function updateLeaderboard(type, student) {
        const studentList = document.getElementById(`studentList-${type}`);
        studentList.innerHTML = '';

        const studentDiv = document.createElement('div');
        studentDiv.classList.add('student');

        studentDiv.innerHTML = `
            <div class="crown">👑</div>
            <img src="${student.img}" alt="${student.name}" onerror="this.src='default.jpg';">
            <div class="student-name">${student.name}</div>
            <div class="student-score" data-score="${student.score}">0</div>
        `;

        studentList.appendChild(studentDiv);

        const scoreElement = studentDiv.querySelector('.student-score');
        animateScore(scoreElement, 0, student.score, 2000);
    }

    function showNextSlide() {
        const leaderboards = document.querySelectorAll('.leaderboard');
        leaderboards.forEach(leaderboard => {
            leaderboard.classList.remove('active');
        });
        leaderboards[currentSlideIndex].classList.add('active');
        currentSlideIndex = (currentSlideIndex + 1) % leaderboards.length;
    }

    fetchData();
    setInterval(fetchData, refreshInterval);
    showNextSlide();
    setInterval(showNextSlide, transitionInterval);
});
