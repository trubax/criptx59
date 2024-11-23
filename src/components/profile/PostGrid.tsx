import { Plus, Heart, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ContentCreationDialog } from '../ui/ContentCreationDialog';
import { ContentDetailDialog } from '../ui/ContentDetailDialog';
import { useAuth } from '../../hooks/useAuth';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: any;
}

interface PostGridProps {
  isOwnProfile: boolean;
}

export function PostGrid({ isOwnProfile }: PostGridProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<{
    image: File | null;
    caption: string;
  }>({
    image: null,
    caption: ''
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!currentUser) return;
      
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef, 
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      setPosts(fetchedPosts);
    };

    fetchPosts();
  }, [currentUser]);

  const handleCreatePost = async () => {
    if (!newPost.image || !currentUser) return;

    try {
      const timestamp = Date.now();
      const fileId = crypto.randomUUID();
      const storageRef = ref(storage, `users/${currentUser.uid}/posts/${fileId}_${timestamp}`);
      
      const metadata = {
        contentType: newPost.image.type,
        customMetadata: {
          userId: currentUser.uid,
          uploadedAt: new Date().toISOString()
        }
      };

      const uploadTask = await uploadBytes(storageRef, newPost.image, metadata);
      const imageUrl = await getDownloadURL(uploadTask.ref);
      
      const postRef = collection(db, 'posts');
      const newPostDoc = await addDoc(postRef, {
        userId: currentUser.uid,
        imageUrl,
        caption: newPost.caption,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp()
      });

      const post: Post = {
        id: newPostDoc.id,
        userId: currentUser.uid,
        imageUrl,
        caption: newPost.caption,
        likes: 0,
        comments: 0,
        createdAt: new Date()
      };

      setPosts([post, ...posts]);
      setIsCreating(false);
      setNewPost({ image: null, caption: '' });
    } catch (error) {
      console.error('Errore durante la creazione del post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo post?')) return;
    
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(posts.filter(post => post.id !== postId));
      setSelectedPost(null);
    } catch (error) {
      console.error('Errore durante l\'eliminazione del post:', error);
    }
  };

  const handleUpdatePost = async (postId: string, data: { caption?: string }) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, ...data }
        : post
    ));
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedPost) return;
    
    const currentIndex = posts.findIndex(post => post.id === selectedPost.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : posts.length - 1;
    } else {
      newIndex = currentIndex < posts.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedPost(posts[newIndex]);
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

        {posts.map((post) => (
          <div 
            key={post.id} 
            className="aspect-square group relative cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ContentCreationDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        title="Crea nuovo post"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          handleCreatePost();
        }}
        submitLabel="Pubblica"
        isSubmitDisabled={!newPost.image}
      >
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setNewPost(prev => ({ ...prev, image: file }));
              }
            }}
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:theme-bg-accent file:theme-text-accent hover:file:opacity-80"
          />
          
          <textarea
            value={newPost.caption}
            onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
            placeholder="Scrivi una didascalia..."
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text resize-none"
            rows={3}
          />
        </div>
      </ContentCreationDialog>

      {selectedPost && (
        <ContentDetailDialog
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          type="post"
          content={{
            id: selectedPost.id,
            mediaUrl: selectedPost.imageUrl,
            caption: selectedPost.caption,
            comments: []
          }}
          onDelete={() => handleDeletePost(selectedPost.id)}
          onUpdate={(data) => handleUpdatePost(selectedPost.id, data)}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
} 