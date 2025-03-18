# bestcity/backend/app/utils/http_client.py
import requests
import logging
from .logger import setup_logger

logger = setup_logger(__name__)

class HttpClient:
    """Simple HTTP client with authentication"""
    
    @staticmethod
    def get(url, auth=None, timeout=5, **kwargs):
        """Make a GET request"""
        try:
            response = requests.get(url, auth=auth, timeout=timeout, **kwargs)
            response.raise_for_status()
            return response.json() if response.content else None
        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP GET error: {e}")
            return None
    
    @staticmethod
    def post(url, data=None, json=None, auth=None, timeout=5, **kwargs):
        """Make a POST request"""
        try:
            response = requests.post(url, data=data, json=json, auth=auth, timeout=timeout, **kwargs)
            response.raise_for_status()
            return response.json() if response.content else None
        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP POST error: {e}")
            return None