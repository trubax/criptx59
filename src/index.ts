import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Configurazione Firebase
const firebaseConfig = {
  // ... le tue configurazioni Firebase
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza i servizi
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); 