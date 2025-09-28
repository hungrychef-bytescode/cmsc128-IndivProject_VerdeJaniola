import sqlite3
from .connection import db_path


#set-ups the database
def init_db():
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
    except sqlite3.OperationalError as e:     #catch operational errors
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    init_db()   #run the init_db function if this file is run directly