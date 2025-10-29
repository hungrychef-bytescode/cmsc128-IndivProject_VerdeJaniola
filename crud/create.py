from db.connection import get_db_connection

def add_task(task, timestamp, priority, status, due_date):
    try:
        with get_db_connection() as conn:
            conn.execute("""
                INSERT INTO tasks (task, timestamp, priority, status, due_date)
                    VALUES (?, ?, ?, ?, ?)""",
                    (task, timestamp, priority, status, due_date)
            )
            conn.commit()
            print("Received:", task, timestamp, priority, status, due_date)
            return {"success": True}
    except Exception as e:
        print(f"Error adding task: {e}")
        return {'error': 'Failed to add task'}