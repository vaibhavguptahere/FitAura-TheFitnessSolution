from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import UserMixin

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)

    def _repr_(self):
        return f"User('{self.username}', '{self.email}')"

# Initialize the database
def init_db(app):
    """
    Initialize the database with the given Flask app.

    :param app: Flask application instance
    """
    db.init_app(app)  # Associate SQLAlchemy with the Flask app
    with app.app_context():
        db.create_all()  # Create all database tables if they don't exist