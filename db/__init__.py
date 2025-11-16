import sqlite3
import os

# initialize the database and table
def init_db(app):
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    instance_path = os.path.join(project_root, "instance")
    os.makedirs(instance_path, exist_ok=True)
    db_path = os.path.join(instance_path, "database.db")

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
                    due_date TEXT, 
                    list_id INTEGER NOT NULL,
                    FOREIGN KEY (list_id) REFERENCES lists(id))
            """) #create the tasks table if it doesn't exist
            conn.commit()
            print("Database created.")
    except sqlite3.OperationalError as e:     #catch operational errors
        print(f"Database init error: {e}")