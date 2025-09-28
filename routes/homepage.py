from flask import render_template, send_from_directory
from db.connection import get_db_connection

def homepage_route(app):
    @app.route('/')
    def index():
        conn = get_db_connection()
        return render_template("index.html")

    @app.route('/my_images/<filename>')
    def custom_image(filename):
        return send_from_directory('my_images', filename)
