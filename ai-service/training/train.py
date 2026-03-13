"""
RoadGuard AI – YOLOv8 Training Script
======================================
Trains a YOLOv8n model on the RDD2022 road damage dataset.

Usage:
    python training/train.py --data dataset/data.yaml --epochs 50

Pre-requisites:
    pip install ultralytics
    Download RDD2022 dataset and prepare data.yaml (see dataset/README.md).
"""

import argparse
from pathlib import Path

from ultralytics import YOLO


def train(data_yaml: str, epochs: int, img_size: int, batch: int, model_variant: str):
    """
    Fine-tune a YOLOv8 model on road damage images.

    Args:
        data_yaml:     Path to data.yaml file describing the dataset.
        epochs:        Number of training epochs.
        img_size:      Input image size (square).
        batch:         Training batch size.
        model_variant: YOLOv8 variant, e.g. yolov8n, yolov8s, yolov8m.
    """
    # Load a pre-trained YOLOv8 model (COCO weights)
    model = YOLO(f"{model_variant}.pt")

    # Train on road damage dataset
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=img_size,
        batch=batch,
        name="roadguard_yolov8",
        project="runs/train",
        exist_ok=True,
        patience=10,          # Early stopping patience
        save_period=10,       # Save checkpoint every N epochs
        device="cpu",         # Change to 0 (or 'cuda') if GPU is available
        workers=4,
        verbose=True,
    )

    # Export best weights to ONNX for deployment
    best_pt = Path("runs/train/roadguard_yolov8/weights/best.pt")
    if best_pt.exists():
        export_model = YOLO(str(best_pt))
        export_model.export(format="onnx")
        print(f"✅ Model exported to ONNX: {best_pt.with_suffix('.onnx')}")

    return results


def main():
    parser = argparse.ArgumentParser(description="Train RoadGuard YOLOv8 model")
    parser.add_argument("--data", default="dataset/data.yaml", help="Path to data.yaml")
    parser.add_argument("--epochs", type=int, default=50, help="Training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--model", default="yolov8n", help="YOLOv8 variant (n/s/m/l/x)")
    args = parser.parse_args()

    print(f"🚀 Starting training: {args.model}, {args.epochs} epochs, img={args.imgsz}")
    train(
        data_yaml=args.data,
        epochs=args.epochs,
        img_size=args.imgsz,
        batch=args.batch,
        model_variant=args.model,
    )
    print("✅ Training complete!")


if __name__ == "__main__":
    main()
