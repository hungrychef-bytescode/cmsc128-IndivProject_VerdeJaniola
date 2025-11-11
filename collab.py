from flask import Blueprint, jsonify, request, session
from database import database, Lists, CollabMembers
from account import Users
from decorator import login_required

collab_app = Blueprint("collab", __name__)

# Route 1: Create a new collaborative list
@collab_app.route("/lists", methods=["POST"])
@login_required
def create_list():
    try:
        data = request.get_json()
        user_id = session.get("user_id")
        
        new_list = Lists(
            name=data.get("name"),
            is_collab=data.get("is_collab", False),
            owner_id=user_id
        )
        
        database.session.add(new_list)
        database.session.commit()
        
        return jsonify({
            "success": True,
            "list_id": new_list.id,
            "message": "List created successfully"
        })
    except Exception as e:
        database.session.rollback()
        return jsonify({"success": False, "error": str(e)})

# Route 2: Get all lists (personal and collaborative) for current user
@collab_app.route("/lists", methods=["GET"])
@login_required
def get_lists():
    try:
        user_id = session.get("user_id")
        
        # Get lists owned by user
        owned_lists = Lists.query.filter_by(owner_id=user_id).all()
        
        # Get collaborative lists user is a member of
        collab_memberships = CollabMembers.query.filter_by(member_id=user_id).all()
        collab_list_ids = [m.list_id for m in collab_memberships]
        collab_lists = Lists.query.filter(Lists.id.in_(collab_list_ids)).all() if collab_list_ids else []
        
        # Format response
        all_lists = {
            "personal": [
                {
                    "id": lst.id,
                    "name": lst.name,
                    "is_collab": lst.is_collab,
                    "is_owner": True
                }
                for lst in owned_lists
            ],
            "collaborative": [
                {
                    "id": lst.id,
                    "name": lst.name,
                    "owner_id": lst.owner_id,
                    "is_owner": False
                }
                for lst in collab_lists
            ]
        }
        
        return jsonify({"success": True, "lists": all_lists})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# Route 3: Switch active list
@collab_app.route("/lists/<int:list_id>/switch", methods=["POST"])
@login_required
def switch_list(list_id):
    try:
        user_id = session.get("user_id")
        
        # Check if user has access to this list
        owns = Lists.query.filter_by(id=list_id, owner_id=user_id).first()
        collab = CollabMembers.query.filter_by(list_id=list_id, member_id=user_id).first()
        
        if owns or collab:
            session["active_list"] = list_id
            return jsonify({
                "success": True,
                "message": "Switched to list successfully",
                "active_list": list_id
            })
        else:
            return jsonify({"success": False, "error": "Access denied"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# Route 4: Add member to collaborative list
@collab_app.route("/lists/<int:list_id>/members", methods=["POST"])
@login_required
def add_member(list_id):
    try:
        user_id = session.get("user_id")
        data = request.get_json()
        
        # Check if current user owns this list
        list_obj = Lists.query.filter_by(id=list_id, owner_id=user_id).first()
        if not list_obj:
            return jsonify({"success": False, "error": "Only list owner can add members"})
        
        # Find user to add (by username or email)
        username = data.get("username")
        email = data.get("email")
        
        if username:
            new_member = Users.query.filter_by(username=username).first()
        elif email:
            new_member = Users.query.filter_by(email=email).first()
        else:
            return jsonify({"success": False, "error": "Username or email required"})
        
        if not new_member:
            return jsonify({"success": False, "error": "User not found"})
        
        # Check if already a member
        existing = CollabMembers.query.filter_by(
            list_id=list_id,
            member_id=new_member.id
        ).first()
        
        if existing:
            return jsonify({"success": False, "error": "User already a member"})
        
        # Add member
        collab_member = CollabMembers(
            list_id=list_id,
            member_id=new_member.id
        )
        
        database.session.add(collab_member)
        database.session.commit()
        
        return jsonify({
            "success": True,
            "message": f"Added {new_member.username} to the list"
        })
    except Exception as e:
        database.session.rollback()
        return jsonify({"success": False, "error": str(e)})

# Route 5: Get members of a collaborative list
@collab_app.route("/lists/<int:list_id>/members", methods=["GET"])
@login_required
def get_members(list_id):
    try:
        user_id = session.get("user_id")
        
        # Check if user has access to this list
        owns = Lists.query.filter_by(id=list_id, owner_id=user_id).first()
        collab = CollabMembers.query.filter_by(list_id=list_id, member_id=user_id).first()
        
        if not (owns or collab):
            return jsonify({"success": False, "error": "Access denied"})
        
        # Get all members
        memberships = CollabMembers.query.filter_by(list_id=list_id).all()
        members = []
        
        for membership in memberships:
            user = Users.query.get(membership.member_id)
            if user:
                members.append({
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": user.full_name
                })
        
        # Get owner info
        list_obj = Lists.query.get(list_id)
        owner = Users.query.get(list_obj.owner_id)
        
        return jsonify({
            "success": True,
            "owner": {
                "id": owner.id,
                "username": owner.username,
                "email": owner.email,
                "full_name": owner.full_name
            },
            "members": members
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# Route 6: Remove member from collaborative list
@collab_app.route("/lists/<int:list_id>/members/<int:member_id>", methods=["DELETE"])
@login_required
def remove_member(list_id, member_id):
    try:
        user_id = session.get("user_id")
        
        # Check if current user owns this list
        list_obj = Lists.query.filter_by(id=list_id, owner_id=user_id).first()
        if not list_obj:
            return jsonify({"success": False, "error": "Only list owner can remove members"})
        
        # Remove member
        membership = CollabMembers.query.filter_by(
            list_id=list_id,
            member_id=member_id
        ).first()
        
        if membership:
            database.session.delete(membership)
            database.session.commit()
            return jsonify({"success": True, "message": "Member removed"})
        else:
            return jsonify({"success": False, "error": "Member not found"})
    except Exception as e:
        database.session.rollback()
        return jsonify({"success": False, "error": str(e)})