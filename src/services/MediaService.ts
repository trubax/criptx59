import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export class MediaService {
  private static instance: MediaService;
  private readonly MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50MB
  
  private constructor() {}
  
  static getInstance() {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  async uploadAudio(audioBlob: Blob, chatId: string, userId: string): Promise<string> {
    if (audioBlob.size > this.MAX_AUDIO_SIZE) {
      throw new Error('Il file audio supera il limite di 10MB');
    }

    const timestamp = Date.now();
    const audioRef = ref(storage, `chats/${chatId}/audio/${userId}_${timestamp}.webm`);
    
    const metadata = {
      contentType: 'audio/webm',
      customMetadata: {
        userId,
        timestamp: timestamp.toString(),
        type: 'voice_message'
      }
    };

    await uploadBytes(audioRef, audioBlob, metadata);
    return getDownloadURL(audioRef);
  }

  async uploadMedia(file: File, chatId: string, userId: string): Promise<string> {
    if (file.size > this.MAX_MEDIA_SIZE) {
      throw new Error('Il file supera il limite di 50MB');
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const mediaRef = ref(storage, `chats/${chatId}/media/${userId}_${timestamp}.${fileExtension}`);
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        userId,
        timestamp: timestamp.toString(),
        fileName: file.name,
        type: 'media'
      }
    };

    await uploadBytes(mediaRef, file, metadata);
    return getDownloadURL(mediaRef);
  }
} 