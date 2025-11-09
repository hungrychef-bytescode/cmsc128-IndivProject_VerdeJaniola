from flask_sqlalchemy import SQLAlchemy

database = SQLAlchemy()

class Lists(database.Model):
    id = database.Column(database.Integer, primary_key = True)
    name = database.Column(database.String(100), nullable = False)
    is_collab = database.Column(database.Boolean, default = False)
    owner_id = database.Column(database.Integer,  database.ForeignKey("users.id"), nullable = False)

class CollabMembers(database.Model):
    id = database.Column(database.Integer, primary_key = True)
    list_id = database.Column(database.Integer,  database.ForeignKey("lists.id"), nullable = False)
    member_id = database.Column(database.Integer,  database.ForeignKey("users.id"), nullable = False)