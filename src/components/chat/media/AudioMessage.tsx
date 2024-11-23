export default function AudioMessage({ file }: { file: File }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg">
      <button
        onClick={togglePlay}
        className="p-2 rounded-full hover:bg-blue-500/20"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-blue-500" />
        ) : (
          <Play className="w-5 h-5 text-blue-500" />
        )}
      </button>
      
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <audio
        ref={audioRef}
        src={URL.createObjectURL(file)}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          setProgress((audio.currentTime / audio.duration) * 100);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />
    </div>
  );
} 