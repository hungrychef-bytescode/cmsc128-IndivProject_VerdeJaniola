from flask import Blueprint, request, jsonify, session
from account import Users
from database import database, Lists, CollabMembers


collab_app = Blueprint("collab", __name__)

# route for switching

# route for adding

# route for viewing


#create list
@collab_app.route("/create_list", methods=["POST"])
def create_list():
    info = request.get_json()
    print("received JSON", info)
    list_name = info.get("list_name")
    is_collab = info.get("is_collab")
    

    new_list = Lists(name = , is_collab = is_collab, owner_id = user.id)
    database.session.add(new_list)
    database.session.commit()

    session["active_list"] = new_list.id
    
    return jsonify({
        "success": True,
        "message": "List Successfully Created"
    })