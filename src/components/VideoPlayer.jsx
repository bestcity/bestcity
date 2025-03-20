// frontend/src/components/VideoPlayer.jsx
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ src, onPlaying }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const recoveryAttemptsRef = useRef(0);
  const lastPlayingTimeRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('Video player mounting with source:', src);
    
    // Reset recovery attempts on source change
    recoveryAttemptsRef.current = 0;

    // Function to create and setup HLS
    const setupHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        debug: false,
        enableWorker: true,
        fragLoadingMaxRetry: 15,
        manifestLoadingMaxRetry: 15,
        levelLoadingMaxRetry: 15,
        fragLoadingRetryDelay: 500,
        manifestLoadingRetryDelay: 500,
        levelLoadingRetryDelay: 500,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        liveDurationInfinity: true,
        // Smaller buffer for live content
        maxBufferLength: 15,
        maxMaxBufferLength: 30
      });
      
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, attempting to play');
        video.play().catch(err => console.error('Play failed:', err));
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error, trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error, trying to recover');
              hls.recoverMediaError();
              break;
            default:
              console.log('Fatal error, recreating HLS instance');
              // Completely reinitialize on fatal errors
              setTimeout(() => setupHls(), 1000);
              break;
          }
        }
      });
      
      hlsRef.current = hls;
    };

    // Set up event listeners
    const handlePlaying = () => {
      console.log('Video is playing!');
      setHasStartedPlaying(true);
      lastPlayingTimeRef.current = Date.now();
      recoveryAttemptsRef.current = 0;
      if (onPlaying) onPlaying();
    };

    const handleError = (e) => {
      console.error('Video error:', e);
      attemptRecovery();
    };

    const handleStalled = () => {
      console.log('Video stalled');
      attemptRecovery();
    };

    const handleWaiting = () => {
      console.log('Video waiting');
      // If waiting for too long, attempt recovery
      setTimeout(() => {
        if (video.readyState < 3) {
          console.log('Still waiting, attempting recovery');
          attemptRecovery();
        }
      }, 3000);
    };

    // Comprehensive recovery function
    const attemptRecovery = () => {
      recoveryAttemptsRef.current += 1;
      console.log(`Recovery attempt ${recoveryAttemptsRef.current}`);
      
      const timeSinceLastPlay = Date.now() - lastPlayingTimeRef.current;
      
      if (recoveryAttemptsRef.current < 3) {
        // First few attempts: just try to play
        video.play().catch(() => {});
      } else if (recoveryAttemptsRef.current < 5) {
        // Next attempts: restart the stream
        if (hlsRef.current) {
          hlsRef.current.stopLoad();
          hlsRef.current.startLoad();
          setTimeout(() => video.play().catch(() => {}), 500);
        }
      } else {
        // Last resort: completely rebuild the player
        console.log('Complete rebuild of HLS player');
        setupHls();
        recoveryAttemptsRef.current = 0;
      }
      
      // If it's been very long since playing, force a reload anyway
      if (timeSinceLastPlay > 15000) {
        console.log('Long time since last successful playback, forcing reload');
        setupHls();
        recoveryAttemptsRef.current = 0;
      }
    };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);

    // Initialize HLS
    if (Hls.isSupported()) {
      setupHls();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.error('Play failed:', err));
      });
    } else {
      console.error('HLS is not supported in this browser');
    }

    // Set up periodic health check
    const healthCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastPlay = now - lastPlayingTimeRef.current;
      
      if (timeSinceLastPlay > 10000 && hasStartedPlaying) {
        console.log('Health check: No playing event for 10s, attempting recovery');
        attemptRecovery();
      }
    }, 5000);

    return () => {
      clearInterval(healthCheckInterval);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, onPlaying]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <video
        ref={videoRef}
        controls
        style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
        playsInline
        muted
        autoPlay
      />
    </div>
  );
};

export default VideoPlayer;