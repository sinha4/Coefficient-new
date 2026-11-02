# React + FastAPI starter

This repository keeps the frontend and backend in separate folders:

- `frontend/` — React, TypeScript, and Vite
- `backend/` — FastAPI

## Run the backend

From the repository root:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive API docs are available at
`http://localhost:8000/docs`.

## Run the frontend

In another terminal, from the repository root:

```sh
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).
The frontend checks `GET /api/health` on the backend at startup.

To point the frontend at a different API URL, copy `frontend/.env.example` to
`frontend/.env` and update `VITE_API_URL`. For a different frontend origin,
update the allowed origin in `backend/app/main.py`.
