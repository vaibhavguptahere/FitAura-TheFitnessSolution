document.addEventListener('DOMContentLoaded', () => {
    const boxes = document.querySelectorAll('.dashboard-box');
    const values = document.querySelectorAll('.value');
    let charts = []; // Store chart instances

    // Initialize charts
    initializeCharts();

    // Handle box expand/collapse functionality
    boxes.forEach(box => {
        box.addEventListener('click', () => {
            // Collapse the expanded box if clicked again
            if (box.classList.contains('expanded')) {
                box.classList.remove('expanded');
                return;
            }

            // Collapse all other boxes
            boxes.forEach(otherBox => {
                otherBox.classList.remove('expanded');
            });

            // Expand the clicked box
            box.classList.add('expanded');

            // Scroll to the box if it's not fully visible
            const boxRect = box.getBoundingClientRect();
            const isFullyVisible =
                boxRect.top >= 0 && boxRect.bottom <= window.innerHeight;

            if (!isFullyVisible) {
                box.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }

            // Update charts when a box is expanded
            updateCharts();
        });
    });

    // Close expanded box when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dashboard-box')) {
            boxes.forEach(box => {
                box.classList.remove('expanded');
            });
        }
    });

    // Animate all values on page load
    values.forEach(value => {
        const currentValue = value.textContent;
        let startValue = 0;
        let endValue;

        if (currentValue.includes('$')) {
            endValue = parseInt(currentValue.replace(/[$,]/g, ''));
        } else if (currentValue.includes('%')) {
            endValue = parseFloat(currentValue);
        } else {
            endValue = parseInt(currentValue.replace(/,/g, ''));
        }

        animateValue(value, startValue, endValue, 1500);
    });

    // Initialize charts
    function initializeCharts() {
        // Calorie Chart (Doughnut)
        const calorieCtx = document.getElementById('calorieChart').getContext('2d');
        charts.push(new Chart(calorieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Remaining'],
                datasets: [{
                    data: [450, 650, 550, 200, 350],
                    backgroundColor: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#f3f4f6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        }));

        // Weight Progress Chart (Line)
        const weightCtx = document.getElementById('weightChart').getContext('2d');
        charts.push(new Chart(weightCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [77.8, 77.0, 76.2, 75.5],
                    borderColor: '#3b82f6',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: 70,
                        max: 80
                    }
                }
            }
        }));

        // Goals Progress Chart (Bar)
        const goalsCtx = document.getElementById('goalsChart').getContext('2d');
        charts.push(new Chart(goalsCtx, {
            type: 'bar',
            data: {
                labels: ['Run 5km', 'Pull-ups', 'Bench Press', 'Weight Goal'],
                datasets: [{
                    label: 'Progress (%)',
                    data: [100, 100, 93, 78],
                    backgroundColor: ['#10b981', '#10b981', '#d1fae5', '#d1fae5']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        }));

        // Workout Distribution Chart (Radar)
        const workoutCtx = document.getElementById('workoutChart').getContext('2d');
        charts.push(new Chart(workoutCtx, {
            type: 'radar',
            data: {
                labels: ['Cardio', 'Strength', 'Flexibility', 'HIIT'],
                datasets: [{
                    label: 'Hours',
                    data: [4.5, 5, 2, 1],
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderColor: '#f59e0b',
                    pointBackgroundColor: '#f59e0b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 6
                    }
                }
            }
        }));
    }

    // Update charts when resizing or expanding
    function updateCharts() {
        charts.forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    // Animate values (counter effect)
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (
                (increment > 0 && current >= end) ||
                (increment < 0 && current <= end)
            ) {
                clearInterval(timer);
                current = end;
            }

            if (element.textContent.includes('$')) {
                element.textContent = `$${Math.floor(current).toLocaleString()}`;
            } else if (element.textContent.includes('%')) {
                element.textContent = `${current.toFixed(1)}%`;
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }
});
