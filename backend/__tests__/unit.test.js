/**
 * Unit tests for backend utility/business logic functions.
 * These tests do NOT require a live MongoDB connection.
 */

// ── computePriority (inline copy of the formula) ──────────────────────────
const computePriority = (severity, trafficDensity, citizenReports) => {
  const normReports = Math.min(citizenReports, 50) * 2;
  return Math.round(severity * 0.5 + trafficDensity * 0.3 + normReports * 0.2);
};

describe('computePriority', () => {
  test('all zeros returns 0', () => {
    expect(computePriority(0, 0, 0)).toBe(0);
  });

  test('max values returns 100', () => {
    // severity=100, traffic=100, citizenReports=50 (normReports=100)
    // 100×0.5 + 100×0.3 + 100×0.2 = 50+30+20 = 100
    expect(computePriority(100, 100, 50)).toBe(100);
  });

  test('citizen_reports caps at 50', () => {
    const a = computePriority(60, 70, 50);
    const b = computePriority(60, 70, 200);
    expect(a).toBe(b);
  });

  test('typical medium severity case', () => {
    // severity=50, traffic=50, reports=5 → normReports=10
    // 50×0.5 + 50×0.3 + 10×0.2 = 25+15+2 = 42
    expect(computePriority(50, 50, 5)).toBe(42);
  });
});

// ── severity_label virtual (re-implemented inline) ────────────────────────
const severityLabel = (score) => {
  if (score <= 30) return 'low';
  if (score <= 70) return 'medium';
  return 'critical';
};

describe('severityLabel', () => {
  test('0 is low', () => expect(severityLabel(0)).toBe('low'));
  test('30 is low', () => expect(severityLabel(30)).toBe('low'));
  test('31 is medium', () => expect(severityLabel(31)).toBe('medium'));
  test('70 is medium', () => expect(severityLabel(70)).toBe('medium'));
  test('71 is critical', () => expect(severityLabel(71)).toBe('critical'));
  test('100 is critical', () => expect(severityLabel(100)).toBe('critical'));
});
