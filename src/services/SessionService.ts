import { db } from '../firebase';
import { doc, setDoc, onSnapshot, deleteDoc, query, where, getDocs, collection, serverTimestamp, getDoc, orderBy, updateDoc, limit } from 'firebase/firestore';
import { NotificationService } from './NotificationService';
import { AccessService } from './AccessService';
import { v4 as uuidv4 } from 'uuid';

interface DeviceInfo {
  platform: string;
  browser: string;
  os: string;
  ip?: string;
  location?: string;
}

interface Session {
  sessionId: string;
  deviceInfo: DeviceInfo;
  lastActive: Date;
  isCurrentSession: boolean;
  createdAt: Date;
}

export class SessionService {
  private static instance: SessionService;
  private currentSessionId: string | null = null;
  private userId: string | null = null;
  private unsubscribe: (() => void) | null = null;
  private lastActiveInterval: NodeJS.Timeout | null = null;

  static getInstance() {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  private getDevicePlatform(): string {
    const ua = navigator.userAgent;
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
      return 'Mobile';
    } else if (/tablet|ipad/i.test(ua)) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  async registerSession(userId: string) {
    try {
      // Verifica se esiste già una sessione attiva
      const hasExistingSession = await this.findExistingSession(userId);
      if (hasExistingSession) {
        console.log('Sessione esistente trovata, riutilizzo...');
        return this.currentSessionId;
      }

      // Se non esiste una sessione attiva, ne crea una nuova
      this.userId = userId;
      this.currentSessionId = uuidv4();
      
      const deviceInfo = {
        platform: this.getDevicePlatform(),
        browser: this.getBrowserInfo(),
        os: this.getOSInfo(),
        fingerprint: await this.generateBrowserFingerprint()
      };

      const sessionData = {
        deviceInfo,
        isActive: true,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      };

      // Prima salviamo nel localStorage
      localStorage.setItem('currentSessionId', this.currentSessionId);

      // Poi salviamo in Firestore
      await setDoc(
        doc(db, `users/${userId}/sessions`, this.currentSessionId),
        sessionData
      );
      
      this.startSessionMonitoring(userId);
      this.monitorOtherSessions(userId);
      
      return this.currentSessionId;
    } catch (error) {
      console.error('Errore durante la registrazione della sessione:', error);
      // In caso di errore, rimuoviamo dal localStorage
      localStorage.removeItem('currentSessionId');
      return null;
    }
  }

  private async findExistingSession(userId: string): Promise<boolean> {
    try {
      const currentSessionId = localStorage.getItem('currentSessionId');
      if (!currentSessionId) return false;

      const sessionRef = doc(db, `users/${userId}/sessions`, currentSessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        if (data?.isActive) {
          this.currentSessionId = currentSessionId;
          this.userId = userId;
          this.startSessionMonitoring(userId);
          this.monitorOtherSessions(userId);
          console.log('Sessione esistente trovata e valida:', currentSessionId);
          return true;
        } else {
          // Se la sessione esiste ma non è attiva, rimuoviamo dal localStorage
          localStorage.removeItem('currentSessionId');
        }
      } else {
        // Se la sessione non esiste più in Firestore, rimuoviamo dal localStorage
        localStorage.removeItem('currentSessionId');
      }

      return false;
    } catch (error) {
      console.error('Errore nella verifica della sessione esistente:', error);
      return false;
    }
  }

  private async generateBrowserFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency,
      navigator.platform
    ];
    
    const fingerprint = components.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser sconosciuto';
  }

  private getOSInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Sistema sconosciuto';
  }

  private async monitorOtherSessions(userId: string) {
    const sessionsRef = collection(db, `users/${userId}/sessions`);
    const q = query(
      sessionsRef,
      where('isActive', '==', true)
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const session = { id: change.doc.id, ...change.doc.data() };
        
        if (change.type === 'added' && session.id !== this.currentSessionId) {
          this.handleNewSession(session);
        }
        
        if (change.type === 'removed' && session.id === this.currentSessionId) {
          this.handleSessionTerminated(session);
        }
      });
    });
  }

  private async handleNewSession(session: any) {
    const notification = await NotificationService.getInstance().showNotification(
      'Nuova sessione rilevata',
      {
        body: `Accesso rilevato da: ${session.deviceInfo.platform}`,
        icon: '/app-icon.png',
        data: {
          sessionId: session.sessionId,
          type: 'new_session'
        },
        actions: [
          {
            action: 'terminate',
            title: 'Disconnetti'
          }
        ]
      }
    );

    if (notification) {
      notification.onclick = async () => {
        await this.terminateSession(session.sessionId);
      };
    }
  }

  private async handleSessionTerminated(session: any) {
    NotificationService.getInstance().showNotification(
      'Sessione terminata',
      {
        body: `La sessione su ${session.deviceInfo.platform} è stata chiusa`,
        icon: '/app-icon.png'
      }
    );
  }

  async terminateSession(userId: string, sessionId: string) {
    try {
      const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
      
      // Prima aggiorniamo lo stato a inattivo
      await updateDoc(sessionRef, {
        isActive: false,
        terminatedAt: serverTimestamp()
      });

      // Poi eliminiamo il documento
      await deleteDoc(sessionRef);

      if (sessionId === this.currentSessionId) {
        this.currentSessionId = null;
        this.userId = null;
        localStorage.removeItem('currentSessionId');
      }
    } catch (error) {
      console.error('Errore durante la terminazione della sessione:', error);
    }
  }

  private async updateLastActive() {
    if (!this.currentSessionId || !this.userId) return;
    
    await setDoc(
      doc(db, `users/${this.userId}/sessions`, this.currentSessionId), 
      {
        lastActive: serverTimestamp()
      }, 
      { merge: true }
    );
  }

  async cleanup(isRefresh: boolean = false) {
    try {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      if (this.lastActiveInterval) {
        clearInterval(this.lastActiveInterval);
      }
      
      // Modifica per iOS PWA: non eliminare la sessione se è una PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (!isRefresh && !(isPWA && isIOS)) {
        const storedSessionId = localStorage.getItem('currentSessionId');
        if (storedSessionId && this.userId) {
          const sessionRef = doc(db, `users/${this.userId}/sessions`, storedSessionId);
          await deleteDoc(sessionRef);
          localStorage.removeItem('currentSessionId');
        }
      }
      
      // Non resettare le variabili di istanza se è una PWA iOS
      if (!(isPWA && isIOS)) {
        this.currentSessionId = null;
        this.userId = null;
      }
    } catch (error) {
      console.error('Errore durante la pulizia della sessione:', error);
    }
  }

  async getSessions(userId: string) {
    try {
      const currentSessionId = localStorage.getItem('currentSessionId');
      const sessionsRef = collection(db, `users/${userId}/sessions`);
      // Rimuoviamo il filtro isActive per ottenere tutte le sessioni
      const snapshot = await getDocs(sessionsRef);
      
      const sessions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          sessionId: doc.id,
          deviceInfo: data.deviceInfo || {
            platform: 'Unknown',
            browser: 'Unknown',
            os: 'Unknown'
          },
          lastActive: data.lastActive?.toDate() || new Date(),
          isCurrentSession: doc.id === currentSessionId,
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive || false
        };
      }).filter(session => session.isActive); // Filtriamo solo le sessioni attive dopo averle mappate

      return sessions.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
    } catch (error) {
      console.error('Errore nel recupero delle sessioni:', error);
      return [];
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    if (!this.currentSessionId) return null;
    
    const docRef = doc(db, `users/${this.userId}/sessions`, this.currentSessionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return {
      sessionId: docSnap.id,
      deviceInfo: data.deviceInfo,
      lastActive: data.lastActive.toDate(),
      isCurrentSession: true,
      createdAt: data.createdAt.toDate()
    };
  }

  private startSessionMonitoring(userId: string) {
    if (this.lastActiveInterval) {
      clearInterval(this.lastActiveInterval);
    }

    this.lastActiveInterval = setInterval(() => {
      this.updateLastActive();
    }, 60000);
  }

  private async getIpAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Errore nel recupero IP:', error);
      return 'Unknown';
    }
  }

  private async getLocation(): Promise<string> {
    try {
      const response = await fetch('http://ip-api.com/json/');
      const data = await response.json();
      return `${data.city}, ${data.country}`;
    } catch (error) {
      console.error('Errore nel recupero location:', error);
      return 'Unknown';
    }
  }
} 