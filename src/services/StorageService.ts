import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Area } from 'react-easy-crop/types';

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadProfilePhoto(userId: string, file: File, cropArea: Area): Promise<string> {
    try {
      // Crea l'immagine dal file
      const img = await this.createImage(file);
      
      // Applica il crop
      const croppedCanvas = await this.getCroppedImg(img, cropArea);
      
      // Converti il canvas in blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        croppedCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Errore nella conversione del canvas in blob'));
            }
          },
          'image/jpeg',
          0.85
        );
      });

      // Upload su Firebase Storage
      const timestamp = Date.now();
      const photoRef = ref(storage, `profile_photos/${userId}_${timestamp}.jpg`);
      
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          userId,
          uploadedAt: new Date().toISOString()
        }
      };
      
      await uploadBytes(photoRef, blob, metadata);
      return await getDownloadURL(photoRef);
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw new Error('Errore durante il caricamento della foto profilo');
    }
  }

  async uploadMedia(
    userId: string, 
    file: File, 
    type: 'post' | 'video' | 'collection'
  ): Promise<{ url: string; path: string }> {
    try {
      const timestamp = Date.now();
      const fileId = crypto.randomUUID();
      const path = `users/${userId}/${type}s/${fileId}_${timestamp}`;
      const storageRef = ref(storage, path);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId,
          uploadedAt: new Date().toISOString(),
          type
        }
      };
      
      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);
      
      return { url, path };
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw new Error(`Errore durante il caricamento del ${type}`);
    }
  }

  async deleteMedia(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Errore durante l\'eliminazione del media');
    }
  }

  private createImage(url: string | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      if (typeof url === 'string') {
        image.src = url;
      } else {
        image.src = URL.createObjectURL(url);
      }
      image.onload = () => resolve(image);
      image.onerror = reject;
    });
  }

  private async getCroppedImg(
    image: HTMLImageElement,
    cropArea: Area
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Impossibile ottenere il contesto 2D del canvas');
    }

    // Calcola le dimensioni reali dell'immagine
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Imposta le dimensioni del canvas
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Disegna l'area ritagliata
    ctx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    return canvas;
  }
}