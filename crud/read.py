from db.connection import get_db_connection
from crud.format import format_tasks

def get_tasks():
    try:
        with get_db_connection() as conn:
            if conn is None:
                return []
            tasks = conn.execute("SELECT * FROM tasks").fetchall()
            return format_tasks(tasks)
    except Exception as e:
        print(f"Error retrieving tasks: {e}")
        return []