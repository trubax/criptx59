export function VideoModal({ open, onOpenChange, onSubmit }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (video: File, caption: string) => Promise<void>;
}) {
  const [video, setVideo] = useState<File | null>(null);
  const [caption, setCaption] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold theme-text">Carica nuovo video</h2>
        
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
          className="theme-text"
        />
        
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Aggiungi una descrizione..."
          className="w-full p-2 rounded-lg theme-bg-secondary theme-text"
          rows={3}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg theme-bg-secondary theme-text"
          >
            Annulla
          </button>
          <button
            onClick={() => video && onSubmit(video, caption)}
            disabled={!video}
            className="px-4 py-2 rounded-lg theme-bg-accent theme-text-accent disabled:opacity-50"
          >
            Pubblica
          </button>
        </div>
      </div>
    </Dialog>
  );
} 