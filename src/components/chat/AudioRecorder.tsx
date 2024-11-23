import React, { useState, useRef } from 'react';
import { Mic, Square, Send } from 'lucide-react';

interface AudioRecorderProps {
  onSend: (audioUrl: string) => void;
  onRecordingChange: (isRecording: boolean) => void;
}

export default function AudioRecorder({ onSend, onRecordingChange }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      onRecordingChange(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingChange(false);
    }
  };

  const handleSend = async () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      onSend(url);
      setAudioBlob(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !audioBlob && (
        <button onClick={startRecording} className="p-2 rounded-full hover:bg-gray-100">
          <Mic className="w-5 h-5" />
        </button>
      )}
      
      {isRecording && (
        <button onClick={stopRecording} className="p-2 rounded-full hover:bg-gray-100">
          <Square className="w-5 h-5 text-red-500" />
        </button>
      )}

      {audioBlob && (
        <button onClick={handleSend} className="p-2 rounded-full hover:bg-gray-100">
          <Send className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}