import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Area } from 'react-easy-crop/types';

// Funzioni helper per il cropping
const createImage = (url: string | File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    if (typeof url === 'string') {
      image.src = url;
    } else {
      image.src = URL.createObjectURL(url);
    }
    image.onload = () => resolve(image);
    image.onerror = reject;
  });

const getCroppedImg = async (
  image: HTMLImageElement,
  cropArea: Area
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Impossibile ottenere il contesto 2D del canvas');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

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
};

export class PhotoService {
  static async uploadProfilePhoto(userId: string, file: File, cropArea: Area): Promise<string> {
    try {
      const img = await createImage(file);
      const croppedCanvas = await getCroppedImg(img, cropArea);
      
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
} 