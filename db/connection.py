import sqlite3
from contextlib import contextmanager
import os
@contextmanager
def get_db_connection():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    db_path = os.path.join(project_root, "task.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    except sqlite3.OperationalError as e:
        print(f"Connection error occurred: {e}")
    finally:
        conn.close()