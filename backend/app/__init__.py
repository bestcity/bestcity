# bestcity/backend/app/__init__.py
from flask import Flask
import flask_cors
from .services.camera_service import CameraService

def create_app():
    """Initialize the Flask application"""
    app = Flask(__name__)
    flask_cors.CORS(app)
    
    # Initialize services
    app.camera_service = CameraService()
    
    # Register blueprints
    from .api.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    return app