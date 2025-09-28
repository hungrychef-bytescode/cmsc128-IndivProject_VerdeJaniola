from flask import request, jsonify
from crud import create, read, read_sort, update, delete

def task_routes(app):
    @app.route('/tasks', methods=['GET'])
    def fetch_tasks():
        sort_by = request.args.get("sort")
        order = request.args.get("order", "asc")
        tasks = read_sort.read_sorted_tasks(sort_by, order) if sort_by else read.get_tasks()
        return jsonify(tasks)

    @app.route('/tasks', methods=['POST'])
    def create_task():
        data = request.get_json()
        result = create.add_task(
            data.get("task"),
            data.get("timestamp"),
            data.get("priority"),
            data.get("status", 0),
            data.get("due_date")
        )
        return jsonify(result)

    @app.route('/tasks/<int:id>', methods=['DELETE'])
    def delete_task(id):
        return delete.remove_task(id)

    @app.route('/tasks/<int:id>', methods=['PUT'])
    def update_task_route(id):
        data = request.get_json()
        result = update.update_task(
            id,
            data.get("task"),
            data.get("priority"),
            data.get("status"),
            data.get("due_date")
        )
        return jsonify(result), 500 if "error" in result else 200

    @app.route('/tasks/<int:id>/status', methods=['PUT'])
    def update_task_status(id):
        status = request.get_json().get("status")
        if status is None:
            return jsonify({"error": "Missing status"}), 400
        result, code = update.update_status(id, status)
        return jsonify(result), code

    @app.route('/tasks/<int:id>/due_date', methods=['PUT'])
    def update_task_due_date(id):
        due_date = request.get_json().get("due_date")
        if due_date is None:
            return jsonify({"error": "Missing due date"}), 400
        result, code = update.update_due_date(id, due_date)
        return jsonify(result), code
