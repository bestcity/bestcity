// frontend/src/components/CameraCard.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CameraControlModal from './CameraControlModal';
import VideoPlayer from './VideoPlayer';
import { camerasApi } from '../services/api';

const CameraCard = ({ camera }) => {
  const [showControls, setShowControls] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the stream URL if camera is online
    if (camera.status === 'online') {
      setIsLoading(true);
      camerasApi.getCameraStream(camera.id)
        .then(response => {
          if (response.data.success) {
            const baseUrl = window.location.protocol + '//' + window.location.hostname + ':8000';
            const fullStreamUrl = baseUrl + response.data.stream_url;
            console.log('Stream URL:', fullStreamUrl);
            setStreamUrl(fullStreamUrl);
          }
        })
        .catch(error => {
          console.error("Error fetching stream URL:", error);
          setIsLoading(false);
        });
    }
  }, [camera.id, camera.status]);

  const handleVideoPlaying = () => {
    setIsLoading(false);
  };
  
  const handleAnalyzeVideo = () => {
    navigate(`/analysis/${camera.id}`, { state: { camera, streamUrl } });
  };

  return (
    <div className="bg-white rounded-md overflow-hidden shadow">
      <div className="relative">
        {/* Status indicator */}
        <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${
          camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        
        {/* Camera title */}
        <div className="absolute top-0 left-0 right-0 p-2 text-white bg-black bg-opacity-50 text-sm font-medium">
          {camera.name}
        </div>
        
        {/* Camera feed */}
        <div 
          className="w-full h-48 relative cursor-pointer" 
          style={{ minHeight: '200px' }}
          onClick={handleAnalyzeVideo}
        >
          {camera.status === 'online' && streamUrl ? (
            <>
              <VideoPlayer src={streamUrl} onPlaying={handleVideoPlaying} />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-500">{camera.status === 'online' ? 'Loading stream...' : 'Camera offline'}</p>
            </div>
          )}
        </div>
        
        {/* Camera controls */}
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button 
            className="w-8 h-8 bg-black bg-opacity-50 rounded-full text-white flex items-center justify-center hover:bg-opacity-70"
            onClick={(e) => {
              e.stopPropagation();
              setShowControls(true);
            }}
          >
            <Settings size={16} />
          </button>
          <button 
            className="w-8 h-8 bg-black bg-opacity-50 rounded-full text-white flex items-center justify-center hover:bg-opacity-70"
            onClick={(e) => {
              e.stopPropagation();
              handleAnalyzeVideo();
            }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Camera info */}
      <div className="p-2 bg-gray-50 text-xs">
        <p className="text-gray-500">{camera.ip}</p>
      </div>
      
      {/* Camera control modal */}
      <CameraControlModal 
        isOpen={showControls} 
        onClose={() => setShowControls(false)} 
        camera={camera} 
      />
    </div>
  );
};

export default CameraCard;