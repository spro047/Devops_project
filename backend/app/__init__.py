from flask import Flask
from flask_mongoengine import MongoEngine
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv(override=True)

db = MongoEngine()

def create_app():
    app = Flask(__name__)
    CORS(app) # Enable CORS for all routes
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-123')
    app.config['MONGODB_SETTINGS'] = {
        'host': os.environ.get('MONGODB_URI')
    }

    db.init_app(app)

    from app.routes import main
    app.register_blueprint(main)

    return app
