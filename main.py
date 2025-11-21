from flask import Flask
from account import account_app, Config, mail, security
from flask_security import SQLAlchemySessionUserDatastore
from collab import collab_app
# from db import init_db
from database import database, Users
from task import task_app

# initialize flask app
todo_app = Flask(__name__)
# configuration (secrets, mail)
todo_app.config.from_object(Config)

@todo_app.after_request
def after_request(response):
    response.headers["Cache-control"] = "no-cache, no-store, must-revalidate"
    return response

database.init_app(todo_app)
mail.init_app(todo_app)
user_datastore = SQLAlchemySessionUserDatastore(database.session, Users, None)
security.init_app(todo_app, user_datastore, login_form = None, register_form = None )

# Register all blueprints so their routes become part of this app
# used blueprints to organize and manage the separate/modularized account.py and task.py
todo_app.register_blueprint(account_app)
todo_app.register_blueprint(task_app)
todo_app.register_blueprint(collab_app)
# init_db(todo_app)

if __name__ == "__main__":
    with todo_app.app_context():
        database.create_all()
    todo_app.run(debug = True)