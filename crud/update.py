from db.connection import get_db_connection

def update_task(id, task):
    try:
        with get_db_connection() as conn:
            conn.execute("UPDATE tasks SET task = ? WHERE id = ?",
            (task, id))
            conn.commit()
            return {"success": True}
    except Exception as e:
        print(f"Error adding task: {e}")
        return {"error": "Failed to update task"}

def update_status(id, status):
    try:
        with get_db_connection() as conn:
            conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, id))
            conn.commit()
            return {"message": "Status updated"}
    except Exception as e:
        # print(f"Error updating status: {e}")
        return {"error": "Failed to update status"}
    
def update_due_date(id, due_date):
    try:
        with get_db_connection() as conn:
            conn.execute("UPDATE tasks SET due_date = ? WHERE id = ?", (due_date, id))
            conn.commit()
            return {"message": "Due date updated"}
    except Exception as e:
        # print(f"Error updating due date: {e}")
        return {"error": "Failed to update due date"}
    
def update_priority(id, priority):
    try:
        with get_db_connection() as conn:
            conn.execute("UPDATE tasks SET priority = ? WHERE id = ?", (priority, id))
            conn.commit()
            return {"message": "Priority updated"}
    except Exception as e:
        # print(f"Error updating due date: {e}")
        return {"error": "Failed to update priority"}