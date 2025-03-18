# bestcity/backend/app/api/routes.py
from flask import Blueprint, request, jsonify, current_app, send_from_directory
import logging
import cv2
import os

logger = logging.getLogger(__name__)
api = Blueprint('api', __name__)

@api.route('/cameras', methods=['GET'])
def get_cameras():
    """Get all cameras"""
    cameras = current_app.camera_service.get_all_cameras()
    return jsonify(cameras)

@api.route('/cameras', methods=['POST'])
def add_camera():
    """Add a new camera"""
    data = request.json
    
    try:
        camera = current_app.camera_service.add_camera(data)
        return jsonify({
            "success": True,
            "message": "Camera added successfully",
            "camera": camera
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

@api.route('/cameras/<camera_id>/test-connection', methods=['POST'])
def test_camera_connection(camera_id):
    """Test camera connection with detailed diagnostics"""
    camera = current_app.camera_service.get_camera(camera_id)
    
    if not camera:
        return jsonify({
            "success": False,
            "message": "Camera not found"
        }), 404
    
    # Try different RTSP URL patterns
    rtsp_patterns = [
        f"rtsp://{camera['username']}:{camera['password']}@{camera['ip']}:554/stream1",
        f"rtsp://{camera['username']}:{camera['password']}@{camera['ip']}:554/Streaming/Channels/1",
        f"rtsp://{camera['username']}:{camera['password']}@{camera['ip']}:554/cam/realmonitor?channel=1&subtype=0",
        f"rtsp://{camera['username']}:{camera['password']}@{camera['ip']}:554/axis-media/media.amp"
    ]
    
    results = []
    success = False
    
    for url in rtsp_patterns:
        try:
            logger.info(f"Testing URL: {url}")
            cap = cv2.VideoCapture(url)
            opened = cap.isOpened()
            
            if opened:
                ret, frame = cap.read()
                frame_read = ret and frame is not None
                success = success or frame_read
            else:
                frame_read = False
            
            cap.release()
            
            results.append({
                "url": url,
                "opened": opened,
                "frame_read": frame_read
            })
            
            if frame_read:
                # If we get a successful connection, remember this URL format
                camera['rtspUrlPattern'] = url
        except Exception as e:
            results.append({
                "url": url,
                "error": str(e)
            })
    
    return jsonify({
        "success": success,
        "message": "Connection test complete",
        "results": results
    })

@api.route('/streams/<camera_id>/<path:filename>')
def serve_stream(camera_id, filename):
    """Serve the HLS stream files"""
    streams_dir = os.path.join(os.getcwd(), "streams", camera_id)
    
    # Add CORS headers for HLS streams
    response = None
    
    # Set appropriate MIME type for different file types
    if filename.endswith('.m3u8'):
        response = send_from_directory(
            streams_dir, 
            filename, 
            mimetype='application/vnd.apple.mpegurl',
            conditional=True
        )
    elif filename.endswith('.ts'):
        response = send_from_directory(
            streams_dir, 
            filename,
            mimetype='video/mp2t',
            conditional=True
        )
    else:
        response = send_from_directory(streams_dir, filename)
    
    # Add HLS-friendly headers
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    response.headers['Access-Control-Allow-Origin'] = '*'
    
    return response

@api.route('/cameras/<camera_id>', methods=['GET'])
def get_camera(camera_id):
    """Get a specific camera"""
    camera = current_app.camera_service.get_camera(camera_id)
    
    if camera:
        return jsonify(camera)
    else:
        return jsonify({
            "success": False,
            "message": "Camera not found"
        }), 404

@api.route('/cameras/<camera_id>', methods=['PUT'])
def update_camera(camera_id):
    """Update a camera"""
    data = request.json
    
    camera = current_app.camera_service.update_camera(camera_id, data)
    
    if camera:
        return jsonify({
            "success": True,
            "message": "Camera updated successfully",
            "camera": camera
        })
    else:
        return jsonify({
            "success": False,
            "message": "Camera not found"
        }), 404

@api.route('/cameras/<camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    """Delete a camera"""
    success = current_app.camera_service.delete_camera(camera_id)
    
    if success:
        return jsonify({
            "success": True,
            "message": "Camera deleted successfully"
        })
    else:
        return jsonify({
            "success": False,
            "message": "Camera not found"
        }), 404

@api.route('/cameras/<camera_id>/connect', methods=['POST'])
def connect_camera(camera_id):
    """Connect to a camera"""
    success, message = current_app.camera_service.connect_to_camera(camera_id)  # Change this line
    
    return jsonify({
        "success": success,
        "message": message,
        "camera": current_app.camera_service.get_camera(camera_id) if success else None
    }), 200 if success else 400

@api.route('/cameras/<camera_id>/disconnect', methods=['POST'])
def disconnect_camera(camera_id):
    """Disconnect from a camera"""
    success, message = current_app.camera_service.disconnect_camera(camera_id)
    
    return jsonify({
        "success": success,
        "message": message,
        "camera": current_app.camera_service.get_camera(camera_id) if success else None
    }), 200 if success else 400

@api.route('/cameras/<camera_id>/control', methods=['POST'])
def control_camera(camera_id):
    """Control a camera"""
    action = request.json.get('action')
    
    if not action:
        return jsonify({
            "success": False,
            "message": "Action not specified"
        }), 400
    
    success, message = current_app.camera_service.control_camera(camera_id, action)
    
    return jsonify({
        "success": success,
        "message": message,
        "camera": current_app.camera_service.get_camera(camera_id) if success else None
    }), 200 if success else 400

@api.route('/cameras/<camera_id>/stream')
def stream_camera_feed(camera_id):
    camera = current_app.camera_service.get_camera(camera_id)
    
    if not camera:
        return jsonify({
            "success": False,
            "message": "Camera not found"
        }), 404
    
    if camera.get('status') != 'online':
        return jsonify({
            "success": False,
            "message": "Camera is offline"
        }), 400
    
    # Return the HLS stream URL
    stream_url = f"/api/streams/{camera_id}/stream.m3u8"
    
    return jsonify({
        "success": True,
        "stream_url": stream_url
    })

@api.route('/cameras/<camera_id>/test-stream', methods=['GET'])
def test_camera_stream(camera_id):
    """Test if a camera's stream is accessible"""
    success, message = current_app.camera_service.test_rtsp_stream(camera_id)
    
    return jsonify({
        "success": success,
        "message": message
    }), 200 if success else 400