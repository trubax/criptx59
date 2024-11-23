interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export async function compressImage(file: File, options: CompressionOptions): Promise<File> {
  const { maxWidth, maxHeight, quality } = options;
  
  // Crea un elemento immagine
  const image = await createImage(file);
  
  // Calcola le dimensioni mantenendo l'aspect ratio
  let width = image.width;
  let height = image.height;
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  // Crea un canvas per la compressione
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossibile creare il contesto 2D');
  
  // Disegna l'immagine ridimensionata
  ctx.drawImage(image, 0, 0, width, height);
  
  // Converti in blob con la qualità specificata
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob as Blob),
      'image/jpeg',
      quality
    );
  });
  
  // Crea un nuovo file con il blob compresso
  return new File([blob], file.name, {
    type: 'image/jpeg',
    lastModified: Date.now()
  });
}

function createImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(image.src);
      resolve(image);
    };
    image.onerror = reject;
  });
} 