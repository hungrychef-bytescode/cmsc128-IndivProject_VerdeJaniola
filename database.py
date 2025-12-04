from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin

database = SQLAlchemy()

# table for users
class Users(database.Model, UserMixin):
    id = database.Column (database.Integer, primary_key = True)
    full_name = database.Column(database.String(100), nullable = False)
    email = database.Column (database.String(100), nullable = False, unique = True)
    username = database.Column (database.String(100), nullable = False, unique = True)
    password = database.Column (database.String(100), nullable = False)
    active = database.Column(database.Boolean())
    fs_uniquifier = database.Column(database.String(255), unique=True, nullable=False)

# table for tasks
class Tasks(database.Model):
    id = database.Column(database.Integer, primary_key = True)
    task = database.Column(database.String(200), nullable = False)
    timestamp = database.Column(database.String(100), nullable = False)
    priority = database.Column(database.String(50), nullable = False)
    status = database.Column(database.Integer, nullable = False)
    due_date = database.Column(database.String(100))
    list_id = database.Column(database.Integer,  database.ForeignKey("lists.id"), nullable = False)

# table for lists
class Lists(database.Model):
    id = database.Column(database.Integer, primary_key = True)
    name = database.Column(database.String(100), nullable = False)
    is_collab = database.Column(database.Boolean, default = False)
    owner_id = database.Column(database.Integer,  database.ForeignKey("users.id"), nullable = False)

# !!!make this a column array
class CollabMembers(database.Model):
    id = database.Column(database.Integer, primary_key = True)
    list_id = database.Column(database.Integer,  database.ForeignKey("lists.id"), nullable = False)
    member_id = database.Column(database.Integer,  database.ForeignKey("users.id"), nullable = False)
