"""
Unit Tests for Dhruva Geospatial Distance & Routing Algorithms
"""
import pytest
import math
from main import haversine

def test_haversine_same_point():
    """Distance between identical coordinates must be 0 km."""
    dist = haversine(18.5204, 73.8567, 18.5204, 73.8567)
    assert round(dist, 4) == 0.0

def test_haversine_known_distance():
    """
    Test distance between Shaniwar Wada (18.5195, 73.8553)
    and Dagdusheth Temple (18.5167, 73.8567) in Pune.
    Physical distance is approximately 0.34 km.
    """
    dist = haversine(18.5195, 73.8553, 18.5167, 73.8567)
    assert 0.3 <= dist <= 0.4

def test_haversine_long_distance():
    """
    Test distance between Pune and Mumbai centroids (~120 km direct).
    """
    pune_lat, pune_lng = 18.5204, 73.8567
    mumbai_lat, mumbai_lng = 18.9220, 72.8347
    dist = haversine(pune_lat, pune_lng, mumbai_lat, mumbai_lng)
    assert 110.0 <= dist <= 135.0
