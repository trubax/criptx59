import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { compressImage } from '../utils/imageCompression';

interface MediaUploadOptions {
  chatId: string;
  userId: string;
  isGroup: boolean;
  isAnonymous: boolean;
  messageType: 'audio' | 'image' | 'video' | 'file';
  fileName?: string;
}

export class UnifiedMediaService {
  private static instance: UnifiedMediaService;
  private readonly MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  private constructor() {}

  static getInstance() {
    if (!UnifiedMediaService.instance) {
      UnifiedMediaService.instance = new UnifiedMediaService();
    }
    return UnifiedMediaService.instance;
  }

  async processAndUploadMedia(file: File | Blob, options: MediaUploadOptions): Promise<string> {
    // Verifica dimensione massima per tipo
    this.validateFileSize(file, options.messageType);
    
    // Processa il file in base al tipo
    const processedFile = await this.processMedia(file, options.messageType);
    
    // Genera nome file e percorso
    const fileName = this.generateFileName(file, options);
    const path = this.getStoragePath(options.chatId, options.messageType, fileName);
    
    // Carica il file
    return this.uploadToStorage(processedFile, path, {
      contentType: file.type,
      customMetadata: {
        userId: options.userId,
        messageType: options.messageType,
        isGroup: options.isGroup.toString(),
        isAnonymous: options.isAnonymous.toString(),
        originalFileName: (file as File).name || fileName,
        timestamp: Date.now().toString()
      }
    });
  }

  private validateFileSize(file: File | Blob, type: string) {
    const size = file.size;
    let maxSize: number;

    switch(type) {
      case 'audio':
        maxSize = this.MAX_AUDIO_SIZE;
        break;
      case 'image':
        maxSize = this.MAX_IMAGE_SIZE;
        break;
      case 'video':
        maxSize = this.MAX_VIDEO_SIZE;
        break;
      default:
        maxSize = this.MAX_FILE_SIZE;
    }

    if (size > maxSize) {
      throw new Error(`File troppo grande. Massimo ${maxSize / (1024 * 1024)}MB`);
    }
  }

  private async processMedia(file: File | Blob, type: string): Promise<File | Blob> {
    switch(type) {
      case 'image':
        return this.processImage(file as File);
      case 'video':
        return this.processVideo(file as File);
      case 'audio':
        return this.processAudio(file as Blob);
      default:
        return file;
    }
  }

  private getStoragePath(chatId: string, type: string, fileName: string): string {
    return `chats/${chatId}/${type}s/${fileName}`;
  }

  private generateFileName(file: File | Blob, options: MediaUploadOptions): string {
    const timestamp = Date.now();
    const fileId = crypto.randomUUID();
    const extension = (file as File).name ? 
      (file as File).name.split('.').pop() : 
      this.getExtensionFromType(file.type);
    
    return `${options.userId}_${fileId}_${timestamp}.${extension}`;
  }

  private getExtensionFromType(mimeType: string): string {
    const types: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'audio/webm': 'webm',
      'application/pdf': 'pdf'
    };
    return types[mimeType] || 'unknown';
  }

  private async processImage(file: File): Promise<File> {
    return await compressImage(file);
  }

  private async processVideo(file: File): Promise<File> {
    // Implementa il processamento del video
    return file;
  }

  private async processAudio(file: Blob): Promise<Blob> {
    // Implementa il processamento dell'audio
    return file;
  }

  private async uploadToStorage(file: File | Blob, path: string, metadata: any): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }
} 