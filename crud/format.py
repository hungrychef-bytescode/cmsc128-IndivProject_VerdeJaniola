def format_task(task):
    return {
        "id": task["id"],
        "task": task["task"],
        "timestamp": task["timestamp"],
        "priority": task["priority"],
        "status": task["status"],
        "due_date": task["due_date"]
    }

def format_tasks(tasks):
    return [format_task(task) for task in tasks]