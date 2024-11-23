import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface MediaUploadOptions {
  chatId: string;
  userId: string;
  isGroup: boolean;
  isAnonymous: boolean;
  messageType: 'audio' | 'image' | 'video' | 'file';
}

export class MediaHandlerService {
  private static instance: MediaHandlerService;
  
  static getInstance() {
    if (!MediaHandlerService.instance) {
      MediaHandlerService.instance = new MediaHandlerService();
    }
    return MediaHandlerService.instance;
  }

  async processAndUploadMedia(file: File | Blob, options: MediaUploadOptions): Promise<string> {
    const processedFile = await this.processMedia(file, options.messageType);
    return this.uploadMedia(processedFile, options);
  }

  private async processMedia(file: File | Blob, type: string): Promise<File | Blob> {
    switch(type) {
      case 'image':
        return this.processImage(file);
      case 'audio':
        return this.processAudio(file);
      default:
        return file;
    }
  }

  // ... metodi di processamento specifici per tipo di media
} 