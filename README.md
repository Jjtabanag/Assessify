# Assessify

## How to Run
1. **Create and Activate Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**
  ```bash
  pip install backend/requirements.txt
  cd frontend
  npm install 
  ```

3. **Run**
   Create two separate terminals
   - for backend
   ```bash
   py backend/manage.py runserver 
   ```
   - for frontend
   ```bash
   cd frontend
   npm start
   ```
