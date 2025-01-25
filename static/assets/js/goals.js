document.getElementById('goalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const currentWeight = parseFloat(document.getElementById('currentWeight').value);
    const targetWeight = parseFloat(document.getElementById('targetWeight').value);
    const timeframe = parseInt(document.getElementById('timeframe').value);
    const activityLevel = document.getElementById('activityLevel').value;
    
    // Calculate weight loss goals
    const totalWeightToLose = currentWeight - targetWeight;
    const weeklyWeightLoss = totalWeightToLose / timeframe;
    
    // Calculate recommended calories based on activity level
    let calorieAdjustment;
    let exerciseRecommendation;
    
    switch(activityLevel) {
        case 'sedentary':
            calorieAdjustment = -500;
            exerciseRecommendation = "30 minutes of light exercise 3 times per week";
            break;
        case 'light':
            calorieAdjustment = -400;
            exerciseRecommendation = "45 minutes of moderate exercise 3-4 times per week";
            break;
        case 'moderate':
            calorieAdjustment = -300;
            exerciseRecommendation = "1 hour of exercise 4-5 times per week";
            break;
        case 'very':
            calorieAdjustment = -200;
            exerciseRecommendation = "1 hour of intense exercise 6 times per week";
            break;
        case 'extra':
            calorieAdjustment = -100;
            exerciseRecommendation = "1-2 hours of intense exercise 6 times per week";
            break;
    }
    
    // Base calorie calculation (basic BMR + activity)
    const baseCalories = 2000; // This is a simplified calculation
    const dailyCalories = baseCalories + calorieAdjustment;
    
    // Display results
    document.getElementById('displayCurrentWeight').textContent = currentWeight;
    document.getElementById('displayTargetWeight').textContent = targetWeight;
    document.getElementById('displayWeightToLose').textContent = totalWeightToLose.toFixed(1);
    document.getElementById('weeklyTarget').textContent = weeklyWeightLoss.toFixed(2);
    document.getElementById('exerciseRecommendation').textContent = exerciseRecommendation;
    document.getElementById('calorieTarget').textContent = dailyCalories;
    
    // Show results section
    document.getElementById('results').classList.remove('hidden');
});