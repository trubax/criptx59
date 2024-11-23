export default function AttachmentDialog({ onClose, onFileSelect }: AttachmentDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (type: 'photo' | 'video' | 'document') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'photo' ? 'image/*' : 
                                   type === 'video' ? 'video/*' : 
                                   '.pdf,.doc,.docx,.txt';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-x-0 bottom-0 animate-in slide-in-from-bottom duration-200">
        <div className="theme-bg rounded-t-xl shadow-xl">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold theme-text">Allega file</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:theme-bg-secondary"
              >
                <X className="w-6 h-6 theme-text" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4">
            <button
              onClick={() => handleFileSelect('photo')}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors">
                <Image className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm theme-text">Foto</span>
            </button>

            <button
              onClick={() => handleFileSelect('video')}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm theme-text">Video</span>
            </button>

            <button
              onClick={() => handleFileSelect('document')}
              className="flex flex-col items-center gap-2"
            >
              <div className="p-4 rounded-full bg-purple-500 hover:bg-purple-600 transition-colors">
                <File className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm theme-text">File</span>
            </button>
          </div>
        </div>
      </div>
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </div>
  );
}