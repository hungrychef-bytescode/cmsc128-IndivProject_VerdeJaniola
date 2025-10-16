from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# ---------- DATABASE SETUP ----------
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# ---------- HELPER FUNCTIONS ----------
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# ---------- ROUTES ----------
@app.route('/')
def home():
    # Renders your HTML file (in templates folder)
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if email or username already exists
    cursor.execute('SELECT * FROM users WHERE email=? OR username=?', (email, username))
    existing_user = cursor.fetchone()
    if existing_user:
        conn.close()
        return jsonify({'success': False, 'message': 'Email or username already exists.'})

    cursor.execute('INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)',
                   (name, email, username, password))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Account created successfully!'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier')  # username or email
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM users 
        WHERE (email = ? OR username = ?) AND password = ?
    ''', (identifier, identifier, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({
            'success': True,
            'message': 'Login successful!',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'username': user['username']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials.'})

@app.route('/update_profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    user_id = data.get('id')
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if username taken by someone else
    cursor.execute('SELECT * FROM users WHERE username=? AND id != ?', (username, user_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({'success': False, 'message': 'Username already taken.'})

    if password:
        cursor.execute('UPDATE users SET name=?, username=?, password=? WHERE id=?',
                       (name, username, password, user_id))
    else:
        cursor.execute('UPDATE users SET name=?, username=? WHERE id=?',
                       (name, username, user_id))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Profile updated successfully!'})

# ---------- MAIN ----------
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
