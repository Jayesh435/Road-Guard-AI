"""
RoadGuard AI – YOLOv8 Inference Module
=======================================
Loads the trained YOLOv8 model once at import time and exposes
``run_inference(image_bytes)`` for the FastAPI endpoint.

Severity score formula
----------------------
  severity = (bbox_area_ratio × 50) + (confidence × 50)
  - bbox_area_ratio: fraction of the image covered by the detection box
  - confidence: YOLO model confidence (0–1)
  Capped at 100 and rounded to the nearest integer.

Damage class mapping
--------------------
The RDD2022 dataset uses numeric class IDs 0–3.
  0 → pothole
  1 → crack
  2 → erosion
  3 → pothole   (longitudinal crack, mapped to pothole for simplicity)
"""

import io
import os
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
from PIL import Image

# ── Model loading ─────────────────────────────────────────────────────────
# We import YOLO lazily to allow the module to be imported in environments
# where ultralytics is not yet installed (e.g. during unit tests).

MODEL_PATH = os.getenv("MODEL_PATH", str(Path(__file__).parent / "model" / "best.pt"))

_model = None  # cached model instance

CLASS_MAP: Dict[int, str] = {
    0: "pothole",
    1: "crack",
    2: "erosion",
    3: "pothole",
}


def _load_model():
    """Load YOLOv8 model from disk (once per process)."""
    global _model
    if _model is None:
        model_path = Path(MODEL_PATH)
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model weights not found at {model_path}. "
                "Download the trained model or run training/train.py first."
            )
        from ultralytics import YOLO  # noqa: PLC0415
        _model = YOLO(str(model_path))
    return _model


def _compute_severity(bbox: List[float], img_w: int, img_h: int, confidence: float) -> int:
    """
    Compute a 0-100 severity score from bounding-box area and confidence.

    Args:
        bbox:       [x, y, w, h] in pixels
        img_w:      image width in pixels
        img_h:      image height in pixels
        confidence: YOLO confidence score (0–1)

    Returns:
        Integer severity score 0–100.
    """
    if img_w == 0 or img_h == 0:
        return 0
    x, y, w, h = bbox  # noqa: F841
    area_ratio = min((w * h) / (img_w * img_h), 1.0)
    score = (area_ratio * 50) + (confidence * 50)
    return int(min(round(score), 100))


def run_inference(image_bytes: bytes) -> Dict[str, Any]:
    """
    Run YOLOv8 inference on raw image bytes.

    Returns a dict with:
      damage_type, confidence, bounding_box, severity_score, all_detections
    """
    # Decode image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_w, img_h = image.size

    # Load model
    model = _load_model()

    # Run inference (confidence threshold 0.25, IoU 0.45)
    results = model.predict(
        source=np.array(image),
        conf=0.25,
        iou=0.45,
        verbose=False,
    )

    all_detections: List[Dict[str, Any]] = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            # xyxy → convert to [x, y, w, h]
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            bx, by, bw, bh = x1, y1, x2 - x1, y2 - y1
            severity = _compute_severity([bx, by, bw, bh], img_w, img_h, conf)
            all_detections.append(
                {
                    "damage_type": CLASS_MAP.get(cls_id, "unknown"),
                    "confidence": round(conf, 4),
                    "bounding_box": [round(v, 1) for v in [bx, by, bw, bh]],
                    "severity_score": severity,
                }
            )

    if not all_detections:
        return {
            "damage_type": "unknown",
            "confidence": 0.0,
            "bounding_box": [],
            "severity_score": 0,
            "all_detections": [],
        }

    # Pick the detection with the highest severity
    top = max(all_detections, key=lambda d: d["severity_score"])

    return {
        "damage_type": top["damage_type"],
        "confidence": top["confidence"],
        "bounding_box": top["bounding_box"],
        "severity_score": top["severity_score"],
        "all_detections": all_detections,
    }
