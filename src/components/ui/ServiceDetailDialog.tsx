interface ServiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDelete?: () => void;
  onUpdate?: (data: Partial<Service>) => void;
}

export function ServiceDetailDialog({
  open,
  onOpenChange,
  service,
  onNavigate,
  onDelete,
  onUpdate
}: ServiceDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (service?.description) {
      setEditText(service.description);
    }
  }, [service]);

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-xl theme-bg-primary rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 theme-border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold theme-text">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onNavigate('prev')} className="p-2 rounded-full hover:theme-bg-secondary">
                  <ChevronLeft className="w-5 h-5 theme-text" />
                </button>
                <button onClick={() => onNavigate('next')} className="p-2 rounded-full hover:theme-bg-secondary">
                  <ChevronRight className="w-5 h-5 theme-text" />
                </button>
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-2 rounded-full hover:theme-bg-secondary relative"
                >
                  <MoreVertical className="w-5 h-5 theme-text" />
                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-48 theme-bg-secondary rounded-lg shadow-lg py-1 z-10">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 hover:theme-bg-hover theme-text"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifica
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete();
                            onOpenChange(false);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 hover:theme-bg-hover text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                          Elimina
                        </button>
                      )}
                    </div>
                  )}
                </button>
                <DialogClose asChild>
                  <button className="p-2 rounded-full hover:theme-bg-secondary">
                    <X className="w-5 h-5 theme-text" />
                  </button>
                </DialogClose>
              </div>
            </div>

            {/* Contenuto */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="p-4">
                {service.category && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full theme-bg-secondary theme-text text-sm">
                      {service.category}
                    </span>
                  </div>
                )}
                
                <p className="theme-text whitespace-pre-wrap mb-4">{service.description}</p>
                {service.rate && (
                  <div className="theme-text">
                    <span className="font-semibold">Tariffa: </span>
                    {service.rate.amount} € {service.rate.unit === 'hour' ? 'all\'ora' : 
                                        service.rate.unit === 'day' ? 'al giorno' : 
                                        'a progetto'}
                  </div>
                )}
              </div>

              {/* Commenti */}
              <div className="p-4 border-t theme-border">
                <div className="space-y-4">
                  {service.comments?.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden" />
                      <div>
                        <p className="theme-text">
                          <span className="font-semibold">{comment.username}</span>{' '}
                          {comment.text}
                        </p>
                        <span className="text-xs theme-text-secondary">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t theme-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Aggiungi un commento..."
                  className="flex-1 p-2 rounded-lg theme-bg-secondary theme-text"
                />
                <button
                  className="p-2 rounded-lg theme-bg-accent theme-text-accent disabled:opacity-50"
                  disabled={!newComment.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
} 