from flask import Flask, render_template

app = Flask(__name__)

# Home route
@app.route('/')
def index():
    return render_template('index.html')  # Ensure `index.html` exists in the `templates/` folder


@app.route('/dashboard')
def dashboard():
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
    return render_template('weight.html')

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



# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
