document.addEventListener('DOMContentLoaded', () => {
    const refreshInterval = 30000; // 30 seconds
    const transitionInterval = 10000; // 10 seconds
    const grades = [4, 5, 6, '1-3', '1-4'];
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
        fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRSRwqATt4_bfYL87qgBZSMyfubiRBkgs20ftZiCDAa0l8SlZC7Jg_9RI2v6o-ipp9yq2JyMh6FNVYj/pub?output=csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(csvText => {
                const students = Papa.parse(csvText, { header: true }).data;
                const topStudents = [];

                grades.forEach(grade => {
                    const studentList = document.getElementById(`studentList-${grade}`);
                    studentList.innerHTML = ''; // Clear existing content

                    const gradeStudents = students.filter(student => student.grade === grade.toString());
                    gradeStudents.sort((a, b) => b.score - a.score);

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
                            <img src="${student.img}" alt="${student.name}" onerror="this.src='default.jpg';">
                            <div class="student-name">${student.name}</div>
                            <div class="student-score" data-score="${student.score}">0</div>
                        `;

                        studentList.appendChild(studentDiv);

                        // Animate score
                        const scoreElement = studentDiv.querySelector('.student-score');
                        animateScore(scoreElement, 0, student.score, 2000);

                        // Apply staggered animation
                        studentDiv.style.animationDelay = `${index * 0.2}s`;
                        studentDiv.classList.add('fade-up');
                    });

                    topStudents.push(...gradeStudents.slice(0, 1)); // Collect top student from each grade
                });

                // Display top students in the combined leaderboard
                const combinedList = document.getElementById('studentList-all');
                combinedList.innerHTML = ''; // Clear existing content

                topStudents.sort((a, b) => b.score - a.score); // Sort top students across grades

                const podiumDiv = document.createElement('div');
                podiumDiv.classList.add('podium');

                topStudents.slice(0, 3).forEach((student, index) => {
                    const studentDiv = document.createElement('div');
                    studentDiv.classList.add('student-top');
                    if (index === 0) {
                        studentDiv.classList.add('first-place');
                        studentDiv.innerHTML += `<div class="top-text">TOP 1</div><div class="crown">👑</div>`;
                    } else if (index === 1) {
                        studentDiv.classList.add('second-place');
                        studentDiv.innerHTML += `<div class="top-text">TOP 2</div>`;
                    } else if (index === 2) {
                        studentDiv.classList.add('third-place');
                        studentDiv.innerHTML += `<div class="top-text">TOP 3</div>`;
                    }

                    studentDiv.innerHTML += `
                        <img src="${student.img}" alt="${student.name}" onerror="this.src='default.jpg';">
                        <div class="student-top-name">${student.name}</div>
                        <div class="student-top-grade">Grade ${student.grade}</div>
                        <div class="student-top-score" data-score="${student.score}">0</div>
                    `;

                    podiumDiv.appendChild(studentDiv);

                    // Animate score
                    const scoreElement = studentDiv.querySelector('.student-top-score');
                    animateScore(scoreElement, 0, student.score, 2000);
                });

                combinedList.appendChild(podiumDiv);
            })
            .catch(error => {
                console.error("Error fetching CSV data:", error);
            });
    }

    function showNextSlide() {
        const leaderboards = document.querySelectorAll('.leaderboard');
        leaderboards.forEach(leaderboard => {
            leaderboard.classList.remove('active');
        });
        leaderboards[currentSlideIndex].classList.add('active');
        currentSlideIndex = (currentSlideIndex + 1) % leaderboards.length;

        // Re-apply fade-up animation to all student containers
        setTimeout(() => {
            document.querySelectorAll(`.leaderboard.active .student, .leaderboard.active .student-top`).forEach((student, index) => {
                student.style.animation = 'none';
                student.offsetHeight; // Trigger reflow to restart animation
                student.style.animation = '';
                student.style.animationDelay = `${index * 0.2}s`;
                student.classList.add('fade-up');
            });
        }, 100);
    }

    // Fetch data initially
    fetchData();

    // Set interval to fetch data periodically
    setInterval(fetchData, refreshInterval);

    // Show the first slide initially
    showNextSlide();

    // Set interval to switch between slides
    setInterval(showNextSlide, transitionInterval);
});
