import { useState } from 'react';
import { useCreateChat } from '../../hooks/useCreateChat';
import { Contact } from '../../types';
import { X } from 'lucide-react';

interface StartChatContactModalProps {
  contact: Contact;
  onClose: () => void;
}

export default function StartChatContactModal({ contact, onClose }: StartChatContactModalProps) {
  const [message, setMessage] = useState('');
  const { createChatWithMessage, loading } = useCreateChat();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact.userId) {
      setError('Contatto non registrato su CriptX');
      return;
    }

    try {
      await createChatWithMessage(contact.userId, message);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Errore nella creazione della chat');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md p-4 rounded-lg theme-bg-primary">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold theme-text">
            Nuovo messaggio per {contact.name}
          </h3>
          <button onClick={onClose} className="p-1 hover:theme-bg-secondary rounded-full">
            <X className="w-5 h-5 theme-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="w-full p-3 rounded-lg theme-bg-secondary theme-text resize-none focus:outline-none focus:ring-2 focus:ring-accent"
            rows={4}
          />

          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg theme-bg-secondary theme-text hover:opacity-80"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-4 py-2 rounded-lg bg-accent text-white hover:opacity-80 disabled:opacity-50"
            >
              Invia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 