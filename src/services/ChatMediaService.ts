import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../utils/imageCompression';

interface MediaUploadOptions {
  chatId: string;
  userId: string;
  isGroup: boolean;
  messageType: 'audio' | 'image' | 'video' | 'file';
  fileName?: string;
}

export class ChatMediaService {
  private static instance: ChatMediaService;
  
  static getInstance() {
    if (!ChatMediaService.instance) {
      ChatMediaService.instance = new ChatMediaService();
    }
    return ChatMediaService.instance;
  }

  async processAndUploadMedia(file: File | Blob, options: MediaUploadOptions): Promise<string> {
    let processedFile: File | Blob = file;
    
    switch (options.messageType) {
      case 'image':
        processedFile = await this.processImage(file as File);
        break;
      case 'video':
        processedFile = await this.processVideo(file as File);
        break;
      case 'audio':
        processedFile = await this.processAudio(file as Blob);
        break;
    }

    const fileName = options.fileName || `${Date.now()}_${file.name || 'file'}`;
    const path = this.getStoragePath(options.chatId, options.messageType, fileName);
    
    return this.uploadToStorage(processedFile, path, {
      contentType: file.type,
      customMetadata: {
        userId: options.userId,
        messageType: options.messageType,
        isGroup: options.isGroup.toString()
      }
    });
  }

  private getStoragePath(chatId: string, type: string, fileName: string): string {
    return `chats/${chatId}/${type}s/${fileName}`;
  }

  private async uploadToStorage(file: File | Blob, path: string, metadata: any): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, metadata);
    return getDownloadURL(storageRef);
  }

  private async processImage(file: File): Promise<File> {
    if (file.size > 1024 * 1024) { // > 1MB
      return compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8
      });
    }
    return file;
  }

  private async processVideo(file: File): Promise<File> {
    // Per ora ritorniamo il file originale
    // In futuro implementare compressione video
    return file;
  }

  private async processAudio(blob: Blob): Promise<Blob> {
    // Per ora ritorniamo il blob originale
    // In futuro implementare processamento audio
    return blob;
  }
} 