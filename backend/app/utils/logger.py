# bestcity/backend/app/utils/logger.py
import logging
import sys

def setup_logger(name, level=logging.INFO):
    """Configure and return a logger"""
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    logger.setLevel(level)
    logger.propagate = False
    
    return logger