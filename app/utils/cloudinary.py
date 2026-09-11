# app/utils/cloudinary.py

import asyncio
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import HTTPException
from typing import Union
from starlette.datastructures import UploadFile
from pathlib import Path

# Explicitly load .env from the *backend root* (app/.env)
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

# Validate required environment variables early
required_envs = {
    "CLOUDINARY_CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME"),
    "CLOUDINARY_API_KEY": os.getenv("CLOUDINARY_API_KEY"),
    "CLOUDINARY_API_SECRET": os.getenv("CLOUDINARY_API_SECRET"),
}

missing = [k for k, v in required_envs.items() if not v]
if missing:
    raise EnvironmentError(f"Missing required Cloudinary env vars: {', '.join(missing)}")

cloudinary.config(
    cloud_name=required_envs["CLOUDINARY_CLOUD_NAME"],
    api_key=required_envs["CLOUDINARY_API_KEY"],
    api_secret=required_envs["CLOUDINARY_API_SECRET"],
    secure=True
)

# Define allowed user emails
ALLOWED_EMAILS = {"jjparedez3@gmail.com", "surfaceclean111@yahoo.com"}

async def upload_image(file: Union[str, UploadFile], current_user_email: str, folder: str = "surface_clean") -> str:
    if current_user_email not in ALLOWED_EMAILS:
        raise HTTPException(status_code=403, detail="Not authorized to upload images.")

    def _upload():
        return cloudinary.uploader.upload(
            file,
            folder=folder,
            transformation=[
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _upload)
        return {
            "secure_url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
    
def extract_public_id(url: str, folder: str = "surface_clean") -> str:
    # Ex: https://res.cloudinary.com/demo/image/upload/v123456/surface_clean/filename.jpg
    # Returns: surface_clean/filename (no extension)
    from urllib.parse import urlparse
    path = urlparse(url).path  # /demo/image/upload/v123456/surface_clean/filename.jpg
    parts = path.split('/')
    folder_index = parts.index(folder)
    public_id_with_ext = '/'.join(parts[folder_index:])  # surface_clean/filename.jpg
    public_id = public_id_with_ext.rsplit('.', 1)[0]  # surface_clean/filename
    return public_id

async def delete_image(url: str, folder: str = "surface_clean") -> None:
    public_id = extract_public_id(url, folder)
    def _delete():
        return cloudinary.uploader.destroy(public_id)

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _delete)

    if result.get("result") != "ok":
        raise Exception(f"Cloudinary delete failed: {result}")