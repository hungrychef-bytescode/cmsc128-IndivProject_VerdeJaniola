from flask import Blueprint, request, jsonify, session
from decorator import login_required, list_access
from database import database, Lists, Users

collab_app = Blueprint("collab", __name__)

# 1. Route for switching between Personal and Collaborative Lists
@collab_app.route("/switch_list/<int:list_id>", methods=["POST"])
@login_required
@list_access
def switch_list(list_id):    
    # Switch to the selected list
    session["active_list"] = list_id

    return jsonify({
        "success": True,
        "list_name": Lists.query.get(list_id).name
    })

# 2. Route for adding other users to Collaborative List
@collab_app.route("/add_member", methods=["POST"])
@login_required
@list_access
def add_member():
    current_user_id = session.get("user_id")
    
    info = request.get_json()
    list_id = info.get("list_id")
    username_or_email = info.get("username_or_email")
    
    if not list_id or not username_or_email:
        return jsonify({
            "success": False, 
            "message": "List ID and username/email are required"
            })
    
    list_details = Lists.query.get(list_id)
    
    if not list_details or list_details.owner_id != current_user_id or not list_details.is_collab:
        # Combined check for non-existent list, not owner, or not collab list
        return jsonify({
            "success": False, 
            "message": "Access denied or list is not collaborative"
            })
    
    user_to_add = Users.query.filter(
        (Users.username == username_or_email) | (Users.email == username_or_email)
    ).first()
    
    if not user_to_add:
        return jsonify({"success": False, "message": "User not found"})
    
    if user_to_add.id == current_user_id:
        return jsonify({
            "success": False, 
            "message": "You cannot add yourself to the list"
        })

    member_id = user_to_add.id
    
    # Check if already a member
    if member_id in list_details.member_ids:
        return jsonify({
            "success": False,
            "message": f"{user_to_add.username} is already a member of this list"
        })
    
    list_details.member_ids.append(member_id)
    # database.session.add(list_details)
    database.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"Successfully added {user_to_add.username} to {list_details.name}"
    })


# 3. Route for viewing all Lists
@login_required
@collab_app.route("/view_collab_lists", methods=["GET"])
def view_lists():
    # get logged in user id
    current_user_id = session.get("user_id")
    
    #get collab lists owned by user
    owned_collab_lists = Lists.query.filter_by( 
        owner_id=current_user_id, 
        is_collab=True
    ).all()
    
    #format owned lists info
    owned_lists_data = []

    for lst in owned_collab_lists:
        member_ids = lst.member_ids
        member_usernames = [Users.query.get(m).username for m in member_ids if m != lst.owner_id]
        
        owned_lists_data.append({
            "id": lst.id,
            "name": lst.name,
            "owner": Users.query.get(lst.owner_id).username,
            "members": member_usernames,
            "member_count": len(member_usernames)
        })

    all_collab_lists = Lists.query.filter_by(is_collab=True).all()
    member_lists_data = []
    
    for lst in all_collab_lists:
        if current_user_id in lst.member_ids and lst.owner_id != current_user_id:
            member_ids = lst.member_ids
            member_usernames = [Users.query.get(m).username for m in member_ids if m != lst.owner_id]
            
            member_lists_data.append({
                "id": lst.id,
                "name": lst.name,
                "is_owner": False,
                "owner": Users.query.get(lst.owner_id).username,
                "members": member_usernames,
            })
    
    #get personal lists
    personal_lists = Lists.query.filter_by(
        owner_id=current_user_id,
        is_collab=False
    ).all()

    # info for each personal list
    personal_lists_data = []
    for lst in personal_lists:
        personal_lists_data.append({ 
            "id": lst.id, 
            "name": lst.name, 
            "is_owner": True
        })

    return jsonify({
        "success": True,
        "personal_lists": personal_lists_data,
        "owned_collab_lists": owned_lists_data,
        "member_collab_lists": member_lists_data,
        "total_collab_lists": len(owned_lists_data) + len(member_lists_data)
    })

# Create new list
@collab_app.route("/create_list", methods=["POST"])
@login_required
def create_list():
    current_user_id = session.get("user_id")
    
    info = request.get_json()
    print("received JSON", info)
    list_name = info.get("list_name")
    is_collab = info.get("is_collab")
    
    if not list_name:
        return jsonify({
            "success": False,
            "message": "List name is required"
        })
    
    # Create the new list
    new_list = Lists(name=list_name, is_collab=is_collab, owner_id=current_user_id, member_ids=[])
    database.session.add(new_list)
    database.session.commit()

    session["active_list"] = new_list.id
    
    return jsonify({
        "success": True,
        "message": "List Successfully Created",
        "list_id": new_list.id,
        "list_name": new_list.name,
        "is_collab": new_list.is_collab
    })

# Get current active list info
@collab_app.route("/get_active_list", methods=["GET"])
@login_required
@list_access
def get_active_list():
    # get logged-in user and selected list
    current_user_id = session.get("user_id")
    active_list_id = session.get("active_list")
    
    active_list = Lists.query.get(active_list_id)
    
    if active_list:
        return jsonify({
        "success": True,
        "list_id": active_list.id,
        "list_name": active_list.name,
        "is_collab": active_list.is_collab,
        "is_owner": active_list.owner_id == current_user_id
    }) 
    
    else:
        return jsonify({
            "success": False,
            "message": "Active list not found"
        })