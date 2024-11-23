import { Plus, Play } from 'lucide-react';
import { useState } from 'react';
import { ContentCreationDialog } from '../ui/ContentCreationDialog';
import { ContentDetailDialog } from '../ui/ContentDetailDialog';

interface Video {
  id: string;
  url: string;
  caption: string;
  views: number;
}

interface VideoGridProps {
  isOwnProfile: boolean;
}

export function VideoGrid({ isOwnProfile }: VideoGridProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [newVideo, setNewVideo] = useState<{
    file: File | null;
    caption: string;
  }>({
    file: null,
    caption: ''
  });
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleCreateVideo = async () => {
    if (!newVideo.file) return;

    try {
      const videoUrl = URL.createObjectURL(newVideo.file);
      
      const video: Video = {
        id: crypto.randomUUID(),
        url: videoUrl,
        caption: newVideo.caption,
        views: 0
      };

      setVideos([video, ...videos]);
      setIsCreating(false);
      setNewVideo({ file: null, caption: '' });
    } catch (error) {
      console.error('Errore durante il caricamento del video:', error);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo video?')) {
      setVideos(videos.filter(video => video.id !== videoId));
      setSelectedVideo(null);
    }
  };

  const handleUpdateVideo = async (videoId: string, data: { caption?: string }) => {
    setVideos(videos.map(video => 
      video.id === videoId 
        ? { ...video, ...data }
        : video
    ));
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedVideo) return;
    
    const currentIndex = videos.findIndex(video => video.id === selectedVideo.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
    } else {
      newIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedVideo(videos[newIndex]);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {isOwnProfile && (
          <button
            onClick={() => setIsCreating(true)}
            className="aspect-square theme-bg-secondary hover:opacity-80 transition-opacity flex items-center justify-center"
          >
            <Plus className="w-8 h-8 theme-text" />
          </button>
        )}

        {videos.map((video) => (
          <div 
            key={video.id} 
            className="aspect-square group relative cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            <video 
              src={video.url}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2 text-white">
                  <Play className="w-5 h-5" />
                  <span>{video.views}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ContentCreationDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        title="Carica nuovo video"
        onSubmit={handleCreateVideo}
        submitLabel="Carica"
        isSubmitDisabled={!newVideo.file}
      >
        <div className="space-y-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setNewVideo(prev => ({ ...prev, file }));
              }
            }}
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:theme-bg-accent file:theme-text-accent hover:file:opacity-80"
          />
          
          <textarea
            value={newVideo.caption}
            onChange={(e) => setNewVideo(prev => ({ ...prev, caption: e.target.value }))}
            placeholder="Aggiungi una descrizione..."
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text resize-none"
            rows={3}
          />
        </div>
      </ContentCreationDialog>

      {selectedVideo && (
        <ContentDetailDialog
          open={!!selectedVideo}
          onOpenChange={(open) => !open && setSelectedVideo(null)}
          type="video"
          content={{
            id: selectedVideo.id,
            mediaUrl: selectedVideo.url,
            caption: selectedVideo.caption,
            comments: []
          }}
          onDelete={() => handleDeleteVideo(selectedVideo.id)}
          onUpdate={(data) => handleUpdateVideo(selectedVideo.id, data)}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
} 