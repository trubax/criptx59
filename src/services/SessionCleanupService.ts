export class SessionCleanupService {
  private static instance: SessionCleanupService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new SessionCleanupService();
    }
    return this.instance;
  }

  startCleanupInterval() {
    // Esegui pulizia ogni ora
    this.cleanupInterval = setInterval(() => this.cleanupInactiveSessions(), 3600000);
  }

  async cleanupInactiveSessions() {
    const batch = writeBatch(db);
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const timeLimit = userData.isAnonymous 
        ? 24 * 60 * 60 * 1000  // 24 ore per utenti anonimi
        : 7 * 24 * 60 * 60 * 1000; // 7 giorni per utenti normali

      const sessionsRef = collection(db, `users/${userDoc.id}/sessions`);
      const inactiveSessionsQuery = query(
        sessionsRef,
        where('isActive', '==', true),
        where('lastActive', '<=', new Date(Date.now() - timeLimit))
      );

      const snapshot = await getDocs(inactiveSessionsQuery);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isActive: false,
          terminatedAt: serverTimestamp()
        });
      });
    }

    await batch.commit();
  }

  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
} 