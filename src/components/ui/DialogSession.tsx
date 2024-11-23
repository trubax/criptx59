import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogSessionProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function DialogSession({ isOpen, onClose, title, children }: DialogSessionProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md theme-bg-primary rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b theme-border">
          <h3 className="text-lg font-semibold theme-text">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:theme-bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5 theme-text opacity-70" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
} 