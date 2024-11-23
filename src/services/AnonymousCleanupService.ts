import { db, storage } from '../firebase';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';

export class AnonymousCleanupService {
  private static instance: AnonymousCleanupService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AnonymousCleanupService();
    }
    return this.instance;
  }

  async cleanupAnonymousData(userId: string) {
    try {
      const batch = writeBatch(db);

      // Aggiungi pulizia sessioni
      const sessionsRef = collection(db, `users/${userId}/sessions`);
      const sessionsSnapshot = await getDocs(sessionsRef);
      sessionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // 1. Elimina tutti i messaggi nelle chat
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId)
      );
      const chatsSnapshot = await getDocs(chatsQuery);
      
      for (const chatDoc of chatsSnapshot.docs) {
        // Elimina i messaggi
        const messagesSnapshot = await getDocs(collection(db, `chats/${chatDoc.id}/messages`));
        messagesSnapshot.docs.forEach(messageDoc => {
          batch.delete(doc(db, `chats/${chatDoc.id}/messages`, messageDoc.id));
        });
        
        // Elimina la chat
        batch.delete(doc(db, 'chats', chatDoc.id));
        
        // Elimina i media della chat
        const chatMediaRef = ref(storage, `chat_media/${chatDoc.id}/${userId}`);
        try {
          const mediaList = await listAll(chatMediaRef);
          await Promise.all(mediaList.items.map(item => deleteObject(item)));
        } catch (error) {
          console.log('Nessun media da eliminare per la chat:', chatDoc.id);
        }
      }

      // 2. Elimina il documento utente
      batch.delete(doc(db, 'users', userId));

      // 3. Esegui tutte le operazioni di batch
      await batch.commit();

      // 4. Elimina la foto profilo dallo storage
      const profilePhotoRef = ref(storage, `profile_photos/${userId}`);
      try {
        const photoList = await listAll(profilePhotoRef);
        await Promise.all(photoList.items.map(item => deleteObject(item)));
      } catch (error) {
        console.log('Nessuna foto profilo da eliminare');
      }

      // 5. Pulisci il localStorage
      localStorage.removeItem('anonymousLoginTime');
      localStorage.removeItem('anonymousUserId');

    } catch (error) {
      console.error('Errore durante la pulizia dei dati anonimi:', error);
      throw error;
    }
  }
} 