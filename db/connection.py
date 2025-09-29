import sqlite3
from contextlib import contextmanager

db_path = "instance/database.db"

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    except sqlite3.OperationalError as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        conn.close()