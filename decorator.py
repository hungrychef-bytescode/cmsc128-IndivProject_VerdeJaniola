from functools import wraps
from flask import session, jsonify
from database import Lists, CollabMembers

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if session.get("user_id"):
            return f(*args, **kwargs)
        return jsonify({"message": "Authentication required"})
    return wrapper

from functools import wraps
from flask import session, jsonify

def list_access(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = session.get("user_id")
        list_id = session.get("active_list")

        if user_id and list_id:
            owns = Lists.query.filter_by(id=list_id, owner_id=user_id).first()
            collab = CollabMembers.query.filter_by(list_id=list_id, member_id=user_id).first()

            if owns or collab:
                return f(*args, **kwargs)
            
        return jsonify({"message": "List access denied"})

    return wrapper

