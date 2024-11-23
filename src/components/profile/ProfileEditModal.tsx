import { Dialog } from '../ui/Dialog';
import { useState } from 'react';
import { Camera } from 'lucide-react';
import PhotoCropper from './PhotoCropper';
import { PhotoService } from '../../services/PhotoService';
import { useAuth } from '../../hooks/useAuth';

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDisplayName: string;
  currentPhotoURL: string;
  currentBio: string;
  currentProfession: string;
  currentPassion: string;
  onSave: (data: {
    displayName: string;
    photoURL: string;
    bio: string;
    profession: string;
    passion: string;
  }) => Promise<void>;
}

export default function ProfileEditModal({
  open,
  onOpenChange,
  currentDisplayName,
  currentPhotoURL,
  currentBio,
  currentProfession,
  currentPassion,
  onSave
}: ProfileEditModalProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [photoURL, setPhotoURL] = useState(currentPhotoURL);
  const [bio, setBio] = useState(currentBio);
  const [profession, setProfession] = useState(currentProfession);
  const [passion, setPassion] = useState(currentPassion);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePhotoUpload = async (file: File, cropArea: Area) => {
    if (!currentUser) return;
    try {
      const newPhotoURL = await PhotoService.uploadProfilePhoto(currentUser.uid, file, cropArea);
      setPhotoURL(newPhotoURL);
    } catch (error) {
      console.error('Errore durante il caricamento della foto:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({ 
        displayName, 
        photoURL, 
        bio, 
        profession, 
        passion 
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6 space-y-6">
        <h3 className="text-xl font-semibold theme-text">Modifica Profilo</h3>

        <div className="space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={photoURL}
              alt={displayName}
              className="w-full h-full rounded-full object-cover border-2 theme-border"
            />
            <label className="absolute bottom-0 right-0 p-2 rounded-full theme-bg-secondary cursor-pointer">
              <Camera className="w-5 h-5 theme-text" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text mb-1">Nome utente</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 rounded-lg theme-bg-secondary theme-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium theme-text mb-1">Professione</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full p-2 rounded-lg theme-bg-secondary theme-text"
                placeholder="Es: Sviluppatore Software"
              />
            </div>

            <div>
              <label className="block text-sm font-medium theme-text mb-1">Passione</label>
              <input
                type="text"
                value={passion}
                onChange={(e) => setPassion(e.target.value)}
                className="w-full p-2 rounded-lg theme-bg-secondary theme-text"
                placeholder="Es: Fotografia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium theme-text mb-1">Biografia</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 rounded-lg theme-bg-secondary theme-text h-24 resize-none"
                placeholder="Racconta qualcosa di te..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg theme-bg-secondary theme-text"
            disabled={loading}
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg theme-bg-accent theme-text-accent"
            disabled={loading}
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </div>

      {selectedFile && (
        <PhotoCropper
          photoURL={URL.createObjectURL(selectedFile)}
          onCropComplete={(cropArea) => handlePhotoUpload(selectedFile, cropArea)}
        />
      )}
    </Dialog>
  );
} 