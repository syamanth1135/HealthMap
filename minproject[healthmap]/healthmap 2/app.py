from flask import Flask, render_template, redirect, url_for, request, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import requests,logging
from disease_mapping import get_specialization
from flask import jsonify
from disease_mapping import SpecializationDiseaseMappingSchema
app = Flask(__name__)
app.secret_key = 'a22e0bcb85f435b8dbafc0e3722a2d69'
logging.basicConfig(level=logging.DEBUG)
def get_db_connection():
    try:
        conn= mysql.connector.connect(
            host="localhost",
            user="root",
            password="2005",
            database="healthmap")
        return conn
    except mysql.connector.Error as e:
        logging.error(f"Error connecting to the database: {e}")
        return None
def get_db_cursor():
    conn = get_db_connection()
    if conn:
        return conn.cursor(dictionary=True), conn
    return None, None
@app.route('/create_account', methods=['GET', 'POST'])
def create_account():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if not username or not password:
            return redirect(url_for('create_account'))
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        max_retries = 3  
        for attempt in range(max_retries):
            with get_db_connection() as conn:
                if not conn:
                    return redirect(url_for('create_account'))
                with conn.cursor() as cursor:
                    try:
                        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
                        conn.commit()
                        return redirect(url_for('dashboard'))
                    except mysql.connector.errors.DatabaseError as e:
                        if "Lock wait timeout exceeded" in str(e):
                            if attempt < max_retries - 1:
                                continue 
                            else:
                                return redirect(url_for('create_account'))
                        else:
                            return redirect(url_for('create_account'))
                    finally:
                        if cursor:
                            cursor.close()
                        if conn:
                            conn.close()
    return render_template('create_account.html')
@app.route('/')
def home():
    return render_template('introduction.html')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if not username or not password:
            return redirect(url_for('login'))
    
        conn = get_db_connection()
        if not conn:
            return redirect(url_for('login'))
        cursor = conn.cursor()
        cursor.execute("SELECT password FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()  
        if user and check_password_hash(user[0], password):
            session['username'] = username 
            flash('Login successful!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password. Please try again.')
        cursor.close()
        conn.close()
    return render_template('login.html')

def geocode_location(location):
    try:
        location = location.strip()
        url = f"https://nominatim.openstreetmap.org/search?q={location}&format=json"
        headers = {
            "User-Agent": "YourAppName/1.0 (your.email@example.com)"}
        print(f"Querying API URL: {url}")
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code} for location: '{location}'")
            return None
        data = response.json()
        if data:
            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            return lat, lon
        else:
            print(f"Error: No data found for location: '{location}'. Please check your input.")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error: Failed to make the request for location: '{location}'. {e}")
        return None
@app.route('/specialization', methods=['GET', 'POST'])
def specialization_route():
    if request.method == 'POST':
        disease = request.form.get('disease')
        if not disease:
            return jsonify({"error": "Please provide a disease name."}), 400

        specializations = []
        for specialization, diseases in SpecializationDiseaseMappingSchema.items():
            if disease in diseases:
                specializations.append(specialization)
        if not specializations:
            return jsonify({"error": "No specializations found for the provided disease."}), 404
        return jsonify({"specializations": specializations})

    disease = request.args.get('disease')
    if disease:
        return specialization_route()  
    return render_template('specialization.html')

@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    if 'username' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        disease = request.form.get('disease', '').strip()
        input_location = request.form['location'].strip()
        user_lat = request.form.get('user_lat')
        user_lon = request.form.get('user_lon')
        if not disease or not input_location:
            return redirect(url_for('dashboard'))
        
        hospitals = find_hospitals_by_disease(disease)
        if not hospitals:
          
            specialization = get_specialization(disease)
            if specialization:
                logging.debug(f"Found specialization: {specialization}")
                
                hospitals = find_hospitals_by_specialization(specialization)
            else:
                return redirect(url_for('dashboard'))
        input_lat_lon = geocode_location(input_location)
        input_lat, input_lon = input_lat_lon
        hospitals = find_nearby_hospitals(input_lat, input_lon, disease)
        for hospital in hospitals:
            hospital['Directions_Link'] = get_directions_link(hospital['Hospital_ID'])
            if hospital['Directions_Link'] is None:
                hospital['Directions_Link'] = "No directions available" 
        if hospitals:
            for hospital in hospitals:
                original_link = hospital['Directions_Link']  
                modified_link = modify_google_maps_link(original_link, f"{user_lat},{user_lon}") 
                hospital['modified_directions_link'] = modified_link 
            return render_template('results.html', hospitals=hospitals, user_lat=user_lat, user_lon=user_lon)
        else:
            specialization = get_specialization(disease)
            if specialization:
                nearby_hospitals = find_nearby_hospitals(input_lat, input_lon, specialization)  
                for hospital in nearby_hospitals:
                    original_link = hospital['Directions_Link']  
                    modified_link = modify_google_maps_link(original_link, f"{user_lat},{user_lon}")  
                    hospital['modified_directions_link'] = modified_link  
                return render_template('results.html', hospitals=nearby_hospitals, user_lat=user_lat, user_lon=user_lon)
            else:
                return redirect(url_for('dashboard'))
    return render_template('dashboard.html')
@app.route('/disease_mapping', methods=['GET', 'POST'])
def disease_mapping():
    if request.method == 'POST':
        disease = request.form.get('disease')
        if not disease:
            return redirect(url_for('disease_mapping'))
        
        specialization = get_specialization(disease)
        if specialization:
            return redirect(url_for('dashboard', specialization=specialization))
        else:
            flash('No relevant specialization found for the provided disease.')
    return render_template('disease_mapping.html')
def find_hospitals_by_disease(disease):
    connection = get_db_connection()
    if not connection:
        logging.error('Failed to connect to the database.')
        return []
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT Hospital_ID, Hospital_Name, Specialization,About_Link FROM hospitalslist WHERE Specialization LIKE %s",(f"%{disease}%",))
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()
def find_hospitals_by_specialization(specialization):
    connection = get_db_connection()
    if not connection:
        logging.error('Failed to connect to the database.')
        return []
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT Hospital_ID, Hospital_Name, Specialization,About_Link FROM hospitalslist WHERE Specialization = %s",(specialization,))
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()
def get_directions_link(hospital_id):
    cursor, conn = get_db_cursor()
    if not conn:
        logging.error('Failed to connect to the database for directions link.')
        return None 
    try:
        cursor.execute("SELECT Directions_Link FROM hospitalslist WHERE Hospital_ID = %s", (hospital_id,))
        result = cursor.fetchone()
        if result is None:
            logging.warning(f"No directions link found for Hospital_ID: {hospital_id}")
            return None  
        return result['Directions_Link']  
    finally:
        cursor.close()
        conn.close()
def modify_google_maps_link(original_link, new_coordinates):
    parts = original_link.split('/')
    for i, part in enumerate(parts):
        if part.startswith("16.8656896,81.4907392"):
            parts[i] = new_coordinates  
            break
    modified_link = '/'.join(parts)
    return modified_link
def find_nearby_hospitals(lat, lon, specialization, initial_distance=10, increment=5, max_distance=50):
    connection = get_db_connection()
    if not connection:
        logging.error('Failed to connect to the database.')
        return []
    cursor = connection.cursor(dictionary=True)
    distance = initial_distance
    hospitals = []
    while distance <= max_distance:
        query = """
        SELECT Hospital_ID, Hospital_Name, Rating, Location, Contact_Number, Opening_Hours,About_Link,Directions_Link,
               (6371 * ACOS(COS(RADIANS(%s)) * COS(RADIANS(Latitude)) * COS(RADIANS(Longitude) - RADIANS(%s)) + 
               SIN(RADIANS(%s)) * SIN(RADIANS(Latitude)))) AS distance
        FROM hospitalslist  -- Ensure you are querying from the correct table
        WHERE Specialization LIKE %s
        HAVING distance < %s
        ORDER BY Rating DESC;        """
        try:
            cursor.execute(query, (lat, lon, lat, f"%{specialization}%", distance))
            hospitals = cursor.fetchall()
            if hospitals:  
                break
        except Exception as e:
            logging.error(f"Database query failed: {e}")
            return []       
        distance += increment  
    cursor.close()
    connection.close()
    return hospitals
def get_hospital_by_id(hospital_id):
    connection = get_db_connection()
    if not connection:
        logging.error('Failed to connect to the database.')
        return None  
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT Hospital_ID, Hospital_Name FROM hospitalslist WHERE Hospital_ID = %s", (hospital_id,))
        return cursor.fetchone()  
    finally:
        cursor.close()
@app.route('/submit_rating/<int:hospital_id>', methods=['POST'])
def submit_rating(hospital_id):
    rating = request.form.get('rating')
    username = session.get('username')  
    if not rating or not username:
        return redirect(request.referrer)
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("INSERT INTO reviews (Hospital_ID, Username, Rating) VALUES (%s, %s, %s)",(hospital_id, username, rating))
        connection.commit()
    except mysql.connector.Error as e:
        flash(f'An error occurred: {e}')
    finally:
        cursor.close()
        connection.close()
    return redirect(url_for('view_ratings', hospital_id=hospital_id))  
@app.route('/rating/<int:hospital_id>')
def rating(hospital_id):
    hospital = get_hospital_by_id(hospital_id)
    username = session.get('username')  
    return render_template('rating.html', hospital=hospital, username=username)  
@app.route('/view_ratings/<int:hospital_id>')
def view_ratings(hospital_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True) 
    cursor.execute("SELECT Hospital_Name FROM hospitalslist WHERE Hospital_ID = %s", (hospital_id,))
    hospital = cursor.fetchone()
    if hospital is None:
        return redirect(url_for('dashboard'))  
    cursor.execute("SELECT Username, Rating, Created_At FROM reviews WHERE Hospital_ID = %s", (hospital_id,))
    ratings = cursor.fetchall()
    cursor.close()
    connection.close()
    return render_template('view_ratings.html', hospital_name=hospital['Hospital_Name'], ratings=ratings)
if __name__ == '__main__':
    app.run(debug=True)