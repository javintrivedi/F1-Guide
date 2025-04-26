import os
from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash, g
from flask_cors import CORS
import mysql.connector
import random
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
CORS(app)

# Use environment variables for config
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'supersecretkey')  # Should be overridden in production

DB_CONFIG = {
    "host": os.environ.get('DB_HOST', 'localhost'),
    "user": os.environ.get('DB_USER', 'root'),
    "password": os.environ.get('DB_PASSWORD', 'javin1326'),
    "database": os.environ.get('DB_NAME', 'beginners_guide_to_f1')
}

# Enable CSRF protection
csrf = CSRFProtect(app)

# Configure logging for production
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as e:
        app.logger.error(f"❌ Database connection error: {e}")
        return None

@app.before_request
def before_request():
    g.user = None
    if 'username' in session:
        g.user = session['username']

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"❌ Internal server error: {error}")
    return render_template('500.html'), 500

from flask_wtf.csrf import generate_csrf

@app.route('/')
def home():
    if g.user:
        csrf_token = generate_csrf()
        return render_template('index.html', username=g.user, csrf_token=csrf_token)
    return redirect(url_for('login'))

from flask_wtf.csrf import generate_csrf

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = generate_password_hash(request.form['password'])

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                           (username, email, password))
            conn.commit()
            flash("Signup successful! Please login.", "success")
            return redirect(url_for('login'))
        except mysql.connector.Error as e:
            flash("Username or Email already exists.", "danger")
        finally:
            cursor.close()
            conn.close()

    csrf_token = generate_csrf()
    return render_template('signup.html', csrf_token=csrf_token)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        if not conn:
            flash("Database connection failed. Please check your database settings.", "danger")
            csrf_token = generate_csrf()
            return render_template('login.html', csrf_token=csrf_token)

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['username'] = user['username']
            return redirect(url_for('home'))
        else:
            flash("Invalid credentials", "danger")

    csrf_token = generate_csrf()
    return render_template('login.html', csrf_token=csrf_token)

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/addDriver', methods=['POST'])
def add_driver():
    data = request.json
    required_fields = ["driver_id", "driver_name", "carNo", "no_of_races", "team_id"]

    if not all(data.get(field) for field in required_fields):
        return jsonify({"success": False, "error": "All fields are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM drivers WHERE driver_id = %s", (data["driver_id"],))
        if cursor.fetchone()[0] > 0:
            return jsonify({"success": False, "error": "Driver ID already exists"}), 400

        cursor.execute("""
            INSERT INTO drivers (driver_id, driver_name, carNo, no_of_races, team_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (data["driver_id"], data["driver_name"], data["carNo"], data["no_of_races"], data["team_id"]))
        conn.commit()

        return jsonify({"success": True, "message": "✅ Driver added successfully!"})
    except mysql.connector.Error as e:
        app.logger.error(f"❌ Insert error: {e}")
        return jsonify({"success": False, "error": "Database error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/get_drivers', methods=['GET'])
def get_drivers():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT driver_id, driver_name, carNo, no_of_races, team_id
            FROM drivers
            ORDER BY CAST(driver_id AS UNSIGNED)
        """)
        drivers = cursor.fetchall()
        return jsonify({"success": True, "data": drivers})
    except mysql.connector.Error as e:
        app.logger.error(f"❌ Retrieval error: {e}")
        return jsonify({"success": False, "error": "Database error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/generate_quiz', methods=['GET'])
def generate_quiz():
    try:
        topics = {
            "Lewis Hamilton": ["Mercedes", "7-time World Champion", "Silver Arrows"],
            "Michael Schumacher": ["Ferrari", "Benetton", "7-time World Champion"],
            "Ayrton Senna": ["McLaren", "Honda", "3-time World Champion"],
            "Max Verstappen": ["Red Bull Racing", "World Champion", "Dutch GP"]
        }

        incorrect = [
            "MotoGP", "NASCAR", "IndyCar", "Formula E",
            "WRC", "Le Mans", "Supercars", "DTM"
        ]

        person, correct_list = random.choice(list(topics.items()))
        correct_answer = random.choice(correct_list)
        wrong_choices = random.sample([opt for opt in incorrect if opt != correct_answer], 3)

        all_options = wrong_choices + [correct_answer]
        random.shuffle(all_options)

        return jsonify({
            "success": True,
            "quiz": {
                "question": f"Which of these is related to {person}?",
                "options": all_options,
                "correct_answer": correct_answer
            }
        })
    except Exception as e:
        app.logger.error(f"❌ Quiz generation error: {e}")
        return jsonify({"success": False, "error": "Quiz generation failed"}), 500

@app.route('/compare_drivers', methods=['POST'])
def compare_drivers():
    data = request.json
    driver1_id = data.get("driver1_id")
    driver2_id = data.get("driver2_id")

    if not driver1_id or not driver2_id:
        return jsonify({"success": False, "error": "Both driver IDs are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM drivers 
            WHERE driver_id = %s OR driver_id = %s
        """, (driver1_id, driver2_id))
        drivers = cursor.fetchall()

        if len(drivers) != 2:
            return jsonify({"success": False, "error": "One or both drivers not found"}), 404

        d1, d2 = drivers[0], drivers[1]
        if d1["driver_id"] != driver1_id:
            d1, d2 = d2, d1

        comparison_text = (
            f"Comparing {d1['driver_name']} and {d2['driver_name']}:\n"
            f"- {d1['driver_name']} drives car number {d1['carNo']} while {d2['driver_name']} drives car number {d2['carNo']}.\n"
            f"- {d1['driver_name']} has participated in {d1['no_of_races']} races, "
            f"whereas {d2['driver_name']} has participated in {d2['no_of_races']} races.\n"
            f"- They belong to teams {d1['team_id']} and {d2['team_id']} respectively.\n"
            f"Overall, both drivers have unique strengths and experiences that make them stand out in the Formula 1 circuit."
        )

        return jsonify({"success": True, "comparison": comparison_text})
    except mysql.connector.Error as e:
        app.logger.error(f"❌ Comparison error: {e}")
        return jsonify({"success": False, "error": "Comparison failed"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/remove_driver', methods=['POST'])
def remove_driver():
    data = request.json
    driver_id = data.get("driver_id")

    if not driver_id:
        return jsonify({"success": False, "error": "Driver ID is required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM drivers WHERE driver_id = %s", (driver_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"success": False, "error": "Driver not found"}), 404
        return jsonify({"success": True, "message": "Driver removed successfully"})
    except mysql.connector.Error as e:
        app.logger.error(f"❌ Delete error: {e}")
        return jsonify({"success": False, "error": "Database error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/get_entities', methods=['GET'])
def get_entities():
    category = request.args.get('category')
    if category == 'driver':
        return get_drivers()
    return jsonify({"success": False, "error": "Unsupported category"}), 400

import uuid
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload_profile_picture', methods=['POST'])
def upload_profile_picture():
    if not g.user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    if 'profile_picture' not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400

    file = request.files['profile_picture']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4()) + "_" + filename
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(save_path)

        # Update user's profile_picture in database
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE users SET profile_picture = %s WHERE username = %s", (unique_filename, g.user))
            conn.commit()
        except Exception as e:
            app.logger.error(f"Error updating profile picture: {e}")
            return jsonify({"success": False, "error": "Database update failed"}), 500
        finally:
            cursor.close()
            conn.close()

        return jsonify({"success": True, "filename": unique_filename})

    return jsonify({"success": False, "error": "Invalid file type"}), 400

@app.route('/profile')
def profile():
    if not g.user:
        return redirect(url_for('login'))
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT username, email, profile_picture FROM users WHERE username = %s", (g.user,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        flash("User not found", "danger")
        return redirect(url_for('login'))
    return render_template('profile.html', user=user)

if __name__ == '__main__':
    app.run(debug=False, port=5000)
