from db.connection import get_db_connection

def remove_task(id):
    try:
        with get_db_connection() as conn:
            cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (id,))
            if cursor.rowcount == 0:
                return False
            conn.commit()
            return True
    except Exception as e:
        print(f"Error adding task: {e}")
        return jsonify({"error": "Failed to delete task"})