// frontend/src/pages/Analysis.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart2, Save, Download } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { camerasApi } from '../services/api';

const Analysis = () => {
  const { cameraId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [camera, setCamera] = useState(location.state?.camera || null);
  const [streamUrl, setStreamUrl] = useState(location.state?.streamUrl || '');
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  useEffect(() => {
    // If we don't have camera info from navigation state, fetch it
    if (!camera) {
      camerasApi.getCamera(cameraId)
        .then(response => {
          setCamera(response.data);
        })
        .catch(error => {
          console.error("Error fetching camera:", error);
        });
    }
    
    // If we don't have streamUrl from navigation state, fetch it
    if (!streamUrl && camera?.status === 'online') {
      camerasApi.getCameraStream(cameraId)
        .then(response => {
          if (response.data.success) {
            const baseUrl = window.location.protocol + '//' + window.location.hostname + ':8000';
            const fullStreamUrl = baseUrl + response.data.stream_url;
            setStreamUrl(fullStreamUrl);
          }
        })
        .catch(error => {
          console.error("Error fetching stream URL:", error);
        });
    }
  }, [cameraId, camera, streamUrl]);

  const handleVideoPlaying = () => {
    setIsLoading(false);
  };
  
  const startAnalysis = () => {
    // Here you would connect to your analysis backend
    // For now, we'll simulate some analysis results
    setIsLoading(true);
    
    setTimeout(() => {
      setAnalysisResults({
        motionDetected: true,
        objectsDetected: ['person', 'car'],
        confidence: 0.87,
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
    }, 3000);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm flex items-center justify-between p-4">
        <div className="flex items-center">
          <button 
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {camera ? camera.name : 'Camera Analysis'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            onClick={startAnalysis}
          >
            <BarChart2 size={18} className="mr-2" />
            Analyze Video
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video panel */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium">Live Feed</h3>
            </div>
            <div className="h-96 relative">
              {streamUrl ? (
                <VideoPlayer 
                  src={streamUrl} 
                  onPlaying={handleVideoPlaying} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <p className="text-gray-500">
                    {camera?.status === 'online' ? 'Loading stream...' : 'Camera offline'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Analysis panel */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-medium">Analysis Results</h3>
            </div>
            <div className="p-4 h-96 overflow-auto">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : analysisResults ? (
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-2">Detection Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Motion Detected:</span>
                        <span className="font-medium">{analysisResults.motionDetected ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Objects Detected:</span>
                        <span className="font-medium">{analysisResults.objectsDetected.join(', ')}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">{(analysisResults.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="font-medium">
                          {new Date(analysisResults.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="flex items-center px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                      <Save size={16} className="mr-2" />
                      Save Results
                    </button>
                    <button className="flex items-center px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                      <Download size={16} className="mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Click "Analyze Video" to start analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;