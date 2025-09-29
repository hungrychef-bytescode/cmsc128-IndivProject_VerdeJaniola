from db.connection import get_db_connection
from crud.format import format_task 

def add_task(task, timestamp, priority, status, due_date):
    try:
        with get_db_connection() as conn:
            cursor =conn.execute("""
                INSERT INTO tasks (task, timestamp, priority, status, due_date)
                    VALUES (?, ?, ?, ?, ?)""",
                    (task, timestamp, priority, status, due_date)
            )
            conn.commit()
            task_id = cursor.lastrowid
            inserted = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return format_task(inserted), 201
    except Exception as e:
        print(f"Error adding task: {e}")
        return {'error': 'Failed to add task'}, 500

            
