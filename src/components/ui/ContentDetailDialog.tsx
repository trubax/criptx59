import { Dialog } from './Dialog';
import { MoreVertical, Trash2, Edit2, Heart, MessageCircle, Send, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface ContentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'post' | 'video' | 'collection';
  content: {
    id: string;
    caption?: string;
    name?: string;
    mediaUrl: string;
    comments: Comment[];
    likes?: number;
  };
  onDelete: () => void;
  onUpdate: (data: { caption?: string; name?: string }) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

// Aggiungi questi stili all'inizio del file, dopo le interfacce
const NAVBAR_HEIGHT = '64px'; // Altezza della barra di navigazione
const COMMENT_INPUT_HEIGHT = '80px'; // Altezza del contenitore input commenti

// Aggiungi questi stili CSS
const modalStyles = `
  .modal-content {
    height: calc(100vh - ${NAVBAR_HEIGHT});
    max-height: calc(100vh - ${NAVBAR_HEIGHT});
  }

  .comments-section {
    height: calc(100% - ${COMMENT_INPUT_HEIGHT});
    overflow-y: auto;
  }

  .comment-input-container {
    position: sticky;
    bottom: 0;
    height: ${COMMENT_INPUT_HEIGHT};
    background-color: inherit;
    border-top: 1px solid var(--border-color);
    margin-top: auto;
  }
`;

export function ContentDetailDialog({
  open,
  onOpenChange,
  type,
  content,
  onDelete,
  onUpdate,
  onNavigate
}: ContentDetailDialogProps) {
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [open]);

  useEffect(() => {
    // Inserisci gli stili nel documento
    const styleElement = document.createElement('style');
    styleElement.textContent = modalStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content.caption || content.name || '');
  const [newComment, setNewComment] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleUpdate = () => {
    onUpdate({ 
      [type === 'collection' ? 'name' : 'caption']: editText 
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="modal-content-scroll">
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative flex flex-col md:flex-row w-full max-w-6xl h-[calc(100vh-120px)] theme-bg-primary rounded-xl overflow-hidden">
            {/* Area contenuto con pulsante di chiusura */}
            <div className="relative h-[50vh] md:h-auto md:w-[calc(100%-350px)] bg-black flex items-center justify-center">
              <button 
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-20"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              {/* Frecce di navigazione */}
              <button 
                onClick={() => onNavigate('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              
              {type === 'video' ? (
                <video 
                  src={content.mediaUrl} 
                  controls 
                  className="h-full w-full object-contain"
                />
              ) : (
                <img 
                  src={content.mediaUrl} 
                  alt={content.caption || content.name}
                  className="h-full w-full object-contain"
                />
              )}
              
              <button 
                onClick={() => onNavigate('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Area dettagli e commenti */}
            <div className="w-full md:w-[350px] md:min-w-[350px] flex flex-col h-full modal-content">
              {/* Header */}
              <div className="p-4 theme-border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {/* Avatar placeholder */}
                  </div>
                  <span className="font-semibold theme-text">Username</span>
                </div>
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1 hover:theme-bg-secondary rounded-full transition-colors relative"
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
                      <button
                        onClick={onDelete}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 hover:theme-bg-hover text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                        Elimina
                      </button>
                    </div>
                  )}
                </button>
              </div>

              {/* Area scrollabile per descrizione e commenti */}
              <div className="flex-1 overflow-y-auto">
                {/* Descrizione */}
                <div className="p-4 theme-border-b">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      {/* Avatar placeholder */}
                    </div>
                    <div>
                      <span className="font-semibold theme-text">Username </span>
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 rounded-lg theme-bg-secondary theme-text resize-none"
                            rows={3}
                            placeholder={type === 'collection' ? 'Nome raccolta...' : 'Scrivi una didascalia...'}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-3 py-1 rounded-lg theme-bg-secondary theme-text text-sm"
                            >
                              Annulla
                            </button>
                            <button
                              onClick={handleUpdate}
                              className="px-3 py-1 rounded-lg theme-bg-accent theme-text-accent text-sm"
                            >
                              Salva
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="theme-text">{content.caption || content.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Commenti */}
                <div className="comments-section">
                  <div className="p-4 space-y-4">
                    {content.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                          {/* Avatar placeholder */}
                        </div>
                        <div>
                          <p className="theme-text">
                            <span className="font-semibold">{comment.username}</span>{' '}
                            {comment.text}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs theme-text-secondary">
                              {comment.timestamp.toLocaleDateString()}
                            </span>
                            <button className="text-xs theme-text-secondary hover:theme-text">
                              Rispondi
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input commento fisso in basso */}
              <div className="comment-input-container">
                <div className="p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Aggiungi un commento..."
                      className="flex-1 p-2 rounded-lg theme-bg-secondary theme-text"
                    />
                    <button
                      className="p-2 rounded-lg theme-bg-accent theme-text-accent disabled:opacity-50 transition-opacity"
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 