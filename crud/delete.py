from db.connection import get_db_connection

def remove_task(id):
    try:
        with get_db_connection() as conn:
            cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (id,))
            if cursor.rowcount == 0:
                return {"error": "Task not found"}, 404
            conn.commit()
            return {"message": "Task deleted successfully"}, 200
    except Exception as e:
        print(f"Error adding task: {e}")
        return {"error": "Failed to delete task"}, 500