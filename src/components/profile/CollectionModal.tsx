export function CollectionModal({ open, onOpenChange, onSubmit }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, coverImage: File) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold theme-text">Crea nuova raccolta</h2>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome della raccolta"
          className="w-full p-2 rounded-lg theme-bg-secondary theme-text"
        />
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
          className="theme-text"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg theme-bg-secondary theme-text"
          >
            Annulla
          </button>
          <button
            onClick={() => coverImage && onSubmit(name, coverImage)}
            disabled={!name || !coverImage}
            className="px-4 py-2 rounded-lg theme-bg-accent theme-text-accent disabled:opacity-50"
          >
            Crea
          </button>
        </div>
      </div>
    </Dialog>
  );
} 