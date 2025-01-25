document.addEventListener('DOMContentLoaded', () => {
    const foodForm = document.getElementById('foodForm');
    const foodEntriesContainer = document.getElementById('foodEntries');
    const totalCaloriesElement = document.getElementById('totalCalories');

    // Load entries from localStorage
    let entries = JSON.parse(localStorage.getItem('foodEntries') || '[]');
    updateDisplay();

    foodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const foodName = document.getElementById('foodName').value;
        const calories = parseInt(document.getElementById('calories').value);
        
        if (foodName && calories) {
            const entry = {
                id: Date.now().toString(),
                name: foodName,
                calories: calories,
                timestamp: new Date().toISOString()
            };
            
            entries.push(entry);
            localStorage.setItem('foodEntries', JSON.stringify(entries));
            
            // Reset form
            foodForm.reset();
            updateDisplay();
        }
    });

    function updateDisplay() {
        // Clear current entries
        foodEntriesContainer.innerHTML = '';
        
        // Filter entries for today
        const today = new Date().toDateString();
        const todayEntries = entries.filter(entry => 
            new Date(entry.timestamp).toDateString() === today
        );
        
        // Calculate total calories
        const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
        totalCaloriesElement.textContent = totalCalories;
        
        // Display entries
        todayEntries.forEach(entry => {
            const entryElement = createEntryElement(entry);
            foodEntriesContainer.appendChild(entryElement);
        });
    }

    function createEntryElement(entry) {
        const div = document.createElement('div');
        div.className = 'food-entry';
        
        const time = new Date(entry.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        div.innerHTML = `
            <div class="details">
                <span class="name">${entry.name}</span>
                <span class="calories">${entry.calories} calories</span>
                <div class="time">${time}</div>
            </div>
            <button class="delete-btn" data-id="${entry.id}">Delete</button>
        `;
        
        // Add delete functionality
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            entries = entries.filter(e => e.id !== entry.id);
            localStorage.setItem('foodEntries', JSON.stringify(entries));
            updateDisplay();
        });
        
        return div;
    }
});