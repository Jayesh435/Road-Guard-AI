"""
Unit tests for RoadGuard AI service utilities.
Run with: pytest ai-service/tests/
"""

import sys
from pathlib import Path

# Allow imports from ai-service root
sys.path.insert(0, str(Path(__file__).parent.parent))

from inference import _compute_severity
from utils.predictive_maintenance import predict_maintenance


# ── _compute_severity ─────────────────────────────────────────────────────
class TestComputeSeverity:
    def test_zero_confidence_zero_area(self):
        score = _compute_severity([0, 0, 0, 0], 640, 480, 0.0)
        assert score == 0

    def test_full_image_high_confidence(self):
        # bbox covers entire image, confidence=1.0 → severity = 50+50 = 100
        score = _compute_severity([0, 0, 640, 480], 640, 480, 1.0)
        assert score == 100

    def test_small_pothole_medium_confidence(self):
        # 64×48 px (1% of 640×480), confidence=0.9
        # area_ratio = 0.01, score = 0.01*50 + 0.9*50 = 0.5 + 45 = 45.5 → 46
        score = _compute_severity([100, 100, 64, 48], 640, 480, 0.9)
        assert score == 46

    def test_zero_image_dimensions_returns_zero(self):
        score = _compute_severity([0, 0, 100, 100], 0, 0, 0.8)
        assert score == 0


# ── predict_maintenance ────────────────────────────────────────────────────
class TestPredictMaintenance:
    def _make_report(self, lat, lng, severity, status="pending", days_ago=10):
        from datetime import datetime, timedelta, timezone

        ts = (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()
        return {
            "latitude": lat,
            "longitude": lng,
            "severity_score": severity,
            "repair_status": status,
            "timestamp": ts,
        }

    def test_empty_returns_empty(self):
        assert predict_maintenance([]) == []

    def test_repaired_reports_excluded(self):
        reports = [self._make_report(40.0, -75.0, 80, status="repaired")]
        result = predict_maintenance(reports, threshold=0.0)
        assert result == []

    def test_high_severity_included(self):
        reports = [self._make_report(40.0, -75.0, 80, days_ago=15)]
        result = predict_maintenance(reports, threshold=10.0)
        assert len(result) == 1
        assert result[0]["risk_score"] > 10.0

    def test_low_severity_below_threshold_excluded(self):
        reports = [self._make_report(40.0, -75.0, 5, days_ago=1)]
        result = predict_maintenance(reports, threshold=50.0)
        assert result == []

    def test_sorted_by_risk_descending(self):
        reports = [
            self._make_report(40.0, -75.0, 30, days_ago=5),
            self._make_report(41.0, -76.0, 90, days_ago=20),
        ]
        result = predict_maintenance(reports, threshold=0.0)
        assert result[0]["risk_score"] >= result[1]["risk_score"]
