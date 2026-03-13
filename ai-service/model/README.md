# Place your trained model weights here.
#
# File: ai-service/model/best.pt
#
# Options:
#  A) Train your own model:
#     python training/train.py --data ../../dataset/data.yaml --epochs 50
#     cp runs/train/roadguard_yolov8/weights/best.pt model/best.pt
#
#  B) Use a pre-trained YOLOv8 nano model for quick demos (no road-damage fine-tuning):
#     python -c "from ultralytics import YOLO; YOLO('yolov8n.pt').export()"
#     cp yolov8n.pt model/best.pt
#     # Note: this will not detect road damage accurately without fine-tuning.
