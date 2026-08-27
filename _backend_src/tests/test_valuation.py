"""
Unit tests for the CMA percentile/confidence math in services/valuation.py --
pure functions, no MongoDB needed. compute_valuation() itself, the ingestion
pipeline, and the report/listing routes all need a running Mongo instance
(and, for ingestion, a real APIFY_TOKEN) to exercise end-to-end -- see the
README's "Known Gaps" section.
"""

from datetime import datetime, timedelta, timezone

from services.valuation import (
    MAX_COMPARABLE_AGE_DAYS,
    MIN_COMPARABLES_FOR_CONFIDENCE,
    _confidence,
    _percentile,
)


def test_percentile_single_value():
    assert _percentile([42.0], 0.5) == 42.0


def test_percentile_median_odd_count():
    assert _percentile([10.0, 20.0, 30.0], 0.5) == 20.0


def test_percentile_interpolates_between_values():
    # 4 values -> the 0.5 percentile falls exactly between the two middle values
    assert _percentile([10.0, 20.0, 30.0, 40.0], 0.5) == 25.0


def test_percentile_low_and_high_quartiles():
    values = [10.0, 20.0, 30.0, 40.0, 50.0]
    assert _percentile(values, 0.25) == 20.0
    assert _percentile(values, 0.75) == 40.0


def test_confidence_zero_for_no_comparables():
    assert _confidence([]) == 0.0


def test_confidence_increases_with_more_recent_comparables():
    now = datetime.now(timezone.utc)
    recent = [{"sale_date": now - timedelta(days=10)} for _ in range(MIN_COMPARABLES_FOR_CONFIDENCE)]
    stale = [
        {"sale_date": now - timedelta(days=MAX_COMPARABLE_AGE_DAYS - 5)}
        for _ in range(MIN_COMPARABLES_FOR_CONFIDENCE)
    ]
    assert _confidence(recent) > _confidence(stale)


def test_confidence_increases_with_sample_size():
    now = datetime.now(timezone.utc)
    few = [{"sale_date": now}]
    many = [{"sale_date": now} for _ in range(MIN_COMPARABLES_FOR_CONFIDENCE)]
    assert _confidence(many) > _confidence(few)


def test_confidence_capped_at_one_component_each():
    # Many, very recent comparables -> sample_factor and recency_factor both
    # saturate at 1.0, so confidence caps at 0.6*1 + 0.4*1 = 1.0
    now = datetime.now(timezone.utc)
    comps = [{"sale_date": now} for _ in range(MIN_COMPARABLES_FOR_CONFIDENCE * 3)]
    assert _confidence(comps) == 1.0
