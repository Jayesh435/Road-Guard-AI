"""
RoadGuard AI – FastAPI Inference Service
========================================
Exposes a /detect endpoint that accepts a road image and returns:
  - damage_type    (pothole | crack | erosion | unknown)
  - confidence     (0–1)
  - bounding_box   ([x, y, w, h] in pixels)
  - severity_score (0–100 composite)
  - all_detections (full list of YOLO boxes)
"""

import os
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

from inference import run_inference

load_dotenv()

app = FastAPI(
    title="RoadGuard AI – Damage Detection Service",
    description="YOLOv8-based road damage detection API",
    version="1.0.0",
)

# ── Health check ──────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "roadguard-ai-service"}


# ── Main detection endpoint ───────────────────────────────────────────────
@app.post("/detect")
async def detect_damage(file: UploadFile = File(...)):
    """
    Accept an uploaded road image and return damage detection results.

    Returns:
        damage_type    – Most prominent damage class detected
        confidence     – Confidence of the top detection (0–1)
        bounding_box   – [x, y, width, height] of the top detection box
        severity_score – 0–100 composite severity
        all_detections – Full list of detection objects
    """
    # Validate content type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted")

    image_bytes = await file.read()

    try:
        result = run_inference(image_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(exc)}")

    return JSONResponse(content=result)


# ── Entrypoint ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    host = os.getenv("AI_HOST", "0.0.0.0")
    port = int(os.getenv("AI_PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=False)
