import { useState, useCallback } from 'react';

type MediaType = 'camera' | 'microphone' | 'both';

export const useMediaPermissions = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const requestAccess = useCallback(async (type: MediaType) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: type === 'camera' || type === 'both' ? {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: type === 'microphone' || type === 'both' ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasAccess(true);
      return mediaStream;
      
    } catch (error) {
      console.error('Errore accesso media:', error);
      setHasAccess(false);
      throw error;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setHasAccess(false);
    }
  }, [stream]);

  return { hasAccess, requestAccess, stopStream, stream };
}; 