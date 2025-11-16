from flask import Flask
from account import account_app, Config, mail, security, Users
from flask_security import SQLAlchemyUserDatastore
from collab import collab_app
from db import init_db
from database import database
from task import task_app

todo_app = Flask(__name__)
todo_app.config.from_object(Config)

database.init_app(todo_app)
mail.init_app(todo_app)
user_datastore = SQLAlchemyUserDatastore(database, Users, None)
security.init_app(todo_app, user_datastore, login_form = None, register_form = None )

todo_app.register_blueprint(account_app)
todo_app.register_blueprint(task_app)
todo_app.register_blueprint(collab_app)
init_db(todo_app)


if __name__ == "__main__":
    with todo_app.app_context():
        database.create_all()
    todo_app.run(debug = True)