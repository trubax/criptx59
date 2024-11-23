import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { PhotoCropper } from './PhotoCropper';
import { PhotoService } from '../../services/PhotoService';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePhotoUploadProps {
  currentPhotoURL: string;
  onPhotoChange: (photoURL: string) => Promise<void>;
}

export default function ProfilePhotoUpload({ currentPhotoURL, onPhotoChange }: ProfilePhotoUploadProps) {
  const { currentUser } = useAuth();
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropArea, setCropArea] = useState<Area | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowCropper(true);
    }
  };

  const handleCropChange = (newCropArea: Area) => {
    setCropArea(newCropArea);
  };

  const handleSave = async () => {
    if (!selectedFile || !currentUser || !cropArea) return;
    
    setLoading(true);
    try {
      const photoURL = await PhotoService.uploadProfilePhoto(
        currentUser.uid,
        selectedFile,
        cropArea
      );
      
      await onPhotoChange(photoURL);
      setShowCropper(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <img
          src={currentPhotoURL}
          alt="Profile"
          className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-2 theme-border"
        />
        <label className="absolute bottom-0 right-0 p-1.5 rounded-full theme-bg-secondary/80 backdrop-blur-sm cursor-pointer hover:opacity-90 transition-opacity">
          <Camera className="w-3.5 h-3.5 theme-text" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-2xl rounded-lg theme-bg-base/95 backdrop-blur-sm">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold theme-text">
                  Modifica foto profilo
                </h3>
                <button
                  onClick={() => setShowCropper(false)}
                  className="p-2 rounded-full hover:theme-bg-secondary/80 transition-colors"
                >
                  <X className="w-5 h-5 theme-text" />
                </button>
              </div>
              
              {selectedFile && (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg theme-bg-secondary/80">
                  <PhotoCropper
                    photoURL={URL.createObjectURL(selectedFile)}
                    onCropComplete={handleCropChange}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t theme-border">
                <button
                  onClick={() => setShowCropper(false)}
                  className="px-4 py-2 rounded-lg hover:theme-bg-secondary/80 transition-colors theme-text"
                  disabled={loading}
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-blue-500/90 hover:bg-blue-600/90 text-white transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Salvataggio...' : 'Salva'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
} 