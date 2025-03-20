// frontend/src/components/AddCameraModal.jsx
import React, { useState } from 'react';
import { X, Save, Camera } from 'lucide-react';

const AddCameraModal = ({ isOpen, onClose, onSubmit }) => {
  const [cameraData, setCameraData] = useState({
    name: '',
    ip: '',
    username: 'admin',
    password: 'admin',
    type: 'default',
    onvifPort: 2020
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCameraData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cameraData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Add New Camera</h3>
          <button 
            className="p-1 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Camera Name
              </label>
              <input
                type="text"
                name="name"
                value={cameraData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Office Front Door"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                IP Address
              </label>
              <input
                type="text"
                name="ip"
                value={cameraData.ip}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="192.168.0.101"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={cameraData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="admin"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={cameraData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="password"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Camera Type
                </label>
                <select
                  name="type"
                  value={cameraData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="default">Regular Camera</option>
                  <option value="fisheye">Fisheye</option>
                  <option value="bullet">Bullet</option>
                  <option value="sensor">Multi-Sensor</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  ONVIF Port
                </label>
                <input
                  type="number"
                  name="onvifPort"
                  value={cameraData.onvifPort}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="2020"
                />
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right rounded-b-lg">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mr-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
            >
              <Save size={16} className="mr-2" />
              Save Camera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCameraModal;