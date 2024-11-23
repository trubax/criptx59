import { Dialog } from './Dialog';

interface ContentCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitDisabled?: boolean;
}

export function ContentCreationDialog({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  submitLabel,
  isSubmitDisabled
}: ContentCreationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6 theme-bg-primary">
        <h2 className="text-xl font-semibold theme-text mb-6">{title}</h2>
        
        <div className="space-y-4">
          {children}

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg theme-bg-secondary theme-text hover:opacity-80 transition-opacity"
            >
              Annulla
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className="px-4 py-2 rounded-lg theme-bg-accent theme-text-accent hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 