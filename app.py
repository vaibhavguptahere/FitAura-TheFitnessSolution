from flask import Flask, render_template, request, redirect, jsonify
from forms import RegistrationForm, LoginForm
from models import db, bcrypt, User, init_db
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
import pandas as pd
import numpy as np
from sklearn.svm import SVR
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import os

app = Flask(__name__)

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

# Route for FAQ page
@app.route('/faq')
def faq():
    return render_template('faq.html')

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



# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
