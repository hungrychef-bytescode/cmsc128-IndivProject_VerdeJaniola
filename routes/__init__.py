from .homepage import homepage_route
from .tasks import task_routes

def setup_routes(app):
    homepage_route(app)
    task_routes(app)
