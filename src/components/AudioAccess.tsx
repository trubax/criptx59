import { useEffect, useRef, useState } from 'react';
import { useMediaPermissions } from '../hooks/useMediaPermissions';

export default function AudioAccess() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { requestAccess, stopStream } = useMediaPermissions();

  const startRecording = async () => {
    try {
      const stream = await requestAccess('microphone');
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        // Qui puoi gestire l'audio registrato
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      alert('Per utilizzare questa funzione, concedi l\'accesso al microfono nelle impostazioni del browser');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      stopStream();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex gap-4 p-4">
      <button 
        onClick={startRecording}
        disabled={isRecording}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        Registra Audio
      </button>
      <button 
        onClick={stopRecording}
        disabled={!isRecording}
        className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
      >
        Stop
      </button>
    </div>
  );
} 