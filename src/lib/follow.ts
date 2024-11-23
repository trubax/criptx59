import { db, auth } from '../firebase';
import { doc, setDoc, deleteDoc, collection, writeBatch, increment, getDoc } from 'firebase/firestore';

export async function sendFollowRequest(targetUserId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const followRequestRef = doc(
    db,
    'users',
    targetUserId,
    'followRequests',
    currentUser.uid
  );

  await setDoc(followRequestRef, {
    requestedAt: new Date(),
    requesterId: currentUser.uid,
    requesterName: currentUser.displayName,
    requesterPhoto: currentUser.photoURL
  });
}

export async function followUser(targetUserId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  // Riferimenti ai documenti
  const currentUserRef = doc(db, 'users', currentUser.uid);
  const targetUserRef = doc(db, 'users', targetUserId);

  await setDoc(doc(db, 'users', currentUser.uid, 'following', targetUserId), {
    followedAt: new Date()
  });

  await setDoc(doc(db, 'users', targetUserId, 'followers', currentUser.uid), {
    followedAt: new Date()
  });

  // Aggiorna i contatori
  const batch = writeBatch(db);
  batch.update(currentUserRef, {
    'stats.following': increment(1)
  });
  batch.update(targetUserRef, {
    'stats.followers': increment(1)
  });
  
  await batch.commit();
}

export async function unfollowUser(targetUserId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  // Riferimenti ai documenti
  const currentUserRef = doc(db, 'users', currentUser.uid);
  const targetUserRef = doc(db, 'users', targetUserId);
  
  await deleteDoc(doc(db, 'users', currentUser.uid, 'following', targetUserId));
  await deleteDoc(doc(db, 'users', targetUserId, 'followers', currentUser.uid));

  // Aggiorna i contatori
  const batch = writeBatch(db);
  batch.update(currentUserRef, {
    'stats.following': increment(-1)
  });
  batch.update(targetUserRef, {
    'stats.followers': increment(-1)
  });
  
  await batch.commit();
}

export async function checkFollowRequestStatus(targetUserId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const requestDoc = await getDoc(
    doc(db, 'users', targetUserId, 'followRequests', currentUser.uid)
  );
  
  return requestDoc.exists();
} 