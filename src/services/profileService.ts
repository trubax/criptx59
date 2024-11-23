import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  getDoc 
} from 'firebase/firestore';

interface SearchResult {
  id: string;
  type: 'user' | 'service' | 'activity';
  title: string;
  description?: string;
  photoURL?: string;
}

export const profileService = {
  async getUserProfile(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Profilo non trovato');
      }

      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Errore nel recupero del profilo:', error);
      throw error;
    }
  },

  async searchProfiles(searchQuery: string): Promise<SearchResult[]> {
    if (!searchQuery || searchQuery.length < 2) {
      return [];
    }

    try {
      const results: SearchResult[] = [];
      const searchTerms = searchQuery.toLowerCase().split(' ');
      
      // Ricerca utenti
      const usersRef = collection(db, 'users');
      const userQueries = searchTerms.map(term => 
        query(
          usersRef,
          where('searchableTerms', 'array-contains', term),
          limit(5)
        )
      );

      for (const q of userQueries) {
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!results.some(r => r.id === doc.id)) {
            results.push({
              id: doc.id,
              type: 'user',
              title: data.displayName,
              description: data.bio,
              photoURL: data.photoURL
            });
          }
        });
      }

      return results.slice(0, 10); // Limitiamo i risultati totali
    } catch (error) {
      console.error('Errore durante la ricerca:', error);
      return [];
    }
  }
}; 