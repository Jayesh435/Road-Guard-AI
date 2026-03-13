"""
RoadGuard AI – Dataset Loader for RDD2022
==========================================
Prepares the RDD2022 (Road Damage Dataset 2022) for YOLOv8 training.

Steps performed:
1. Reads Pascal VOC XML annotations (RDD2022 format).
2. Converts them to YOLO TXT format (class_id cx cy w h, normalised).
3. Splits into train/val sets.
4. Writes a data.yaml consumed by the training script.

Class mapping:
    D00 (longitudinal crack) → 1  (crack)
    D10 (transverse crack)   → 1  (crack)
    D20 (alligator crack)    → 2  (erosion)
    D40 (pothole)            → 0  (pothole)

Usage:
    python training/dataset_loader.py --src dataset/raw --out dataset

Download RDD2022 from:
    https://github.com/sekilab/RoadDamageDetector#dataset
"""

import argparse
import os
import random
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

# VOC label → YOLO class index
LABEL_MAP = {
    "D00": 1,  # longitudinal crack → crack
    "D10": 1,  # transverse crack   → crack
    "D20": 2,  # alligator crack    → erosion
    "D40": 0,  # pothole            → pothole
}
CLASS_NAMES = ["pothole", "crack", "erosion"]


def voc_to_yolo(xml_path: Path, img_w: int, img_h: int):
    """Convert one Pascal VOC annotation file to YOLO format lines."""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    lines = []
    for obj in root.findall("object"):
        name = obj.find("name").text
        cls_id = LABEL_MAP.get(name)
        if cls_id is None:
            continue  # skip unknown classes
        bndbox = obj.find("bndbox")
        xmin = float(bndbox.find("xmin").text)
        ymin = float(bndbox.find("ymin").text)
        xmax = float(bndbox.find("xmax").text)
        ymax = float(bndbox.find("ymax").text)
        # Normalise
        cx = ((xmin + xmax) / 2) / img_w
        cy = ((ymin + ymax) / 2) / img_h
        bw = (xmax - xmin) / img_w
        bh = (ymax - ymin) / img_h
        lines.append(f"{cls_id} {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}")
    return lines


def prepare_dataset(src_dir: str, out_dir: str, val_split: float = 0.15, seed: int = 42):
    """
    Convert RDD2022 VOC annotations and build YOLO directory layout.

    Expected source layout:
        src_dir/
            images/     *.jpg
            annotations/ *.xml   (same stem as images)
    """
    random.seed(seed)
    src = Path(src_dir)
    out = Path(out_dir)

    images_dir = src / "images"
    annots_dir = src / "annotations"

    all_images = sorted(images_dir.glob("*.jpg"))
    random.shuffle(all_images)

    val_count = max(1, int(len(all_images) * val_split))
    val_images = set(img.stem for img in all_images[:val_count])

    splits = {"train": [], "val": []}
    for img_path in all_images:
        split = "val" if img_path.stem in val_images else "train"
        splits[split].append(img_path)

    for split, imgs in splits.items():
        img_out = out / "images" / split
        lbl_out = out / "labels" / split
        img_out.mkdir(parents=True, exist_ok=True)
        lbl_out.mkdir(parents=True, exist_ok=True)

        for img_path in imgs:
            xml_path = annots_dir / (img_path.stem + ".xml")
            if not xml_path.exists():
                continue

            # Copy image
            shutil.copy(img_path, img_out / img_path.name)

            # Parse image dimensions from XML
            tree = ET.parse(xml_path)
            root = tree.getroot()
            size = root.find("size")
            w = int(size.find("width").text)
            h = int(size.find("height").text)

            # Write YOLO label file
            yolo_lines = voc_to_yolo(xml_path, w, h)
            lbl_file = lbl_out / (img_path.stem + ".txt")
            lbl_file.write_text("\n".join(yolo_lines))

    # Write data.yaml
    data_yaml = out / "data.yaml"
    data_yaml.write_text(
        f"path: {out.resolve()}\n"
        f"train: images/train\n"
        f"val: images/val\n"
        f"nc: {len(CLASS_NAMES)}\n"
        f"names: {CLASS_NAMES}\n"
    )
    print(f"✅ Dataset prepared → {data_yaml}")
    print(f"   train: {len(splits['train'])} images")
    print(f"   val:   {len(splits['val'])} images")


def main():
    parser = argparse.ArgumentParser(description="Prepare RDD2022 for YOLOv8")
    parser.add_argument("--src", default="dataset/raw", help="Source RDD2022 directory")
    parser.add_argument("--out", default="dataset", help="Output dataset directory")
    parser.add_argument("--val-split", type=float, default=0.15)
    args = parser.parse_args()
    prepare_dataset(args.src, args.out, args.val_split)


if __name__ == "__main__":
    main()
