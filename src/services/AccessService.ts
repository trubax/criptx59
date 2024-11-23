export class AccessService {
  private static instance: AccessService;
  
  static getInstance() {
    if (!AccessService.instance) {
      AccessService.instance = new AccessService();
    }
    return AccessService.instance;
  }

  async registerAccess(userId: string, sessionId: string) {
    const accessRef = doc(collection(db, `users/${userId}/accesses`));
    
    await setDoc(accessRef, {
      sessionId,
      timestamp: serverTimestamp(),
      isActive: true
    });

    return accessRef.id;
  }

  async getAccesses(userId: string) {
    try {
      const accessesRef = collection(db, `users/${userId}/accesses`);
      const q = query(
        accessesRef,
        where('isActive', '==', true),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        accessId: doc.id,
        sessionId: doc.data().sessionId,
        timestamp: doc.data().timestamp.toDate()
      }));
    } catch (error) {
      console.error('Errore nel recupero degli accessi:', error);
      return [];
    }
  }

  async deleteAccess(userId: string, accessId: string) {
    const accessRef = doc(db, `users/${userId}/accesses`, accessId);
    await updateDoc(accessRef, {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  }

  async deleteExpiredAccesses(userId: string) {
    const accessesRef = collection(db, `users/${userId}/accesses`);
    const q = query(
      accessesRef,
      where('expiresAt', '<=', new Date()),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isActive: false,
        deletedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  }
} 