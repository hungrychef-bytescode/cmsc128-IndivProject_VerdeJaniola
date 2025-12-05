from functools import wraps
from flask import session, jsonify
from database import Lists

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if session.get("user_id"):
            return f(*args, **kwargs)
        else:
            return jsonify({"message": "Authentication required"}), 401
    return wrapper

def list_access(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        
        list_id = kwargs.get('list_id') or session.get('active_list')
        
        if not user_id or not list_id:
            return jsonify({'success': False, 'message': 'Missing user or list context'}), 400

        list_details = Lists.query.get(list_id)
        
        if not list_details:
            return jsonify({'success': False, 'message': 'List not found'}), 404

        if list_details.owner_id == user_id:
            return f(*args, **kwargs)
        
        if list_details.is_collab and user_id in list_details.member_ids:
            return f(*args, **kwargs)
        
        # If not owner or collaborator, deny access
        return jsonify({'success': False, 'message': 'Access denied to this list'}), 403
        
    return decorated_function