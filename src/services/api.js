// frontend/src/services/api.js - Updated version for your new backend
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Make sure this points to your new backend

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const camerasApi = {
  // Get all cameras
  getAllCameras: () => api.get('/cameras'),
  
  // Add a new camera
  addCamera: (cameraData) => api.post('/cameras', cameraData),
  
  // Update a camera
  updateCamera: (cameraId, cameraData) => api.put(`/cameras/${cameraId}`, cameraData),
  
  // Delete a camera
  deleteCamera: (cameraId) => api.delete(`/cameras/${cameraId}`),
  
  // Connect to a camera
  connectCamera: (cameraId) => api.post(`/cameras/${cameraId}/connect`),
  
  // Control a camera
  controlCamera: (cameraId, action) => api.post(`/cameras/${cameraId}/control`, { action }),
  
  getCameraStream: (cameraId) => api.get(`/cameras/${cameraId}/stream`),

  // Test camera stream
  testCameraStream: (cameraId) => api.get(`/cameras/${cameraId}/test-stream`),
  
  testCameraConnection: (cameraId) => api.post(`/cameras/${cameraId}/test-connection`),

};

export default api;