// frontend/src/pages/Devices.jsx
import React, { useState, useEffect } from 'react';
import { camerasApi } from '../services/api';
import { Plus, Camera, Trash2, RefreshCw } from 'lucide-react';
import AddCameraModal from '../components/AddCameraModal';

const Devices = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  useEffect(() => {
    fetchCameras();
  }, []);
  
  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await camerasApi.getAllCameras();
      setCameras(response.data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCamera = async (cameraData) => {
    try {
      await camerasApi.addCamera(cameraData);
      fetchCameras();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding camera:', error);
    }
  };
  
  const handleDeleteCamera = async (cameraId) => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      try {
        await camerasApi.deleteCamera(cameraId);
        fetchCameras();
      } catch (error) {
        console.error('Error deleting camera:', error);
      }
    }
  };
  
  const handleConnectCamera = async (cameraId) => {
    try {
      await camerasApi.connectCamera(cameraId);
      fetchCameras();
    } catch (error) {
      console.error('Error connecting to camera:', error);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm flex items-center justify-between p-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Devices</h2>
        </div>
        
        <div>
          <button 
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 flex items-center"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} className="mr-2" />
            Add Camera
          </button>
        </div>
      </header>
      
      {/* Devices list */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Camera size={64} className="text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No cameras added</p>
            <p className="text-gray-500 mb-4">Add a camera to start monitoring</p>
            <button 
              className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 flex items-center"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} className="mr-2" />
              Add Camera
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cameras.map((camera) => (
                  <tr key={camera.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Camera size={20} className="text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{camera.name}</div>
                          <div className="text-sm text-gray-500">{camera.username}@{camera.ip}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{camera.ip}</div>
                      <div className="text-sm text-gray-500">Port: {camera.onvifPort}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {camera.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        camera.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {camera.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-brand-600 hover:text-brand-900 mr-4"
                        onClick={() => handleConnectCamera(camera.id)}
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteCamera(camera.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      
      {/* Add Camera Modal */}
      <AddCameraModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSubmit={handleAddCamera} 
      />
    </>
  );
};

export default Devices;