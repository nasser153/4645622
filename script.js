document.addEventListener('DOMContentLoaded', () => {
    const refreshInterval = 30000; // 30 seconds
    const transitionInterval = 10000; // 10 seconds
    const grades = [4, 5, 6, 13, 14]; // Added 13 for 1/3 and 14 for 1/4
    let currentSlideIndex = 0;

    function animateScore(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = `Score: ${Math.floor(progress * (end - start) + start)}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function createStudentElement(student, index) {
        const studentDiv = document.createElement('div');
        studentDiv.classList.add('student');

        const img = document.createElement('img');
        img.src = student.img;
        img.alt = student.name;
        img.onerror = "this.src='default.jpg';";

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('student-info');

        const nameDiv = document.createElement('div');
        nameDiv.classList.add('student-name');
        nameDiv.textContent = student.name;

        const scoreDiv = document.createElement('div');
        scoreDiv.classList.add('student-score');
        scoreDiv.textContent = `Score: 0`;

        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(scoreDiv);

        studentDiv.appendChild(img);
        studentDiv.appendChild(infoDiv);

        if (index === 0) {
            const crown = document.createElement('span');
            crown.classList.add('crown');
            crown.textContent = '👑';
            studentDiv.appendChild(crown);
        }

        animateScore(scoreDiv, 0, student.score, 2000);

        return studentDiv;
    }

    function updateLeaderboard(grade, students) {
        const studentList = document.getElementById(`studentList-${grade}`);
        studentList.innerHTML = '';

        students.forEach((student, index) => {
            const studentElement = createStudentElement(student, index);
            studentList.appendChild(studentElement);
        });
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

                grades.forEach(grade => {
                    const gradeStudents = students.filter(student => parseInt(student.grade) === grade);
                    gradeStudents.sort((a, b) => b.score - a.score);
                    updateLeaderboard(grade, gradeStudents);
                });

                // Update combined leaderboard
                const topStudents = grades.flatMap(grade => 
                    students.filter(student => parseInt(student.grade) === grade)
                           .sort((a, b) => b.score - a.score)
                           .slice(0, 1)
                );
                topStudents.sort((a, b) => b.score - a.score);
                updateLeaderboard('all', topStudents);
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
    }

    fetchData();
    setInterval(fetchData, refreshInterval);
    showNextSlide();
    setInterval(showNextSlide, transitionInterval);
});
