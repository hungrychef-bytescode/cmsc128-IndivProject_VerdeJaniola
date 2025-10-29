from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore, UserMixin
from flask_mail import Mail
import uuid
from flask_security.utils import hash_password, verify_and_update_password



# create flask app instance
account_app = Flask(__name__)
# use sqlite database. create database.db
account_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
# secret key necessary for sessions
account_app.secret_key = "sk-vmjam-128assign2"

# initialize and connects/binds the database to the flask
database = SQLAlchemy(account_app)

# flask security configurations
#enable password recovery features
account_app.config["SECURITY_RECOVERABLE"] = True
account_app.config["SECURITY_REGISTERABLE"] = False
account_app.config["SECURITY_EMAIL_SENDER"] = "hungrychefbytescode@gmail.com"
account_app.config["SECURITY_PASSWORD_HASH"] = "pbkdf2_sha512"
account_app.config["SECURITY_PASSWORD_SALT"] = "sk-vmjam-128"
account_app.config["SECURITY_RESET_PASSWORD_WITHIN"] = "5 minutes"


# email configuration
account_app.config["MAIL_SERVER"] = "smtp.gmail.com"        #specify the gmail smtp server
account_app.config["MAIL_PORT"] = 587                       #standart port number for TLS-encrypted emails (port to connect to smtp server)
account_app.config["MAIL_USE_TLS"] = True                   #Transport Layer Security - protects email content&credentials between app and gmail
account_app.config["MAIL_USERNAME"] = "hungrychefbytescode@gmail.com"
account_app.config["MAIL_PASSWORD"] = "dnap nhhf oiwk uzut"

mail = Mail(account_app)

# table for users
class Users(database.Model, UserMixin):
    id = database.Column (database.Integer, primary_key = True)
    full_name = database.Column(database.String(100), nullable = False)
    email = database.Column (database.String(100), nullable = False, unique = True)
    username = database.Column (database.String(100), nullable = False, unique = True)
    password = database.Column (database.String(100), nullable = False)
    active = database.Column(database.Boolean())
    fs_uniquifier = database.Column(database.String(255), unique=True, nullable=False)

# configure flask-security
user_datastore = SQLAlchemyUserDatastore(database, Users, None)
security = Security()
security.init_app(account_app, user_datastore, login_form=None,
                  register_form=None)
# change redirect after reset to login page
account_app.config["SECURITY_POST_RESET_VIEW"] = "/user_login"

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

    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": "Account Successfully Created"
    })

# if this file is run directly:
if __name__ == "__main__":
    # create the tables if they dont exist yet
    with account_app.app_context():
        database.create_all()
    # start the flask development server
    account_app.run(debug = True)