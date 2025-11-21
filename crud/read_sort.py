# from db.connection import get_db_connection
# from crud.format import format_tasks

# def read_sorted_tasks(list_id, sort_by="timestamp", order="asc"):
#     try:
#         with get_db_connection() as conn:
#             if conn is None:
#                 return []
#             dir = "ASC" if order.lower() == "asc" else "DESC"

#             if sort_by == "priority":
#                 query = f"""
#                     SELECT id, task, timestamp, priority, status, due_date FROM tasks
#                     WHERE list_id = ?
#                     ORDER BY 
#                         CASE priority
#                             WHEN "High" THEN 3
#                             WHEN "Medium" THEN 2
#                             WHEN "Low" THEN 1
#                         END {dir}
#                 """
#             elif sort_by == "due_date":
#                 query = f"SELECT id, task, timestamp, priority, status, due_date FROM tasks WHERE list_id = ? ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date {dir}"
#             else:
#                 query = f"SELECT id, task, timestamp, priority, status, due_date FROM tasks WHERE list_id = ? ORDER BY timestamp {dir}"

#             tasks = conn.execute(query, (list_id,)).fetchall()
#             return format_tasks(tasks)
#     except Exception as e:
#         print(f"Error sorting tasks: {e}")
#         return []


from database import Task, database as db 
from sqlalchemy import case, asc, desc
from crud.format import format_tasks 

def read_sorted_tasks(list_id, sort_by="timestamp", order="asc"):
    try:
        query = Task.query.filter(Task.list_id == list_id)
        
        sort_dir = asc if order.lower() == "asc" else desc

        if sort_by == "priority":
            priority_order = case(
                (Task.priority == "High", 3),
                (Task.priority == "Medium", 2),
                (Task.priority == "Low", 1),
                else_=0 
            )
            query = query.order_by(sort_dir(priority_order))
            
        elif sort_by == "due_date":
            query = query.order_by(
                case(
                    (Task.due_date.is_(None), 1),
                    else_=0
                ),
                sort_dir(Task.due_date)
            )
            
        else:
            query = query.order_by(sort_dir(Task.timestamp))

        tasks = query.all()
        
        return format_tasks(tasks)
        
    except Exception as e:
        print(f"Error sorting tasks: {e}")
        return []