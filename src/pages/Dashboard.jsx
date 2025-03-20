// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { camerasApi } from '../services/api';
import { Search, ChevronDown, Maximize2, Grid } from 'lucide-react';
import CameraCard from '../components/CameraCard.jsx';
import { Camera } from 'lucide-react';

const Dashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridLayout, setGridLayout] = useState('grid-cols-3');
  
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
  
  const toggleGridLayout = () => {
    setGridLayout(gridLayout === 'grid-cols-3' ? 'grid-cols-2' : 'grid-cols-3');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm flex items-center justify-between p-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Live View</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Filters */}
          <div className="flex">
            <div className="relative">
              <button className="flex items-center px-3 py-2 border rounded-l-md bg-white">
                <span className="mr-2">Locations</span>
                <ChevronDown size={16} />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center px-3 py-2 border-t border-b border-r rounded-r-md bg-white">
                <span className="mr-2">All groups</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by camera name" 
              className="px-3 py-2 border rounded-md pr-10" 
            />
            <Search className="absolute right-3 top-2 text-gray-400" size={20} />
          </div>
          
          {/* Grid view toggle */}
          <button 
            className="p-2 border rounded-md hover:bg-gray-100"
            onClick={toggleGridLayout}
          >
            <Grid size={20} />
          </button>
          
          {/* Fullscreen toggle */}
          <button className="p-2 border rounded-md hover:bg-gray-100">
            <Maximize2 size={20} />
          </button>
        </div>
      </header>
      
      {/* Camera grid */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Camera size={64} className="text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No cameras found</p>
            <p className="text-gray-500">Add cameras from the Devices page</p>
          </div>
        ) : (
          <div className={`grid ${gridLayout} gap-4`}>
            {cameras.map((camera) => (
              <CameraCard key={camera.id} camera={camera} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Dashboard;