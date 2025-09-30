from flask import Flask, render_template, send_from_directory, request, jsonify
from db.connection import get_db_connection
from db import init_db
from crud import read, create, delete, format, read_sort, update

app = Flask(__name__)

@app.route("/")
def index():
    tasks = read.get_tasks()
    return render_template("index.html", tasks=tasks)

@app.route("/my_images/<filename>")
def custom_image(filename):
    return send_from_directory("my_images", filename)

@app.route("/tasks", methods=["GET"])
def fetch_tasks():
        sort_by = request.args.get("sort")
        order = request.args.get("order", "asc")
        tasks = read_sort.read_sorted_tasks(sort_by, order) if sort_by else read.get_tasks()
        print(f"Fetching tasks with sort_by={sort_by}, order={order}")
        print(f"Returned {len(tasks)} tasks") 
        return jsonify(tasks)

@app.route("/tasks", methods=["POST"])
def create_task():
    try:
        data = request.get_json() 
        create.add_task(
            data.get("task"),
            data.get("timestamp"),
            data.get("priority"),
            data.get("status", 0),
            data.get("due_date")
        )
        return jsonify({"success": True})
    except Exception as e:
        print("Error adding task:", e)
        return jsonify({"success": False, "error": str(e)})

@app.route("/tasks/<int:id>", methods=["DELETE"])
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

@app.route("/tasks/<int:id>/task", methods=["PUT"])
def update_task(id):
        task = request.get_json().get("task")
        if task is None:
            return jsonify({"error": "Missing task"})
        result = update.update_task(id, task)
        return jsonify(result)

@app.route("/tasks/<int:id>/status", methods=["PUT"])
def update_task_status(id):
        status = request.get_json().get("status")
        if status is None:
            return jsonify({"error": "Missing status"})
        result= update.update_status(id, status)
        return jsonify(result)

@app.route("/tasks/<int:id>/due_date", methods=["PUT"])
def update_task_due_date(id):
        due_date = request.get_json().get("due_date")
        if due_date is None:
            return jsonify({"error": "Missing due date"})
        result = update.update_due_date(id, due_date)
        return jsonify(result)

@app.route("/tasks/<int:id>/priority", methods=["PUT"])
def update_task_priority(id):
        priority = request.get_json().get("priority")
        if priority is None:
            return jsonify({"error": "Missing priority"})
        result = update.update_priority(id, priority)
        return jsonify(result)

if __name__ == "__main__":
    init_db()
    app.run(debug=True)