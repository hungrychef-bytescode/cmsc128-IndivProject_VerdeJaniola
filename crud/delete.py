# from db.connection import get_db_connection

# def remove_task(id):
#     try:
#         with get_db_connection() as conn:
#             cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (id,))
#             if cursor.rowcount == 0:
#                 return False
#             conn.commit()
#             return True
#     except Exception as e:
#         print(f"Error adding task: {e}")
#         return jsonify({"error": "Failed to delete task"})

# Import the Flask-SQLAlchemy instance (db) and the Task model
from database import Task, database as db 
from flask import jsonify

def remove_task(task_id):
    try:
        task_to_delete = Task.query.get(task_id)
        
        if task_to_delete is None:
            return False
        
        db.session.delete(task_to_delete)
        db.session.commit()
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting task ID {task_id}: {e}")
        return jsonify({"error": "Failed to delete task"})