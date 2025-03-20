// frontend/src/components/CameraControlModal.jsx
import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Home, RefreshCw } from 'lucide-react';
import { camerasApi } from '../services/api';

const CameraControlModal = ({ isOpen, onClose, camera }) => {
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);
  
  const handleControl = async (action) => {
    try {
      setLoading(true);
      setStatus(`Executing: ${action}...`);
      
      await camerasApi.controlCamera(camera.id, action);
      
      setStatus(`Successfully executed: ${action}`);
    } catch (error) {
      console.error(`Error controlling camera (${action}):`, error);
      setStatus(`Error: ${error.message || 'Failed to control camera'}`);
    } finally {
      setLoading(false);
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('Ready');
      }, 3000);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Control - {camera.name}</h3>
          <button 
            className="p-1 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {/* Camera Info */}
          <div className="mb-4 bg-gray-100 p-3 rounded-md">
            <p className="text-sm text-gray-500">IP Address: <span className="text-gray-700">{camera.ip}</span></p>
            <p className="text-sm text-gray-500">Status: 
              <span className={`ml-1 ${camera.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {camera.status}
              </span>
            </p>
          </div>
          
          {/* Camera Controls */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3 text-gray-700">Camera Controls</h4>
            
            <div className="flex flex-col items-center">
              <button 
                className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center mb-2 disabled:opacity-50"
                onClick={() => handleControl('tilt_up')}
                disabled={loading || camera.status !== 'online'}
              >
                <ChevronUp size={24} />
              </button>
              
              <div className="flex justify-between items-center w-full mb-2">
                <button 
                  className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                  onClick={() => handleControl('pan_left')}
                  disabled={loading || camera.status !== 'online'}
                >
                  <ChevronLeft size={24} />
                </button>
                
                <button 
                  className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                  onClick={() => handleControl('home')}
                  disabled={loading || camera.status !== 'online'}
                >
                  <Home size={20} />
                </button>
                
                <button 
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center justify-center mt-2 disabled:opacity-50"
                  onClick={() => camerasApi.testCameraConnection(camera.id)}
                  disabled={loading}
                >
                  <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Test Connection Diagnostics
                </button>

                <button 
                  className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                  onClick={() => handleControl('pan_right')}
                  disabled={loading || camera.status !== 'online'}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              
              <button 
                className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center mb-4 disabled:opacity-50"
                onClick={() => handleControl('tilt_down')}
                disabled={loading || camera.status !== 'online'}
              >
                <ChevronDown size={24} />
              </button>
            </div>
          </div>
          
          {/* Status and Reconnect */}
          <div className="mt-4">
            <div className="mb-4 p-2 bg-gray-100 rounded-md">
              <p className="text-sm font-medium">Status: <span className="text-blue-600">{status}</span></p>
            </div>
            
            <button 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
              onClick={() => camerasApi.connectCamera(camera.id)}
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Reconnect to Camera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraControlModal;