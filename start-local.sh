# Terminal 1: Start MongoDB
docker run -d -p 27017:27017 --name gdc-mongo mongo:7.0

# Terminal 2: Start Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
