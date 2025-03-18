# bestcity/backend/app/models/camera.py
import time
import uuid

class Camera:
    """Camera model with IP camera properties"""
    
    def __init__(self, name, ip, username, password, camera_type="default", onvif_port=2020):
        self.id = str(uuid.uuid4())
        self.name = name
        self.ip = ip
        self.username = username
        self.password = password
        self.rtsp_url = f"rtsp://{username}:{password}@{ip}:554/stream1"
        self.onvif_port = onvif_port
        self.type = camera_type
        self.status = "offline"
        self.date_added = time.time()
        self.last_connected = None
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "ip": self.ip,
            "username": self.username,
            "password": self.password,
            "rtspUrl": self.rtsp_url,
            "onvifPort": self.onvif_port,
            "type": self.type,
            "status": self.status,
            "dateAdded": self.date_added,
            "lastConnected": self.last_connected
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create a Camera instance from a dictionary"""
        camera = cls(
            name=data.get("name"),
            ip=data.get("ip"),
            username=data.get("username"),
            password=data.get("password"),
            camera_type=data.get("type", "default"),
            onvif_port=data.get("onvifPort", 2020)
        )
        
        if "id" in data:
            camera.id = data["id"]
        
        return camera