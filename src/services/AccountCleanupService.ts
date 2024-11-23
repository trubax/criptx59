import { db, storage } from '../firebase';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';

export class AccountCleanupService {
  private static instance: AccountCleanupService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AccountCleanupService();
    }
    return this.instance;
  }

  async cleanupUserData(userId: string, isExpired: boolean = false) {
    try {
      const batch = writeBatch(db);

      // 1. Pulisci le chat e i messaggi
      await this.cleanupChatsAndMessages(userId, batch);

      // 2. Pulisci le sessioni
      await this.cleanupSessions(userId, batch);

      // 3. Pulisci i media dello storage
      await this.cleanupStorageMedia(userId);

      // 4. Elimina il documento utente
      batch.delete(doc(db, 'users', userId));

      // 5. Esegui il batch
      await batch.commit();

      // 6. Pulisci localStorage per utenti anonimi
      const isAnonymous = localStorage.getItem('anonymousUserId') === userId;
      if (isAnonymous || isExpired) {
        this.cleanupAnonymousData();
      }
    } catch (error) {
      console.error('Errore durante la pulizia dei dati utente:', error);
      throw error;
    }
  }

  private cleanupAnonymousData() {
    localStorage.removeItem('anonymousLoginTime');
    localStorage.removeItem('anonymousUserId');
    localStorage.removeItem('anonymousExpirationTime');
  }

  private async cleanupChatsAndMessages(userId: string, batch: any) {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );
    const chatsSnapshot = await getDocs(chatsQuery);

    for (const chatDoc of chatsSnapshot.docs) {
      // Elimina i messaggi della chat
      const messagesSnapshot = await getDocs(
        collection(db, `chats/${chatDoc.id}/messages`)
      );
      messagesSnapshot.docs.forEach(messageDoc => {
        batch.delete(doc(db, `chats/${chatDoc.id}/messages`, messageDoc.id));
      });

      // Elimina la chat
      batch.delete(doc(db, 'chats', chatDoc.id));
    }
  }

  private async cleanupSessions(userId: string, batch: WriteBatch) {
    const sessionsRef = collection(db, `users/${userId}/sessions`);
    const sessionsSnapshot = await getDocs(sessionsRef);
    sessionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
  }

  private async cleanupStorageMedia(userId: string) {
    try {
      // Elimina media delle chat
      const chatMediaRef = ref(storage, `chat_media/${userId}`);
      await this.deleteStorageFolder(chatMediaRef);

      // Elimina foto profilo
      const profilePhotoRef = ref(storage, 'profile_photos');
      const profilePhotoList = await listAll(profilePhotoRef);
      
      // Filtra tutte le foto che contengono l'userId (sia con che senza timestamp)
      const userPhotos = profilePhotoList.items.filter(item => 
        item.name.includes(userId)
      );
      
      if (userPhotos.length > 0) {
        console.log(`Eliminazione di ${userPhotos.length} foto profilo per l'utente ${userId}`);
        await Promise.all(userPhotos.map(photo => {
          console.log(`Eliminazione foto: ${photo.name}`);
          return deleteObject(photo);
        }));
      }

    } catch (error) {
      console.error('Errore durante la pulizia dei media:', error);
      throw error; // Rilanciamo l'errore per gestirlo nel chiamante
    }
  }

  private async deleteStorageFolder(folderRef: any) {
    try {
      const list = await listAll(folderRef);
      await Promise.all([
        ...list.items.map(item => deleteObject(item)),
        ...list.prefixes.map(prefix => this.deleteStorageFolder(prefix))
      ]);
    } catch (error) {
      console.log('Nessun file da eliminare in:', folderRef.fullPath);
    }
  }
}
