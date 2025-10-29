import sqlite3
import os

# initialize the database and table
def init_db(app):
    db_path = os.path.join(app.instance_path, "database.db")
    os.makedirs(app.instance_path, exist_ok=True)
    try:
        with sqlite3.connect(db_path) as conn:       #connect the sqlite to the db path
            cursor = conn.cursor()
            cursor.execute(""" 
                CREATE TABLE IF NOT EXISTS tasks(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    status INTEGER NOT NULL,
                    due_date TEXT)
            """) #create the tasks table if it doesn't exist
            conn.commit()
            print("Database created.")
    except sqlite3.OperationalError as e:     #catch operational errors
        print(f"Database init error: {e}")