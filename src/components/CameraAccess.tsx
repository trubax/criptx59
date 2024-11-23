import { useEffect, useRef } from 'react';
import { useMediaPermissions } from '../hooks/useMediaPermissions';

export default function CameraAccess() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { requestAccess, stopStream, stream } = useMediaPermissions();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStartCamera = async () => {
    try {
      await requestAccess('camera');
    } catch (error) {
      alert('Per utilizzare questa funzione, concedi l\'accesso alla fotocamera nelle impostazioni del browser');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    context?.drawImage(videoRef.current, 0, 0);
    
    const photo = canvas.toDataURL('image/jpeg');
    return photo;
  };

  return (
    <div className="relative w-full h-full">
      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        className="w-full h-full object-cover"
      />
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button 
          onClick={handleStartCamera}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Avvia Camera
        </button>
        <button 
          onClick={stopStream}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Stop
        </button>
        <button 
          onClick={capturePhoto}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Scatta Foto
        </button>
      </div>
    </div>
  );
} 