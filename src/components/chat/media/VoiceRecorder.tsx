import { useState, useRef, useEffect } from 'react';
import { Mic, Send, X, Pause, Play } from 'lucide-react';
import { PermissionsService } from '../../../services/PermissionsService';
import { MediaService } from '../../../services/MediaService';

interface VoiceRecorderProps {
  onSend: (file: File) => Promise<void>;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const { granted } = await PermissionsService.getInstance().checkAndRequestPermissions('audio');
      if (!granted) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error('Errore avvio registrazione:', err);
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.pause();
    setIsPaused(true);
    clearInterval(timerRef.current);
  };

  const resumeRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.resume();
    setIsPaused(false);
    startTimer();
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    clearInterval(timerRef.current);

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
    setAudioFile(file);
    setIsRecording(false);
  };

  const handleSend = async () => {
    if (!audioFile) return
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
    }, 1000);
  };

  return (
    <div>
      {isRecording && (
        <button onClick={pauseRecording}>
          <Pause />
        </button>
      )}
      {!isRecording && (
        <button onClick={startRecording}>
          <Mic />
        </button>
      )}
      {!isRecording && audioFile && (
        <button onClick={handleSend}>
          <Send />
        </button>
      )}
      {!isRecording && (
        <button onClick={onCancel}>
          <X />
        </button>
      )}
      {isRecording && (
        <button onClick={resumeRecording}>
          <Play />
        </button>
      )}
      {isRecording && (
        <p>Recording time: {recordingTime} seconds</p>
      )}
    </div>
  );
} 