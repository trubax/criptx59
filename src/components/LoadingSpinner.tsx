import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen theme-bg-base">
      <Loader2 className="w-8 h-8 animate-spin theme-text" />
    </div>
  );
} 