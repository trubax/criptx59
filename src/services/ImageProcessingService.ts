export class ImageProcessingService {
  private static instance: ImageProcessingService;
  
  static getInstance() {
    if (!ImageProcessingService.instance) {
      ImageProcessingService.instance = new ImageProcessingService();
    }
    return ImageProcessingService.instance;
  }

  async processImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        try {
          // Calcola le dimensioni ottimali
          let { width, height } = this.calculateOptimalDimensions(img.width, img.height);
          
          canvas.width = width;
          canvas.height = height;
          
          // Applica effetti base
          if (ctx) {
            ctx.filter = 'contrast(1.1) brightness(1.05)';
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converti in JPEG con qualità ottimizzata
            canvas.toBlob((blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg'
                });
                resolve(optimizedFile);
              } else {
                reject(new Error('Errore durante l\'elaborazione dell\'immagine'));
              }
            }, 'image/jpeg', 0.85);
          }
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Errore caricamento immagine'));
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateOptimalDimensions(width: number, height: number): { width: number; height: number } {
    const MAX_DIMENSION = 1280;
    const aspectRatio = width / height;

    if (width > height && width > MAX_DIMENSION) {
      return {
        width: MAX_DIMENSION,
        height: Math.round(MAX_DIMENSION / aspectRatio)
      };
    } else if (height > MAX_DIMENSION) {
      return {
        width: Math.round(MAX_DIMENSION * aspectRatio),
        height: MAX_DIMENSION
      };
    }

    return { width, height };
  }
} 