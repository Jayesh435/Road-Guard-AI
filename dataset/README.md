# Dataset Instructions – RDD2022

## Download

1. Visit the official dataset repository:  
   https://github.com/sekilab/RoadDamageDetector#dataset

2. Download **RDD2022** (recommended – covers multiple countries and damage types).

3. Extract the archive. You should have directories named after countries
   (e.g. `Japan`, `India`, `Norway`, `United_States`).

## Prepare for Training

### 1. Organise source files

Create the following layout inside `dataset/raw/`:

```
dataset/raw/
├── images/
│   ├── img_00001.jpg
│   ├── img_00002.jpg
│   └── ...
└── annotations/
    ├── img_00001.xml   (Pascal VOC format)
    ├── img_00002.xml
    └── ...
```

Each country folder in RDD2022 contains `train/images/` and `train/annotations/`.
You can symlink or copy them into `dataset/raw/`.

### 2. Run the dataset loader

```bash
cd ai-service
python training/dataset_loader.py --src ../dataset/raw --out ../dataset
```

This will:
- Convert Pascal VOC XML annotations to YOLO TXT format
- Split data into `train` (85%) and `val` (15%) sets
- Write `dataset/data.yaml` ready for YOLOv8 training

### 3. Train the model

```bash
python training/train.py --data ../dataset/data.yaml --epochs 50
```

Best weights are saved to `runs/train/roadguard_yolov8/weights/best.pt`.  
Copy them to `ai-service/model/best.pt` to activate inference.

## Class Labels

| Class ID | RDD2022 Code | RoadGuard Label |
|---|---|---|
| 0 | D40 | pothole |
| 1 | D00, D10 | crack |
| 2 | D20 | erosion |
