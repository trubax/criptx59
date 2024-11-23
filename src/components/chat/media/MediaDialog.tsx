import { Camera, File, Image, Video } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Camera as CapacitorCamera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useMediaPermissions } from '../../../hooks/useMediaPermissions';
import { ChatMediaService } from '../../../services/ChatMediaService';

interface MediaDialogProps {
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

export default function MediaDialog({ onClose, onFileSelect }: MediaDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMediaSelect = async (type: 'photo' | 'video' | 'document' | 'camera') => {
    try {
      setError(null);
      
      if (type === 'camera') {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }
        });
        setStream(mediaStream);
        setShowCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        if (fileInputRef.current) {
          fileInputRef.current.accept = type === 'photo' ? 'image/*' : 
                                      type === 'video' ? 'video/*' : 
                                      '.pdf,.doc,.docx,.txt';
          fileInputRef.current.click();
        }
      }
    } catch (err) {
      console.error('Errore:', err);
      setError('Errore durante l\'acquisizione del file');
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      if (aspectRatio > 1) {
        canvas.width = Math.min(1920, video.videoWidth);
        canvas.height = canvas.width / aspectRatio;
      } else {
        canvas.height = Math.min(1920, video.videoHeight);
        canvas.width = canvas.height * aspectRatio;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );

      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onFileSelect(file);
        stopStream();
        onClose();
      }
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Errore durante l\'acquisizione della foto');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setError('File troppo grande. Massimo 100MB.');
        return;
      }
      onFileSelect(file);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => {
        stopStream();
        onClose();
      }}
    >
      <div 
        className="theme-bg rounded-lg w-80 h-80 shadow-lg animate-in zoom-in-50 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {showCamera ? (
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              srcObject={stream || null}
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Scatta Foto
              </button>
              <button
                onClick={() => {
                  stopStream();
                  setShowCamera(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 p-4 h-full">
              <button
                onClick={() => handleMediaSelect('camera')}
                className="flex flex-col items-center justify-center gap-3 theme-bg-secondary hover:theme-bg-accent rounded-xl transition-colors"
              >
                <div className="p-4 rounded-full bg-blue-500">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium theme-text">Fotocamera</span>
              </button>

              <button
                onClick={() => handleMediaSelect('video')}
                className="flex flex-col items-center justify-center gap-3 theme-bg-secondary hover:theme-bg-accent rounded-xl transition-colors"
              >
                <div className="p-4 rounded-full bg-red-500">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium theme-text">Video</span>
              </button>

              <button
                onClick={() => handleMediaSelect('photo')}
                className="flex flex-col items-center justify-center gap-3 theme-bg-secondary hover:theme-bg-accent rounded-xl transition-colors"
              >
                <div className="p-4 rounded-full bg-green-500">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium theme-text">Galleria</span>
              </button>

              <button
                onClick={() => handleMediaSelect('document')}
                className="flex flex-col items-center justify-center gap-3 theme-bg-secondary hover:theme-bg-accent rounded-xl transition-colors"
              >
                <div className="p-4 rounded-full bg-purple-500">
                  <File className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium theme-text">File</span>
              </button>
            </div>

            {error && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-red-500 text-sm px-4">
                {error}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    </div>
  );
} 