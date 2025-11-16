from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from flask_security import UserMixin, Security
from database import database, Lists
from flask_mail import Mail
from flask_security.utils import hash_password, verify_and_update_password
import uuid
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

account_app = Blueprint("account", __name__)

class Config:
   SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
   SECRET_KEY = os.getenv("SECRET_KEY")
   
    # flask security configurations
    #enable password recovery features
   SECURITY_RECOVERABLE = True
   SECURITY_REGISTERABLE = False
   SECURITY_PASSWORD_HASH = "pbkdf2_sha512"
   SECURITY_RESET_PASSWORD_WITHIN = "5 minutes"
   SECURITY_EMAIL_SENDER = os.getenv("SECURITY_EMAIL_SENDER")
   SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT")

   MAIL_SERVER = "smtp.gmail.com"        #specify the gmail smtp server
   MAIL_PORT = 587                       #standart port number for TLS-encrypted emails (port to connect to smtp server)
   MAIL_USE_TLS = True                   #Transport Layer Security - protects email content&credentials between app and gmail
   MAIL_USERNAME = os.getenv("MAIL_USERNAME")
   MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")  #app password generated

   SECURITY_POST_RESET_VIEW = "/user_login"

mail = Mail()
security = Security()

# table for users
class Users(database.Model, UserMixin):
    id = database.Column (database.Integer, primary_key = True)
    full_name = database.Column(database.String(100), nullable = False)
    email = database.Column (database.String(100), nullable = False, unique = True)
    username = database.Column (database.String(100), nullable = False, unique = True)
    password = database.Column (database.String(100), nullable = False)
    active = database.Column(database.Boolean())
    fs_uniquifier = database.Column(database.String(255), unique=True, nullable=False)

# main page when development server is opened
@account_app.route("/")
def home():
    return render_template("signup.html")

# login page
@account_app.route("/user_login", methods=["GET"])
def login_page():
    return render_template("login.html")

# display the info of logged-in user
@account_app.route("/profile", methods=["GET"])
def profile():
    current_user = session.get("user_id")

    if not current_user:
        return redirect(url_for("home"))
    
    user = Users.query.get(current_user)
    return render_template("profile.html", user=user)

@account_app.route("/post_login", methods=["POST"])
def post_login():
    info = request.get_json()
    print("received JSON", info)
    login_id = info.get("login_id")
    password = info.get("password")

    #check that all fields are filled out.
    if not login_id or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        })
    
    # check if username or email exists
    current_user = Users.query.filter((Users.username == login_id) | (Users.email == login_id)).first()

    # if username/email doesnt exist:
    if not current_user:
        return jsonify({
            "success": False,
            "message": "Username or email does not exist."
        })
    
    # if password is incorrect
    if not verify_and_update_password(password, current_user):
        return jsonify({
            "success": False,
            "message": "Wrong password."
        })

    # successful log-in
    session["user_id"] = current_user.id
    personal_list = Lists.query.filter_by(owner_id=current_user.id, is_collab=False).first()
    session["active_list"] = personal_list.id
    return jsonify({
        "success": True,
        "message": "Successfully logged-in to your account"
    })

#logs the current user out
@account_app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

# update the email, username, full name of logged-in user
@account_app.route("/update_profile", methods = ["POST"])
def update_profile():
    current_user = session.get("user_id")
    print("Session user_id:", current_user)

    if not current_user:
        return jsonify({
            "success": False,
            "message": "Current user not in session"
        })

    user = Users.query.get(current_user)
    info = request.get_json()
    print("Received update info:", info)
    print("Current user before update:", user.full_name, user.username, user.email)

    update_full_name = info.get("full_name", user.full_name)
    update_username = info.get("username", user.username)
    update_email = info.get("email", user.email)

    # check that all fields are filled out
    if not update_full_name or not update_username or not update_email:
        return jsonify({
            "success": False,
            "message": "Missing some fields. All fields are required."
        })

    # check if new username already exists
    if Users.query.filter(Users.username == update_username, Users.id != user.id).first():
        return jsonify({
            "success": False,
            "message": "Username already exists."
        })
    
    # check if new email already exists
    if Users.query.filter(Users.email == update_email, Users.id != user.id).first():
        return jsonify({
            "success": False,
            "message": "Email already exists."
        })

    # update changes
    user.full_name = update_full_name
    user.username = update_username
    user.email = update_email
    database.session.commit()
    print("User after update:", user.full_name, user.username, user.email)

    return jsonify({
        "success": True,
        "message": "Changes saved. Profile info updated."
    })

# update password
@account_app.route("/update_password", methods = ["POST"])
def update_password():
    current_user = session.get("user_id")
    print("Session user_id:", current_user)

    if not current_user:
        return jsonify({
            "success": False,
            "message": "Current user not in session"
        })

    user = Users.query.get(current_user)
    info = request.get_json()
    print("Received update info:", info)
    print("Current user before update:", user.password)

    current_password = info.get("current_password")
    new_password = info.get("new_password")
    confirm_password = info.get("confirm_password")

    # check that all fields are filled out
    if not current_password or not new_password or not confirm_password:
        return jsonify({
            "success": False,
            "message": "Missing some fields. All fields are required."
        })
    
    if not verify_and_update_password(current_password, user):
        return jsonify({
            "success": False,
            "message": "Current password is incorrect."
        })
    
    if new_password != confirm_password:
        return jsonify({
            "success": False,
            "message": "New passwords do not match"
        })
    
    if len(new_password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters"
        })
    
    user.password = hash_password(new_password)
    database.session.commit()
    print("User after update:", user.password)

    return jsonify({
        "success": True,
        "message": "Password successfully updated."
    })

# adds the new user to database
@account_app.route("/signup", methods=["POST"])
def signup():
    info = request.get_json()
    print("received JSON", info)
    full_name = info.get("full_name")
    username = info.get("username")
    email = info.get("email")
    password = info.get("password")

    print("Database file used:", database.engine.url)

    # check that all fields are filled out
    if not full_name or not username or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        })
    
    # return if one or two are same
    # check if with same username
    if Users.query.filter_by(username=username).first():
        return jsonify({
            "success": False,
            "message": "Username already exists."
        })
    
    # check if with same email
    if Users.query.filter_by(email=email).first():
        return jsonify({
            "success": False,
            "message": "Email already exists."
        })
    
    # hash passwords saved to db
    hash_pw = hash_password(password)
    # add user to db
    user = Users(full_name=full_name, username=username, email=email, 
                password=hash_pw, active=True, fs_uniquifier=str(uuid.uuid4()))
    database.session.add(user)
    database.session.commit()

    personal_list = Lists(name = "My Personal List", is_collab = False, owner_id = user.id)
    database.session.add(personal_list)
    database.session.commit()

    session["user_id"] = user.id
    session["active_list"] = personal_list.id
    
    return jsonify({
        "success": True,
        "message": "Account Successfully Created"
    })

# if this file is run directly:
# if __name__ == "__main__":
#     # create the tables if they dont exist yet
#     with account_app.app_context():
#         database.create_all()
#     # start the flask development server
#     account_app.run(debug = True)