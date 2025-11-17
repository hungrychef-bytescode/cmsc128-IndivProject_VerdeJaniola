from flask import Blueprint, request, jsonify, session
from account import Users
from decorator import login_required, list_access
from database import database, Lists, CollabMembers

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
    
    list_item = Lists.query.get(list_id)
    
    # Only owner can add members
    if list_item.owner_id != current_user_id:
        return jsonify({
            "success": False,
            "message": "Only the list owner can add members"
        })
    
    if not list_item.is_collab:
        return jsonify({
            "success": False,
            "message": "Cannot add members to a personal list"
        })
    
    # Find the user to add
    user_to_add = Users.query.filter(
        (Users.username == username_or_email) | (Users.email == username_or_email)
    ).first()
    
    if not user_to_add:
        return jsonify({
            "success": False,
            "message": "User not found"
        })
    
    # Can't add yourself
    if user_to_add.id == current_user_id:
        return jsonify({
            "success": False,
            "message": "You cannot add yourself to the list"
        })
    
    # Check if already a member
    existing_member = CollabMembers.query.filter_by(
        list_id=list_id,
        member_id=user_to_add.id
    ).first()
    
    if existing_member:
        return jsonify({
            "success": False,
            "message": f"{user_to_add.username} is already a member of this list"
        })
    
    # Add the member
    new_member = CollabMembers(list_id=list_id, member_id=user_to_add.id)
    database.session.add(new_member)
    database.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"Successfully added {user_to_add.username} to {list_item.name}"
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
        members = CollabMembers.query.filter_by(list_id=lst.id).all()
        member_usernames = [Users.query.get(m.member_id).username for m in members]
        
        owned_lists_data.append({
            "id": lst.id,
            "name": lst.name,
            "owner": Users.query.get(lst.owner_id).username,
            "members": member_usernames,
            "member_count": len(member_usernames)
        })

    # Get lists where user is a member
    member_records = CollabMembers.query.filter_by(member_id=current_user_id).all()
    member_list_ids = [record.list_id for record in member_records]
    member_collab_lists = Lists.query.filter(Lists.id.in_(member_list_ids)).all()
    

    
    #format list info where user is added as collaborator
    member_lists_data = []

    for lst in member_collab_lists:
        members = CollabMembers.query.filter_by(list_id=lst.id).all()
        member_usernames = [Users.query.get(m.member_id).username for m in members]
        
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
    new_list = Lists(name=list_name, is_collab=is_collab, owner_id=current_user_id)
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