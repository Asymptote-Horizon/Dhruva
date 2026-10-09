"""
Unit Tests for Dhruva Safety Score Calculation Engine
Tests the deterministic multi-parametric formulation:
S = w1*Crime + w2*Lighting + w3*Crowd + w4*Reports + w5*Emergency + w6*Road
"""
import pytest
from main import calculate_safety_score

def test_perfect_safety_vector():
    """All maximum normalized safety factors should result in 100 score."""
    perfect_place = {
        'crime_inverse': 1.0,
        'lighting': 1.0,
        'crowd_safety': 1.0,
        'user_reports': 1.0,
        'emergency_proximity': 1.0,
        'road_condition': 1.0
    }
    assert calculate_safety_score(perfect_place) == 100

def test_zero_safety_vector():
    """All zero safety factors should result in 0 score."""
    zero_place = {
        'crime_inverse': 0.0,
        'lighting': 0.0,
        'crowd_safety': 0.0,
        'user_reports': 0.0,
        'emergency_proximity': 0.0,
        'road_condition': 0.0
    }
    assert calculate_safety_score(zero_place) == 0

def test_weighted_calculation_precision():
    """Verify exact weighted sum: 0.25*0.8 + 0.15*0.6 + 0.15*0.4 + 0.20*0.9 + 0.15*0.5 + 0.10*0.7."""
    place = {
        'crime_inverse': 0.8,      # 0.200
        'lighting': 0.6,           # 0.090
        'crowd_safety': 0.4,       # 0.060
        'user_reports': 0.9,       # 0.180
        'emergency_proximity': 0.5,# 0.075
        'road_condition': 0.7      # 0.070
    }
    # Expected sum = 0.200 + 0.090 + 0.060 + 0.180 + 0.075 + 0.070 = 0.675 -> 68
    assert calculate_safety_score(place) == 68

def test_defaults_handling():
    """Test when factors are missing, fallback defaults are used without crashing."""
    empty_place = {}
    score = calculate_safety_score(empty_place)
    assert 0 <= score <= 100
    assert score == 65  # Based on defined default values

def test_clamping_out_of_bounds():
    """Values > 1.0 or < 0.0 should be clamped properly."""
    wild_place = {
        'crime_inverse': 5.0,
        'lighting': -2.0,
        'crowd_safety': 1.5,
        'user_reports': 0.8,
        'emergency_proximity': 0.5,
        'road_condition': 0.6
    }
    score = calculate_safety_score(wild_place)
    assert 0 <= score <= 100
