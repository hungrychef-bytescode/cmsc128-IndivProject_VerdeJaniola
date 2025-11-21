# from db.connection import get_db_connection

# def update_task(id, task):
#     try:
#         with get_db_connection() as conn:
#             conn.execute("UPDATE tasks SET task = ? WHERE id = ?",
#             (task, id))
#             conn.commit()
#             return {'success': True}, 200
#     except Exception as e:
#         print(f"Error adding task: {e}")
#         return {'error': 'Failed to update task'}

# def update_status(id, status):
#     try:
#         with get_db_connection() as conn:
#             conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, id))
#             conn.commit()
#             return {"message": "Status updated"}, 200
#     except Exception as e:
#         print(f"Error updating status: {e}")
#         return {"error": "Failed to update status"}, 500
    
# def update_due_date(id, due_date):
#     try:
#         with get_db_connection() as conn:
#             conn.execute("UPDATE tasks SET due_date = ? WHERE id = ?", (due_date, id))
#             conn.commit()
#             return {"message": "Due date updated"}, 200
#     except Exception as e:
#         print(f"Error updating due date: {e}")
#         return {"error": "Failed to update due date"}, 500
    
# def update_priority(id, priority):
#     try:
#         with get_db_connection() as conn:
#             conn.execute("UPDATE tasks SET priority = ? WHERE id = ?", (priority, id))
#             conn.commit()
#             return {"message": "Priority updated"}, 200
#     except Exception as e:
#         print(f"Error updating due date: {e}")
#         return {"error": "Failed to update priority"}, 500


# Import the Flask-SQLAlchemy instance (db) and the Task model
from database import Task, database as db 

def update_task_field(task_id, field_name, new_value):
    try:
        task_to_update = Task.query.get(task_id)
        
        if task_to_update is None:
            return {"error": f"Task ID {task_id} not found"}, 404
        
        allowed_fields = ["task", "status", "due_date", "priority"]
        if field_name not in allowed_fields:
            return {"error": f"Invalid field: {field_name}"}, 400
            
        setattr(task_to_update, field_name, new_value)
        db.session.commit()
        
        return {"success": True, "message": f"{field_name} updated"}, 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating task field {field_name} for ID {task_id}: {e}")
        return {"error": f"Failed to update {field_name}"}, 500