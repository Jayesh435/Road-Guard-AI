# 🛣️ RoadGuard AI

> **Intelligent Road Damage Detection & Smart Repair Planning System**

RoadGuard AI is a hackathon-ready, full-stack smart city platform that uses computer vision (YOLOv8) to detect road damage from citizen photos, dashcam footage, or drone imagery – then provides municipalities with a prioritised repair dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 Citizen Damage Reporting | Upload a photo + GPS location from any device |
| 🤖 AI Damage Detection | YOLOv8 detects potholes, cracks, road erosion |
| 📊 Severity Scoring | 0-100 score (Low / Medium / Critical) |
| 🗺️ Smart City Map | Leaflet heatmap with colour-coded severity markers |
| ⚡ Priority Ranking | Combines severity, traffic density & citizen votes |
| 🔧 Repair Tracking | Authorities mark: Pending → In Progress → Repaired |
| 📈 Analytics Dashboard | Charts for trends, damage types, repair progress |
| 🔮 Predictive Maintenance | Predicts road segments likely to degrade in 30 days |

---

## 🏗️ Architecture

```
roadguard-ai/
├── backend/          Node.js + Express REST API
├── ai-service/       Python FastAPI + YOLOv8 inference
├── frontend/         React + Tailwind CSS + Leaflet dashboard
├── docker/           Dockerfile + docker-compose
└── dataset/          Dataset prep scripts (RDD2022)
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Leaflet (react-leaflet), Recharts |
| Backend | Node.js 20, Express 4, Multer, Mongoose |
| Database | MongoDB 7 |
| AI Model | Python 3.11, YOLOv8 (Ultralytics), FastAPI, Uvicorn |
| DevOps | Docker, Docker Compose, Nginx |

---

## 🗄️ Database Schema

```js
DamageReport {
  image_url:       String   // public URL of uploaded photo
  damage_type:     String   // pothole | crack | erosion | unknown
  severity_score:  Number   // 0-100
  latitude:        Number
  longitude:       Number
  description:     String
  reported_by:     String
  repair_status:   String   // pending | in_progress | repaired
  ai_confidence:   Number   // 0-1
  bounding_box:    [Number] // [x, y, w, h]
  traffic_density: Number   // 0-100
  citizen_reports: Number
  priority_score:  Number   // computed
  timestamp:       Date
}
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/report-damage` | Submit image + GPS, run AI inference |
| GET | `/api/damages` | List reports (filterable by severity, type, status) |
| GET | `/api/map-data` | GeoJSON FeatureCollection for the map |
| PATCH | `/api/update-repair-status` | Update repair lifecycle state |
| GET | `/api/analytics` | Aggregated dashboard statistics |
| GET | `/health` | Backend health check |

### Priority Formula

```
Priority Score = (severity × 0.5) + (traffic_density × 0.3) + (citizen_reports_norm × 0.2)
```

### Severity Levels

| Score | Level |
|---|---|
| 0–30 | 🟡 Low |
| 31–70 | 🟠 Medium |
| 71–100 | 🔴 Critical |

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js ≥ 20
- Python ≥ 3.11
- MongoDB (running locally or Atlas URI)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Jayesh435/Road-Guard-AI.git
cd Road-Guard-AI
```

### 2. Backend setup

```bash
cd backend
cp ../.env.example .env      # edit MONGO_URI if needed
npm install
npm run dev
# → Backend running on http://localhost:5000
```

### 3. AI Service setup

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Download or place trained weights at ai-service/model/best.pt
# (see Training section below)

uvicorn main:app --reload --port 8000
# → AI service running on http://localhost:8000
```

### 4. Frontend setup

```bash
cd frontend
cp .env.example .env.local     # set VITE_API_BASE_URL if needed
npm install
npm run dev
# → Dashboard running on http://localhost:3000
```

---

## 🐳 Docker Deployment (One Command)

```bash
# From project root
cp .env.example .env           # customise as needed

cd docker
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:5000 |
| AI Service | http://localhost:8000 |
| MongoDB | localhost:27017 |

---

## 🤖 AI Model

### Dataset: RDD2022

Download the **Road Damage Dataset 2022** from the official source:

```
https://github.com/sekilab/RoadDamageDetector#dataset
```

Extract into `dataset/raw/` with this layout:
```
dataset/raw/
  images/      *.jpg
  annotations/ *.xml   (Pascal VOC format)
```

### Prepare Dataset

```bash
cd ai-service
python training/dataset_loader.py --src ../dataset/raw --out ../dataset
```

### Train YOLOv8

```bash
python training/train.py --data ../dataset/data.yaml --epochs 50 --model yolov8n
# Best weights saved to: runs/train/roadguard_yolov8/weights/best.pt
```

Copy the best weights to `ai-service/model/best.pt`.

### Run Inference Manually

```python
from inference import run_inference

with open("road_photo.jpg", "rb") as f:
    result = run_inference(f.read())

print(result)
# {damage_type, confidence, bounding_box, severity_score, all_detections}
```

---

## 🔮 Predictive Maintenance

The `ai-service/utils/predictive_maintenance.py` module analyses historical
damage data to predict road segments likely to degrade within 30 days.

```python
from utils.predictive_maintenance import predict_maintenance

predictions = predict_maintenance(damage_reports, threshold=40.0)
# Returns: [{lat_cell, lng_cell, risk_score, report_count, avg_severity, estimated_degradation_date}]
```

---

## 🧪 Running Tests

### Backend unit tests

```bash
cd backend
npm test
```

### AI Service tests

```bash
cd ai-service
pip install pytest
pytest tests/ -v
```

---

## 🌐 Environment Variables

Create `.env` files from the provided `.env.example`:

| Variable | Service | Description |
|---|---|---|
| `MONGO_URI` | backend | MongoDB connection string |
| `PORT` | backend | Express server port (default 5000) |
| `AI_SERVICE_URL` | backend | FastAPI URL (default http://localhost:8000) |
| `AI_PORT` | ai-service | FastAPI listen port (default 8000) |
| `MODEL_PATH` | ai-service | Path to YOLOv8 `.pt` weights |
| `VITE_API_BASE_URL` | frontend | Backend API base URL |
| `VITE_MAPBOX_TOKEN` | frontend | Optional Mapbox token |

---

## 🗂️ Folder Structure

```
Road-Guard-AI/
│
├── backend/
│   ├── config/         db.js
│   ├── controllers/    damageController.js, repairController.js,
│   │                   mapController.js, analyticsController.js
│   ├── middleware/     upload.js (Multer)
│   ├── models/         DamageReport.js
│   ├── routes/         damage.js, repair.js, map.js, analytics.js
│   ├── uploads/        (runtime – uploaded images)
│   ├── __tests__/      unit.test.js
│   └── server.js
│
├── ai-service/
│   ├── model/          best.pt (download separately)
│   ├── training/       train.py, dataset_loader.py
│   ├── utils/          predictive_maintenance.py
│   ├── tests/          test_ai_service.py
│   ├── inference.py
│   ├── main.py         (FastAPI app)
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Charts/   AnalyticsCharts.jsx
│       │   ├── Dashboard/ DamageList.jsx, DamageDetailPanel.jsx, SeverityFilter.jsx
│       │   ├── Map/      DamageMap.jsx
│       │   ├── Report/   ReportForm.jsx
│       │   └── UI/       Navbar.jsx, StatsCard.jsx, LoadingSpinner.jsx
│       ├── pages/        DashboardPage.jsx, ReportPage.jsx
│       ├── utils/        api.js, helpers.js
│       └── App.jsx
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.ai
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── dataset/            (data.yaml written here after dataset_loader.py)
├── .env.example
├── .gitignore
└── README.md
```

---

## 🎯 Demo Walkthrough

1. **Open** `http://localhost:3000` – you'll see the smart city dashboard.
2. **Click** "📸 Report Damage" in the navbar.
3. **Upload** a pothole photo, click "Use my location" (or type lat/lng), submit.
4. The backend calls the AI service – YOLOv8 identifies the damage type and severity.
5. The report appears on the **map** as a colour-coded circle (🔴 critical / 🟠 medium / 🟡 low).
6. Click a marker to open the **Detail Panel** and update repair status.
7. The **Analytics section** updates with charts showing trends.
8. Use **Severity / Type / Status filters** to drill down.

---

## 📜 License

MIT License – see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

*Built with ❤️ for smarter cities.*
