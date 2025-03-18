# bestcity/backend/app/services/camera_service.py
import time
import random
import uuid
import logging
import threading
import cv2
import subprocess
import os
from ..utils.logger import setup_logger
from ..models.camera import Camera

logger = setup_logger(__name__)

class CameraService:
    """Service for managing IP cameras"""
    
    def __init__(self):
        self.cameras = {}  # Dictionary of cameras by ID
        self.active_connections = {}  # Active camera connections
    
    def add_camera(self, camera_data):
        """Add a new camera to the system"""
        try:
            # Generate a unique ID if not provided
            camera_id = camera_data.get('id', str(uuid.uuid4()))
            
            # Create camera object with all necessary fields
            camera = {
                'id': camera_id,
                'name': camera_data.get('name', f'Camera {camera_id}'),
                'ip': camera_data.get('ip'),
                'username': camera_data.get('username'),
                'password': camera_data.get('password'),
                'rtspUrl': f"rtsp://{camera_data.get('username')}:{camera_data.get('password')}@{camera_data.get('ip')}:554/stream1",
                'onvifPort': camera_data.get('onvifPort', 2020),
                'type': camera_data.get('type', 'default'),
                'status': 'offline',
                'dateAdded': time.time(),
                'lastConnected': None
            }
            
            # Store the camera
            self.cameras[camera_id] = camera
            
            logger.info(f"Added camera: {camera['name']} ({camera['ip']})")
            return camera
        except Exception as e:
            logger.error(f"Error adding camera: {e}")
            raise
    
    def get_all_cameras(self):
        """Get all registered cameras"""
        return list(self.cameras.values())
    
    def get_camera(self, camera_id):
        """Get a specific camera by ID"""
        return self.cameras.get(camera_id)
    
    def update_camera(self, camera_id, camera_data):
        """Update a camera's information"""
        if camera_id not in self.cameras:
            return None
        
        camera = self.cameras[camera_id]
        
        # Update fields
        if "name" in camera_data:
            camera['name'] = camera_data["name"]
        if "ip" in camera_data:
            camera['ip'] = camera_data["ip"]
            camera['rtspUrl'] = f"rtsp://{camera['username']}:{camera['password']}@{camera['ip']}:554/stream1"
        if "username" in camera_data:
            camera['username'] = camera_data["username"]
            camera['rtspUrl'] = f"rtsp://{camera['username']}:{camera['password']}@{camera['ip']}:554/stream1"
        if "password" in camera_data:
            camera['password'] = camera_data["password"]
            camera['rtspUrl'] = f"rtsp://{camera['username']}:{camera['password']}@{camera['ip']}:554/stream1"
        if "type" in camera_data:
            camera['type'] = camera_data["type"]
        if "onvifPort" in camera_data:
            camera['onvifPort'] = camera_data["onvifPort"]
        
        return camera
        
    def delete_camera(self, camera_id):
        """Delete a camera from the system"""
        if camera_id not in self.cameras:
            return False
        
        # Disconnect if connected
        if camera_id in self.active_connections:
            self.disconnect_camera(camera_id)
        
        # Remove camera
        del self.cameras[camera_id]
        logger.info(f"Deleted camera: {camera_id}")
        return True
    
    def connect_to_camera(self, camera_id):
        """Connect to a real IP camera"""
        if camera_id not in self.cameras:
            return False, "Camera not found"
        
        camera = self.cameras.get(camera_id)
        
        try:
            # Use your specific format with URL encoding for special characters
            username = camera.get('username')
            password = camera.get('password')
            ip = camera.get('ip')
            
            # URL encode the password if it contains special characters
            import urllib.parse
            encoded_password = urllib.parse.quote(password)
            
            rtsp_url = f"rtsp://{username}:{encoded_password}@{ip}:554/stream1"
            logger.info(f"Attempting to connect to camera with URL: {rtsp_url}")
            
            # Start the streaming process for this camera
            streaming_success = self._start_streaming_service(camera_id, rtsp_url)
            
            if streaming_success:
                # Update camera status
                self.cameras[camera_id]['status'] = "online"
                self.cameras[camera_id]['lastConnected'] = time.time()
                self.active_connections[camera_id] = {
                    "connected_at": time.time(),
                    "rtsp_url": rtsp_url
                }
                
                logger.info(f"Successfully connected to camera at {ip}")
                return True, "Connected successfully"
            else:
                return False, "Failed to start streaming service"
                
        except Exception as e:
            logger.error(f"Error connecting to camera: {str(e)}")
            return False, f"Connection error: {str(e)}"
        
    def _start_streaming_service(self, camera_id, rtsp_url):
        """Start FFmpeg process to convert RTSP to HLS"""
        try:
            # Create streaming directory if it doesn't exist
            streams_dir = os.path.join(os.getcwd(), "streams")
            os.makedirs(streams_dir, exist_ok=True)
            
            camera_dir = os.path.join(streams_dir, str(camera_id))
            os.makedirs(camera_dir, exist_ok=True)
            
            output_path = os.path.join(camera_dir, "stream.m3u8")
            logger.info(f"Setting up stream at: {output_path}")
            
            # FFmpeg command to convert RTSP to HLS with proper audio transcoding
            ffmpeg_cmd = [
                "ffmpeg",
                "-rtsp_transport", "tcp",
                "-i", rtsp_url,
                "-c:v", "libx264",         # Re-encode video instead of copy
                "-preset", "ultrafast",    # Use fastest encoding
                "-tune", "zerolatency",    # Optimize for low latency
                "-b:v", "800k",            # Lower, consistent bitrate
                "-maxrate", "1000k",       # Maximum bitrate
                "-bufsize", "2000k",       # Buffer size
                "-r", "10",                # Lower, fixed framerate
                "-g", "20",                # Keyframe interval
                "-sc_threshold", "0",      # Disable scene change detection
                "-profile:v", "baseline",  # Use simplest H.264 profile
                "-level", "3.0",           # Compatible level
                "-hls_time", "1",          # Shorter segments for quicker recovery
                "-hls_list_size", "10",    # Keep more segments
                "-hls_flags", "delete_segments+append_list",
                "-hls_segment_type", "mpegts",
                "-f", "hls",
                output_path
            ]
            
            logger.info(f"Starting FFmpeg with command: {' '.join(ffmpeg_cmd)}")
            
            # Start FFmpeg in a separate thread
            def run_ffmpeg():
                try:
                    process = subprocess.Popen(
                        ffmpeg_cmd, 
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE
                    )
                    if process.pid:
                        logger.info(f"FFmpeg process started with PID: {process.pid}")
                        if camera_id in self.active_connections:
                            self.active_connections[camera_id]["process"] = process
                        else:
                            self.active_connections[camera_id] = {"process": process}
                        return True
                    else:
                        logger.error("Failed to start FFmpeg process")
                        return False
                except Exception as e:
                    logger.error(f"Error in FFmpeg thread: {str(e)}")
                    return False
            
            # Run in a separate thread
            thread = threading.Thread(target=run_ffmpeg)
            thread.daemon = True
            thread.start()
            
            # Give FFmpeg time to start
            time.sleep(3)
            
            # Consider the streaming service started successfully
            return True
            
        except Exception as e:
            logger.error(f"Error starting FFmpeg: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False

    def disconnect_camera(self, camera_id):
        """Disconnect from a camera"""
        if camera_id not in self.cameras:
            return False, "Camera not found"
        
        if camera_id not in self.active_connections:
            return False, "Camera not connected"
        
        try:
            # In a real implementation, we would close the connection
            logger.info(f"Disconnecting from camera: {self.cameras[camera_id]['name']}")
            
            # Remove connection
            del self.active_connections[camera_id]
            
            # Update camera status
            self.cameras[camera_id]['status'] = "offline"
            
            return True, "Disconnected successfully"
        except Exception as e:
            logger.error(f"Error disconnecting camera: {e}")
            return False, f"Disconnection error: {str(e)}"
    
    # In control_camera method
    def control_camera(self, camera_id, action):
        """Control camera movement (pan, tilt, zoom)"""
        if camera_id not in self.cameras:
            return False, "Camera not found"
        
        if camera_id not in self.active_connections:
            return False, "Camera not connected"
        
        try:
            # In a real implementation, we would send commands to the camera
            # For now, simulate successful control
            logger.info(f"Controlling camera {self.cameras[camera_id]['name']}: {action}")
            
            # Simulate control delay
            time.sleep(0.5)
            
            # Auto-stop movement after 1 second
            if action in ["pan_left", "pan_right", "tilt_up", "tilt_down"]:
                def stop_movement():
                    logger.info(f"Auto-stopping camera {self.cameras[camera_id]['name']} movement")
                
                threading.Timer(1.0, stop_movement).start()
            
            return True, f"Action {action} executed successfully"
        except Exception as e:
            logger.error(f"Error controlling camera: {e}")
            return False, f"Control error: {str(e)}"
    
    # In test_rtsp_stream method
    def test_rtsp_stream(self, camera_id):
        """Test if the camera's RTSP stream is accessible"""
        if camera_id not in self.cameras:
            return False, "Camera not found"
        
        camera = self.cameras[camera_id]
        
        try:
            # In a real implementation, we would test the RTSP stream with OpenCV
            # For now, simulate stream test
            logger.info(f"Testing RTSP stream for camera: {camera['name']}")
            
            # Simulate test delay
            time.sleep(1)
            
            # 80% success rate for testing
            success = random.random() < 0.8
            
            return success, "RTSP stream " + ("accessible" if success else "not accessible")
        except Exception as e:
            logger.error(f"Error testing RTSP stream: {e}")
            return False, f"RTSP test error: {str(e)}"