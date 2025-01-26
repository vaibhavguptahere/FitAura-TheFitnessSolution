from flask import Flask, render_template, request, redirect, jsonify,  url_for, flash, request, session
from forms import RegistrationForm, LoginForm
from models import db, bcrypt, User, init_db
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
import pandas as pd
import numpy as np
from sklearn.svm import SVR
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import os
from sqlalchemy import create_engine, text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity



app = Flask(__name__)

try:
    faq_data = pd.read_csv("conversational_dataset.csv")  # Ensure the file has 'Question' and 'Answer' columns
except FileNotFoundError:
    raise FileNotFoundError("Dataset file 'conversational_dataset.csv' not found. Please check the file path.")

if 'Question' not in faq_data.columns or 'Answer' not in faq_data.columns:
    raise KeyError("The dataset must contain 'Question' and 'Answer' columns.")


# Preprocess questions for similarity matching
vectorizer = TfidfVectorizer()
faq_vectors = vectorizer.fit_transform(faq_data['Question'])

# Configuration
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'  # Update with your database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)  # Initialize db once here
bcrypt.init_app(app)

# Initialize LoginManager
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Load user for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Home route
@app.route('/')
def index():
    return render_template('index.html')  # Ensure `index.html` exists in the `templates/` folder

@app.route('/index.html')
def home():
    return render_template('index.html')  # Ensure `index.html` exists in the `templates/` folder


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/dashboard.html')
def dashboard1():
    return render_template('dashboard.html')


# Route for Goals page
@app.route('/goals.html')
def goals():
    return render_template('goals.html')

# Route for Weight page
@app.route('/weight.html')
def weight():
    return render_template('weight.html', logs=weight_logs)

# Route for Profile page
@app.route('/profile')
def profile():
    return render_template('profile.html')

# Route for Workout page
@app.route('/workout.html')
def workout():
    return render_template('workout.html')

@app.route('/calorie.html')
def calorie():
    return render_template('calorie.html')


# @app.route('/contact')
# def contact():
#     return render_template('index.html#contact')


# Weight logs

#  Initialize the weight log data
weight_logs = []

# Route: Add entry
@app.route("/add_entry", methods=["POST"])
def add_entry():
    weight = float(request.form["weight"])
    date = request.form["date"]
    weight_logs.append({"date": date, "weight": weight})
    return redirect("/weight.html")

# Route: Delete entry
@app.route("/delete_entry", methods=["POST"])
def delete_entry():
    index = int(request.form["index"])
    if 0 <= index < len(weight_logs):
        del weight_logs[index]
    return redirect("/")

# Route: Generate graph
@app.route("/generate_graph")
def generate_graph():
    if len(weight_logs) < 2:
        return "Not enough data to generate a graph. Please add at least two logs."

    # Convert data to DataFrame
    df = pd.DataFrame(weight_logs)
    df["date"] = pd.to_datetime(df["date"])
    df["days"] = (df["date"] - df["date"].min()).dt.days

    X = df[["days"]]
    y = df["weight"]

    # Train SVR model
    svr_model = SVR(kernel="rbf", C=1000, gamma=0.01, epsilon=0.1)
    svr_model.fit(X, y)

    # Plot the graph
    plt.figure(figsize=(10, 6))
    plt.scatter(df["date"], y, color="blue", label="Actual Weights")
    plt.plot(df["date"], svr_model.predict(X), color="red", label="Trend Line")

    # Predict future weights
    future_days = 10
    future_dates = [df["date"].max() + timedelta(days=i) for i in range(1, future_days + 1)]
    future_X = np.array([[df["days"].max() + i] for i in range(1, future_days + 1)])
    future_predictions = svr_model.predict(future_X)
    plt.scatter(future_dates, future_predictions, color="green", label="Predicted Weights")

    # Customize the graph
    plt.xlabel("Date")
    plt.ylabel("Weight (kg)")
    plt.title("Weight Trend and Prediction")
    plt.legend()
    plt.grid(True)

    # Save the graph to the static folder
    graph_path = "static/weight_trend.png"
    os.makedirs("static", exist_ok=True)
    plt.savefig(graph_path)
    plt.close()

    return redirect(f"/static/weight_trend.png")

# Route: Predict future weights
@app.route("/predict_future/<int:days>")
def predict_future(days):
    if len(weight_logs) < 2:
        return jsonify({"error": "Not enough data to make predictions. Please add at least two logs."})

    # Convert data to DataFrame
    df = pd.DataFrame(weight_logs)
    df["date"] = pd.to_datetime(df["date"])
    df["days"] = (df["date"] - df["date"].min()).dt.days

    X = df[["days"]]
    y = df["weight"]

    # Train SVR model
    svr_model = SVR(kernel="rbf", C=1000, gamma=0.01, epsilon=0.1)
    svr_model.fit(X, y)

    # Predict future weights
    future_X = np.array([[df["days"].max() + i] for i in range(1, days + 1)])
    predictions = svr_model.predict(future_X).tolist()

    return jsonify({"predictions": predictions})


# Register 

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        print(f"Received data - Username: {username}, Email: {email}")

        # Check if the user already exists
        existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
        if existing_user:
            flash('Email or Username already exists', 'danger')
            return redirect(url_for('login'))

        # Hash the password and create a new user
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, email=email, password=hashed_password)

        try:
            db.session.add(new_user)
            db.session.commit()

            flash(f'Account created for {username}!', 'success')

            # Login the user and redirect to dashboard
            login_user(new_user)
            session['username'] = new_user.username

            flash(f'Welcome, {new_user.username}! Your account has been created.', 'success')
            return redirect(url_for('dashboard'))  # Directly redirecting to dashboard

        except Exception as e:
            db.session.rollback()
            flash(f'Error creating account: {e}', 'danger')
            return redirect(url_for('register'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user, remember=request.form.get('remember', False))
            session['username'] = user.username
            flash(f'Welcome, {user.username}! You are now logged in.', 'success')
            return redirect(url_for('dashboard'))

        else:
            flash('Login unsuccessful. Please check email and password.', 'danger')

    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


# Route for FAQ page
@app.route('/faq.html')
def faq():
    return render_template('faq.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_query = request.json.get('query')
    if not user_query:
        return jsonify({"error": "Query is missing"}), 400

    # Vectorize the user's query
    query_vector = vectorizer.transform([user_query])

    # Compute similarity scores
    similarities = cosine_similarity(query_vector, faq_vectors)

    # Find the most relevant question
    max_index = similarities.argmax()
    max_score = similarities[0, max_index]

    # Define a dynamic threshold based on average similarity
    threshold = max(0.1, similarities.mean())  # Prevent the threshold from being too low

    if max_score >= threshold:  # Check if similarity score meets the threshold
        answer = faq_data.iloc[max_index]['Answer']
    else:
        answer = (
            "I'm sorry, I couldn't find an answer to your question. "
            "Please try rephrasing or ask something else."
        )

    return jsonify({"answer": answer})

# Goals 


# AI Model to estimate calorie needs, weight loss, and more personalized recommendations
def ai_model(data):
    # Activity multiplier based on the user's activity level
    activity_multiplier = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "very": 1.725,
        "extra": 1.9
    }

    # Activity factor based on the selected activity level
    activity_factor = activity_multiplier.get(data['activityLevel'], 1.2)
    
    # BMR Calculation (for example purposes)
    bmr = 10 * data['currentWeight'] + 6.25 * 170 - 5 * 30 + 5  # Basic BMR formula for male
    calorie_target = bmr * activity_factor

    # Calculate the weight to lose and weekly target
    weight_to_lose = data['currentWeight'] - data['targetWeight']
    weekly_target = weight_to_lose / data['timeframe']

    # Personalized exercise recommendation based on the nutrition goals
    if data['nutritionGoals'] == "cut":
        exercise_recommendation = "Cardio (running, cycling) for 4-5 times/week, plus HIIT."
        macronutrients = {"protein": "30%", "carbs": "40%", "fat": "30%"}
    elif data['nutritionGoals'] == "bulk":
        exercise_recommendation = "Strength training (weight lifting) for 5 days/week."
        macronutrients = {"protein": "40%", "carbs": "30%", "fat": "30%"}
    elif data['nutritionGoals'] == "maintain":
        exercise_recommendation = "Balanced workout routine (3-4 times/week, mixing cardio and strength)."
        macronutrients = {"protein": "25%", "carbs": "45%", "fat": "30%"}

    # Workout plan suggestions based on nutrition goal
    workout_plan = {
        "cut": ["5k run", "HIIT Circuit", "Cycling for 45 minutes"],
        "bulk": ["Deadlifts", "Bench Press", "Squats", "Shoulder Press"],
        "maintain": ["Jump Rope", "Push-Ups", "Bodyweight Squats", "Planks"]
    }

    # Estimate the time to reach the target weight in weeks
    time_estimation = round(weight_to_lose / weekly_target, 2)

    # Suggested nutrition adjustments based on the user's goal
    nutrition_adjustments = f"Focus on a diet with {macronutrients['protein']} protein, {macronutrients['carbs']} carbs, and {macronutrients['fat']} fat."

    # Returning a detailed response with calorie target, workout plan, and other personalized insights
    return {
        "currentWeight": data['currentWeight'],
        "targetWeight": data['targetWeight'],
        "weightToLose": weight_to_lose,
        "weeklyTarget": round(weekly_target, 2),
        "exerciseRecommendation": exercise_recommendation,
        "calorieTarget": round(calorie_target, 2),
        "aiExercisePlan": workout_plan.get(data['nutritionGoals'], []),
        "aiTimeEstimation": f"{time_estimation} weeks",
        "aiNutritionAdjustments": nutrition_adjustments,
        "macronutrients": macronutrients,
    }

# Route to generate the fitness plan based on input
@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    # Getting form data from the frontend
    data = {
        "currentWeight": float(request.form['currentWeight']),
        "targetWeight": float(request.form['targetWeight']),
        "timeframe": int(request.form['timeframe']),
        "activityLevel": request.form['activityLevel'],
        "nutritionGoals": request.form['nutritionGoals']
    }

    # Get AI-based recommendations
    result = ai_model(data)
    return jsonify(result)

# Run the Flask app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
