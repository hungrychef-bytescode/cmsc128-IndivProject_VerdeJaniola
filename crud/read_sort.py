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
                            WHEN "High" THEN 3
                            WHEN "Medium" THEN 2
                            WHEN "Low" THEN 1
                        END {dir}
                """
            elif sort_by == "due_date":
                query = f"SELECT * FROM tasks ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date {dir}"
            else:
                query = f"SELECT * FROM tasks ORDER BY timestamp {dir}"

            tasks = conn.execute(query).fetchall()
            return format_tasks(tasks)
    except Exception as e:
        print(f"Error sorting tasks: {e}")
        return []