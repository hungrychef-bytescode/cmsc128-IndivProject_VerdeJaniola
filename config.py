from flask_mail import Mail
from flask_security import Security
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

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