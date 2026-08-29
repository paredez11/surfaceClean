# app/main.py

import os
from fastapi import FastAPI
from routes import router
from config import settings
import logging
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Surface Clean API", debug=settings.DEBUG)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
origins = [FRONTEND_ORIGIN]  # single allowed origin

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

@app.on_event("startup")
async def startup_event():
    logging.info("Starting up the Surface Clean API")

@app.on_event("shutdown")
async def shutdown_event():
    logging.info("Shutting down the Surface Clean API")

app.include_router(router)

@app.get("/")
def root():
    return {"message": "Welcome to Surface Clean API"}