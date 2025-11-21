# from db.connection import get_db_connection
# from crud.format import format_tasks

# def get_tasks(list_id):
#     try:
#         with get_db_connection() as conn:
#             if conn is None:
#                 return []
#             tasks = conn.execute("SELECT id, task, timestamp, priority, status, due_date FROM tasks WHERE list_id = ?", (list_id,)).fetchall()
#             print("Fetching tasks for list_id:", list_id)
#             print("Returned tasks:", tasks)
#             return format_tasks(tasks)
#     except Exception as e:
#         print(f"Error retrieving tasks: {e}")
#         return []

# Import the Flask-SQLAlchemy instance (db) and the Task model
from database import Task, database as db 
from crud.format import format_tasks 

def get_tasks(list_id):
    try:
        tasks = Task.query.filter(Task.list_id == list_id).all()
        
        print("Fetching tasks for list_id:", list_id)
        return format_tasks(tasks)
        
    except Exception as e:
        print(f"Error retrieving tasks: {e}")
        return []