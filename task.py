from flask import (Blueprint, render_template, send_from_directory, 
                   request, jsonify, session)
from decorator import login_required, list_access
from database import database, Tasks
from sqlalchemy import asc, desc

task_app = Blueprint("task", __name__)


@task_app.route("/my_images/<filename>")
def custom_image(filename):
    return send_from_directory("my_images", filename)

@task_app.route("/index")
@login_required
@list_access
def index():
    list_id = session.get("active_list")
    tasks = Tasks.query.filter_by(list_id=list_id).all()
    print("Active list id:", session.get("active_list"))
    return render_template("index.html", tasks=tasks)

@task_app.route("/tasks", methods=["GET"])
@login_required
@list_access
def fetch_tasks():
        list_id = session.get("active_list")
        sort_by = request.args.get("sort")
        order = request.args.get("order", "asc")
        query = Tasks.query.filter_by(list_id=list_id)
        if sort_by:
            sort = getattr(Tasks, sort_by, None)
            if sort:
                if order == "desc":
                    query = query.order_by(desc(sort))
                else:
                    query = query.order_by(asc(sort))
        tasks = query.all()
        print(f"Fetching tasks with sort_by={sort_by}, order={order}")
        print(f"Returned {len(tasks)} tasks")
        return jsonify ([
            {
            "id": task.id,
            "task": task.task,
            "timestamp": task.timestamp,
            "priority": task.priority,
            "status": task.status,
            "due_date": task.due_date
            } for task in tasks
        ])

@task_app.route("/tasks", methods=["POST"])
@login_required
@list_access
def create_task():
    list_id = session.get("active_list")

    if not list_id:
        return jsonify({"message": "Not list id"})
    
    try:
        info = request.get_json() 
        new_task = Tasks(
            task = info.get("task"),
            timestamp = info.get("timestamp"),
            priority = info.get("priority"),
            status = info.get("status", 0),
            due_date = info.get("due_date"),
            list_id = list_id
        )
        database.session.add(new_task)
        database.session.commit()
        return jsonify({
            "success": True,
            "message": "Task added successfully."})
    except Exception as e:
        database.session.rollback()
        print("Error adding task:", e)
        return jsonify({"success": False, "error": str(e)})

@task_app.route("/tasks/<int:id>", methods=["DELETE"])
@login_required
@list_access
def delete_task(id):
    try:
        task_to_delete = Tasks.query.get(id)
        
        if task_to_delete:
            database.session.delete(task_to_delete)
            database.session.commit()
            return jsonify({
                "success": True,
                "message": "Task deleted."
        })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete task."
            })
    except Exception as e:
        database.session.rollback()
        return jsonify({
            "success": False, 
            "error": "Internal Server Error"})

@task_app.route("/tasks/<int:id>/task", methods=["PUT"])
@login_required
@list_access
def update_task(id):
    task_input = request.get_json().get("task")
    task_obj = Tasks.query.get(id)

    if task_obj:
        task_obj.task = task_input
        database.session.commit()
        return jsonify({
            "success": True,
            "message": "Task updated."
        })
    else:
        return jsonify({
            "success": False,
            "message": "Failed to update task."
        })

@task_app.route("/tasks/<int:id>/status", methods=["PUT"])
@login_required
@list_access
def update_task_status(id):
    status = request.get_json().get("status")
    task = Tasks.query.get(id)

    if task:
        task.status = status
        database.session.commit()
        return jsonify({
            "success": True,
            "message": "Status updated."
        })
    else:
        return jsonify({
            "success": False,
            "message": "Failed to update status."
        })



@task_app.route("/tasks/<int:id>/due_date", methods=["PUT"])
@login_required
@list_access
def update_task_due_date(id):
    due_date = request.get_json().get("due_date")
    task = Tasks.query.get(id)

    if task:
        task.due_date = due_date
        database.session.commit()
        return jsonify({
            "success": True,
            "message": "Due date updated."
        })
    else:
        return jsonify({
            "success": False,
            "message": "Failed to update due date."
        })

    
@task_app.route("/tasks/<int:id>/priority", methods=["PUT"])
@login_required
@list_access
def update_task_priority(id):
    priority = request.get_json().get("priority")
    task = Tasks.query.get(id)

    if task:
        task.priority = priority
        database.session.commit()                
        return jsonify({
            "success": True,
            "message": "Priority updated."
        })
    else:
        return jsonify({
            "success": False,
            "message": "Failed to update priority."
        })
