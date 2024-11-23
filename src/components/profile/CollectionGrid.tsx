import { Plus, Layers } from 'lucide-react';
import { useState } from 'react';
import { ContentCreationDialog } from '../ui/ContentCreationDialog';
import { ContentDetailDialog } from '../ui/ContentDetailDialog';

interface Collection {
  id: string;
  coverUrl: string;
  name: string;
  itemCount: number;
}

interface CollectionGridProps {
  isOwnProfile: boolean;
}

export function CollectionGrid({ isOwnProfile }: CollectionGridProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollection, setNewCollection] = useState<{
    cover: File | null;
    name: string;
  }>({
    cover: null,
    name: ''
  });
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const handleCreateCollection = async () => {
    if (!newCollection.cover || !newCollection.name) return;

    try {
      const coverUrl = URL.createObjectURL(newCollection.cover);
      
      const collection: Collection = {
        id: crypto.randomUUID(),
        coverUrl,
        name: newCollection.name,
        itemCount: 0
      };

      setCollections([collection, ...collections]);
      setIsCreating(false);
      setNewCollection({ cover: null, name: '' });
    } catch (error) {
      console.error('Errore durante la creazione della raccolta:', error);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa raccolta?')) {
      setCollections(collections.filter(collection => collection.id !== collectionId));
      setSelectedCollection(null);
    }
  };

  const handleUpdateCollection = async (collectionId: string, data: { name?: string }) => {
    setCollections(collections.map(collection => 
      collection.id === collectionId 
        ? { ...collection, ...data }
        : collection
    ));
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedCollection) return;
    
    const currentIndex = collections.findIndex(collection => collection.id === selectedCollection.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : collections.length - 1;
    } else {
      newIndex = currentIndex < collections.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedCollection(collections[newIndex]);
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

        {collections.map((collection) => (
          <div 
            key={collection.id} 
            className="aspect-square group relative cursor-pointer"
            onClick={() => setSelectedCollection(collection)}
          >
            <img 
              src={collection.coverUrl}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2 text-white">
                  <Layers className="w-5 h-5" />
                  <span>{collection.itemCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ContentCreationDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        title="Crea nuova raccolta"
        onSubmit={handleCreateCollection}
        submitLabel="Crea"
        isSubmitDisabled={!newCollection.cover || !newCollection.name}
      >
        <div className="space-y-4">
          <input
            type="text"
            value={newCollection.name}
            onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome raccolta"
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text"
          />
          
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setNewCollection(prev => ({ ...prev, cover: file }));
              }
            }}
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:theme-bg-accent file:theme-text-accent hover:file:opacity-80"
          />
        </div>
      </ContentCreationDialog>

      {selectedCollection && (
        <ContentDetailDialog
          open={!!selectedCollection}
          onOpenChange={(open) => !open && setSelectedCollection(null)}
          type="collection"
          content={{
            id: selectedCollection.id,
            mediaUrl: selectedCollection.coverUrl,
            name: selectedCollection.name,
            comments: []
          }}
          onDelete={() => handleDeleteCollection(selectedCollection.id)}
          onUpdate={(data) => handleUpdateCollection(selectedCollection.id, data)}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
} 