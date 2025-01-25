// Store workouts in localStorage
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];

// Exercise suggestions based on workout type
const exerciseSuggestions = {
    cardio: [
        { name: 'Running', description: '30 minutes at moderate pace' },
        { name: 'Cycling', description: '45 minutes at varying intensity' },
        { name: 'Swimming', description: '30 minutes of laps' }
    ],
    strength: [
        { name: 'Push-ups', description: '3 sets of 15 reps' },
        { name: 'Squats', description: '4 sets of 12 reps' },
        { name: 'Deadlifts', description: '3 sets of 10 reps' }
    ],
    flexibility: [
        { name: 'Yoga Flow', description: '20 minutes of basic poses' },
        { name: 'Static Stretching', description: 'Hold each stretch for 30 seconds' },
        { name: 'Pilates', description: '30 minutes of core exercises' }
    ],
    hiit: [
        { name: 'Burpees', description: '30 seconds work, 15 seconds rest' },
        { name: 'Mountain Climbers', description: '45 seconds work, 15 seconds rest' },
        { name: 'Jump Rope', description: '1 minute work, 30 seconds rest' }
    ]
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateSuggestions('cardio'); // Default suggestions
    updateWorkoutTable();
    updateGraph();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workoutDate').value = today;
});

// Update exercise suggestions based on workout type
document.getElementById('workoutType').addEventListener('change', (e) => {
    updateSuggestions(e.target.value);
});

// Handle form submission
document.getElementById('workoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const workout = {
        id: Date.now(),
        date: document.getElementById('workoutDate').value,
        type: document.getElementById('workoutType').value,
        duration: parseInt(document.getElementById('duration').value),
        calories: parseInt(document.getElementById('caloriesBurned').value),
        notes: document.getElementById('notes').value
    };
    
    workouts.push(workout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    updateWorkoutTable();
    updateGraph();
    e.target.reset();
    
    // Set today's date again
    document.getElementById('workoutDate').value = new Date().toISOString().split('T')[0];

    // Show success message
    showNotification('Workout added successfully!');
});

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after animation
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateSuggestions(workoutType) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    
    if (!workoutType) return;
    
    exerciseSuggestions[workoutType].forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.innerHTML = `
            <h3>${exercise.name}</h3>
            <p>${exercise.description}</p>
        `;
        suggestionsDiv.appendChild(card);
    });
}

function updateWorkoutTable() {
    const tbody = document.querySelector('#workoutTable tbody');
    tbody.innerHTML = '';
    
    workouts.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(workout => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(workout.date).toLocaleDateString()}</td>
            <td>${workout.type}</td>
            <td>${workout.duration} mins</td>
            <td>${workout.calories}</td>
            <td>${workout.notes}</td>
            <td>
                <button class="delete-btn" onclick="deleteWorkout(${workout.id})">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteWorkout(id) {
    if (confirm('Are you sure you want to delete this workout?')) {
        workouts = workouts.filter(workout => workout.id !== id);
        localStorage.setItem('workouts', JSON.stringify(workouts));
        updateWorkoutTable();
        updateGraph();
        showNotification('Workout deleted successfully!');
    }
}

function updateGraph() {
    const canvas = document.getElementById('calorieGraph');
    const ctx = canvas.getContext('2d');
    
    // Clear previous graph
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    
    // Get last 7 days of workouts
    const last7Days = workouts
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7);
    
    if (last7Days.length === 0) {
        drawEmptyState(ctx, canvas.width, canvas.height);
        return;
    }
    
    // Calculate graph dimensions
    const padding = 60;
    const graphWidth = canvas.width - (padding * 2);
    const graphHeight = canvas.height - (padding * 2);
    
    // Find max calories for scaling
    const maxCalories = Math.max(...last7Days.map(w => w.calories));
    
    // Draw background grid
    drawGrid(ctx, padding, graphWidth, graphHeight, canvas.height, maxCalories);
    
    // Draw axes
    drawAxes(ctx, padding, canvas.width, canvas.height);
    
    // Plot points and line
    drawDataPoints(ctx, last7Days, padding, graphWidth, graphHeight, canvas.height, maxCalories);
}

function drawEmptyState(ctx, width, height) {
    ctx.fillStyle = '#a0aec0';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No workout data available', width / 2, height / 2);
}

function drawGrid(ctx, padding, graphWidth, graphHeight, canvasHeight, maxCalories) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i * (graphHeight / 5));
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + graphWidth, y);
        ctx.stroke();
        
        // Add calorie labels
        ctx.fillStyle = '#718096';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(
            Math.round((maxCalories * (5 - i) / 5)),
            padding - 10,
            y + 4
        );
    }
}

function drawAxes(ctx, padding, width, height) {
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Y-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    
    // X-axis
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
}

function drawDataPoints(ctx, data, padding, graphWidth, graphHeight, canvasHeight, maxCalories) {
    // Draw line connecting points
    ctx.beginPath();
    ctx.strokeStyle = '#4299e1';
    ctx.lineWidth = 3;
    
    data.forEach((workout, index) => {
        const x = padding + (index * (graphWidth / (data.length - 1)));
        const y = canvasHeight - padding - ((workout.calories / maxCalories) * graphHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw gradient under the line
    const gradient = ctx.createLinearGradient(0, padding, 0, canvasHeight - padding);
    gradient.addColorStop(0, 'rgba(66, 153, 225, 0.2)');
    gradient.addColorStop(1, 'rgba(66, 153, 225, 0)');
    
    ctx.fillStyle = gradient;
    ctx.lineTo(padding + graphWidth, canvasHeight - padding);
    ctx.lineTo(padding, canvasHeight - padding);
    ctx.closePath();
    ctx.fill();
    
    // Draw points and labels
    data.forEach((workout, index) => {
        const x = padding + (index * (graphWidth / (data.length - 1)));
        const y = canvasHeight - padding - ((workout.calories / maxCalories) * graphHeight);
        
        // Draw point
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 3;
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw date label
        ctx.fillStyle = '#4a5568';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(new Date(workout.date).toLocaleDateString(), x, canvasHeight - padding + 20);
        
        // Draw calorie label
        ctx.fillStyle = '#4299e1';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(workout.calories, x, y - 15);
    });
}

// Handle window resize for responsive graph
window.addEventListener('resize', updateGraph);

// Add styles for notification
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: -100px;
        left: 50%;
        transform: translateX(-50%);
        background: #48bb78;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: bottom 0.3s ease;
        z-index: 1000;
    }
    
    .notification.show {
        bottom: 20px;
    }
`;
document.head.appendChild(style);