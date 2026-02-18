import os
import sys

# Add the current directory to sys.path so we can import 'app'
sys.path.append(os.getcwd())

print("Creating app...")
from app.main import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
print("App created. Entering app context...")
with app.app_context():
    print("In app context. Executing ALTER TABLE...")
    try:
        # Check if column exists first
        result = db.session.execute(text("SHOW COLUMNS FROM users LIKE 'phone_number'"))
        if result.fetchone():
            print("Column 'phone_number' already exists.")
        else:
            db.session.execute(text('ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL AFTER provider_id'))
            db.session.commit()
            print('Successfully added phone_number column')
    except Exception as e:
        print(f'Error: {e}')
        db.session.rollback()
print("Done.")
