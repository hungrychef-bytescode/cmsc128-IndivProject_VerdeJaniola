from flask import (Blueprint, render_template, send_from_directory, 
                   request, jsonify, session)
from crud import read, create, delete, read_sort, update
from decorator import login_required, list_access

task_app = Blueprint("task", __name__)

@task_app.route("/index")
@login_required
@list_access
def index():
    list_id = session.get("active_list")
    tasks = read.get_tasks(list_id)
    print("Active list id:", session.get("active_list"))
    return render_template("index.html", tasks=tasks)

@task_app.route("/my_images/<filename>")
def custom_image(filename):
    return send_from_directory("my_images", filename)

@task_app.route("/tasks", methods=["GET"])
@login_required
@list_access
def fetch_tasks():
        list_id = session.get("active_list")
        sort_by = request.args.get("sort")
        order = request.args.get("order", "asc")
        if sort_by:
            tasks = read_sort.read_sorted_tasks(list_id, sort_by, order)
        else:
            tasks = read.get_tasks(list_id)
        print(f"Fetching tasks with sort_by={sort_by}, order={order}")
        print(f"Returned {len(tasks)} tasks") 
        return jsonify(tasks)

@task_app.route("/tasks", methods=["POST"])
@login_required
@list_access
def create_task():
    list_id = session.get("active_list")

    if not list_id:
        return jsonify({"message": "Not list id"})
    
    try:
        data = request.get_json() 
        create.add_task(
            data.get("task"),
            data.get("timestamp"),
            data.get("priority"),
            data.get("status", 0),
            data.get("due_date"),
            list_id
        )
        return jsonify({"success": True})
    except Exception as e:
        print("Error adding task:", e)
        return jsonify({"success": False, "error": str(e)})

@task_app.route("/tasks/<int:id>", methods=["DELETE"])
@login_required
@list_access
def delete_task(id):
    try:
        deleted = delete.remove_task(id)
        if deleted:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Task not found"})
    except Exception as e:
        print("Error adding task:", e)
        return jsonify({"success": False, "error": str(e)})

@task_app.route("/tasks/<int:id>/task", methods=["PUT"])
@login_required
@list_access
def update_task(id):
        task = request.get_json().get("task")
        if task is None:
            return jsonify({"error": "Missing task"})
        result = update.update_task(id, task)
        return jsonify(result)

@task_app.route("/tasks/<int:id>/status", methods=["PUT"])
@login_required
@list_access
def update_task_status(id):
        status = request.get_json().get("status")
        if status is None:
            return jsonify({"error": "Missing status"})
        result= update.update_status(id, status)
        return jsonify(result)

@task_app.route("/tasks/<int:id>/due_date", methods=["PUT"])
@login_required
@list_access
def update_task_due_date(id):
        due_date = request.get_json().get("due_date")
        if due_date is None:
            return jsonify({"error": "Missing due date"})
        result = update.update_due_date(id, due_date)
        return jsonify(result)

@task_app.route("/tasks/<int:id>/priority", methods=["PUT"])
@login_required
@list_access
def update_task_priority(id):
        priority = request.get_json().get("priority")
        if priority is None:
            return jsonify({"error": "Missing priority"})
        result = update.update_priority(id, priority)
        return jsonify(result)

# if __name__ == "__main__":
#     init_db(app)
#     app.run(debug=True)