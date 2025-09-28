from db.connection import get_db_connection
from crud.format import format_tasks

def read_sorted_tasks(sort_by="timestamp", order="asc"):
    try:
        with get_db_connection() as conn:
            if conn is None:
                return []
            dir = "ASC" if order.lower() == "asc" else "DESC"

            if sort_by == "priority":
                query = f"""
                    SELECT * FROM tasks
                    ORDER BY 
                        CASE priority
                            WHEN 'High' THEN 1
                            WHEN 'Medium' THEN 2
                            WHEN 'Low' THEN 3
                        END {dir}
                """
            elif sort_by == "due_date":
                query = f"SELECT * FROM tasks ORDER BY due_date {dir}"
            else:
                query = f"SELECT * FROM tasks ORDER BY timestamp {dir}"

            tasks = conn.execute(query).fetchall()
            return format_tasks(tasks)
    except Exception as e:
        print(f"Error sorting tasks: {e}")
        return []