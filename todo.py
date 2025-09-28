from flask import Flask
from db.init_db import init_db
from routes import setup_routes

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    init_db()
    setup_routes(app)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)