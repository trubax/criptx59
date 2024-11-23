import React from 'react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';

interface PhotoCropperProps {
  photoURL: string;
  onCropComplete: (croppedArea: Area) => void;
}

export function PhotoCropper({ photoURL, onCropComplete }: PhotoCropperProps) {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);

  return (
    <div className="relative h-[300px] w-full">
      <Cropper
        image={photoURL}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={(_, croppedAreaPixels) => onCropComplete(croppedAreaPixels)}
        cropShape="round"
        showGrid={false}
        className="theme-bg-primary"
      />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64">
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full theme-bg-secondary rounded-lg"
        />
      </div>
    </div>
  );
} 