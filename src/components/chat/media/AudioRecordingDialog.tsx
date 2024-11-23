import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Pause, Play, Send, Square, X } from 'lucide-react';

interface AudioRecordingDialogProps {
  onClose: () => void;
  onSend: (file: File) => Promise<void>;
}

export default function AudioRecordingDialog({ onClose, onSend }: AudioRecordingDialogProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let mounted = true;

    const initRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(100);
        setIsRecording(true);
        startTimer();
        startAudioLevelMonitoring();
        setError(null);

      } catch (err: any) {
        console.error('Error initializing recording:', err);
        if (mounted) {
          if (err.name === 'NotAllowedError') {
            setError('Permessi microfono negati. Controlla le impostazioni del browser.');
          } else {
            setError('Errore durante l\'avvio della registrazione. Riprova.');
          }
        }
      }
    };

    initRecording();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        const newValue = prev + 0.1;
        return Number(newValue.toFixed(1));
      });
    }, 100);
  }, []);

  const startAudioLevelMonitoring = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let animationFrame: number;
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      setAudioLevel(Math.min(100, average));
      
      animationFrame = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (isRecording && analyserRef.current) {
      cleanup = startAudioLevelMonitoring();
    }
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isRecording, startAudioLevelMonitoring]);

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      startTimer();
      setIsPaused(false);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !streamRef.current) return;
    
    setIsProcessing(true);
    clearInterval(timerRef.current);

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = async () => {
        try {
          if (duration >= 0.5) {
            const audioBlob = new Blob(chunksRef.current, { 
              type: mediaRecorder.mimeType 
            });

            const file = new File([audioBlob], `audio_${Date.now()}.${
              mediaRecorder.mimeType.includes('webm') ? 'webm' : 'm4a'
            }`, { type: mediaRecorder.mimeType });

            setAudioFile(file);
            setIsRecording(false);
          } else {
            setError('Registrazione troppo breve');
          }
        } catch (err) {
          setError('Errore processamento audio');
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
        resolve();
      };

      mediaRecorder.stop();
      cleanup();
    });
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  };

  const handleSend = async () => {
    if (!audioFile) return;
    
    try {
      setError(null);
      console.log('Invio audio:', {
        size: audioFile.size,
        type: audioFile.type
      });
      
      // Invia l'audio a ChatView per l'elaborazione e l'upload
      await onSend(audioFile);
      cleanup();
      onClose();
    } catch (err) {
      console.error('Errore invio audio:', err);
      setError('Errore durante l\'invio dell\'audio');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Browser non supportato');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      startTimer();
      startAudioLevelMonitoring();
      setError(null);

    } catch (err: any) {
      console.error('Error initializing recording:', err);
      if (mounted) {
        if (err.name === 'NotAllowedError') {
          setError('Permessi microfono negati. Controlla le impostazioni del browser.');
        } else {
          setError('Errore durante l\'avvio della registrazione. Riprova.');
        }
      }
    }
  };

  const AudioVisualizer = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [bars] = useState(() => new Array(32).fill(0));
    
    useEffect(() => {
      if (!canvasRef.current || !analyserRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      const analyser = analyserRef.current;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        if (!isRecording) return;
        
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        
        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / bars.length;
        
        ctx.clearRect(0, 0, width, height);
        
        // Disegna le barre della frequenza
        for (let i = 0; i < bars.length; i++) {
          const barIndex = Math.floor(i * bufferLength / bars.length);
          const value = dataArray[barIndex];
          const barHeight = (value / 255) * height;
          
          ctx.fillStyle = '#60A5FA'; // blue-400
          ctx.fillRect(
            i * barWidth, 
            height - barHeight, 
            barWidth - 1,
            barHeight
          );
        }
      };
      
      draw();
    }, [isRecording, bars]);
    
    return (
      <div className="relative w-full h-12 bg-gray-100/10 dark:bg-gray-800/30 rounded-lg overflow-hidden">
        {/* Traccia di avanzamento */}
        <div 
          className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5"
          style={{ width: `${(duration / 300) * 100}%` }} // 300 secondi = 5 minuti max
        />
        
        {/* Visualizzatore frequenze */}
        <canvas
          ref={canvasRef}
          width={320}
          height={48}
          className="w-full h-full"
        />
      </div>
    );
  };

  const ProcessingOverlay = () => {
    return (
      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex flex-col items-center justify-center gap-4 z-10">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Elaborazione audio...</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="audio-dialog theme-bg rounded-lg p-4 w-full max-w-sm shadow-lg relative">
        {isProcessing && <ProcessingOverlay />}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold theme-text">Registrazione Audio</h3>
            <button onClick={onClose} className="p-1.5 hover:theme-bg-secondary rounded-full">
              <X className="w-5 h-5 theme-text" />
            </button>
          </div>

          <AudioVisualizer />

          <div className="text-2xl font-mono theme-text text-center">
            {formatTime(Math.floor(duration))}
          </div>

          <div className="flex justify-center gap-4">
            {isRecording ? (
              <>
                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="p-3 rounded-full hover:theme-bg-secondary"
                  disabled={isProcessing}
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </button>
                <button
                  onClick={stopRecording}
                  disabled={isProcessing || duration < 0.5}
                  className="p-3 bg-red-500 hover:bg-red-600 rounded-full disabled:opacity-50"
                >
                  <Square className="w-6 h-6 text-white" />
                </button>
              </>
            ) : audioFile ? (
              <button
                onClick={handleSend}
                className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
                title="Invia messaggio vocale"
              >
                <Send className="w-6 h-6" />
              </button>
            ) : null}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
} 