# cmsc128-IndivProject_VerdeJaniola

Activity 1 TODO LIST

BACKEND:
We chose FLASK and SQLITE for the backend because it is lightweight, easy to use, manage, and good for small projects. 

HOW TO RUN:
Install the necessary dependencies for the framework (flask). Run the app.py in the main project folder and access the provided link in the console: http://127.0.0.1:5000/. This will open the interactive todo list webpage wherein the tasks created are connected to the database, task.db. First time running the app will create the db.

Example API endpoints:
For TASK DELETE /tasks/<id>
For TASK UPDATES: PUT /tasks/<int:id>/task, /tasks/<int:id>/status, /tasks/<int:id>/due_date, /tasks/<int:id>/priority
FOr TASK CREATION: POST /tasks
FOR TASK READ/VIEW: GET /tasks