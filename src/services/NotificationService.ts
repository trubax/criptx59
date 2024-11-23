import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { isPlatform } from '../utils/platform';

export interface NotificationPreferences {
  sound: boolean;
  vibration: boolean;
  background: boolean;
  preview: boolean;
  messageSound: string;
  callSound: string;
}

const DEFAULT_SETTINGS: NotificationPreferences = {
  sound: true,
  vibration: true,
  background: true,
  preview: true,
  messageSound: '/sounds/message.mp3',
  callSound: '/sounds/call.mp3'
};

export class NotificationService {
  private static instance: NotificationService;
  private initialized: boolean = false;
  private messageSound: HTMLAudioElement;
  private callSound: HTMLAudioElement;
  private hasPermission: boolean = false;
  private settings: NotificationPreferences;
  private messaging: any;

  private constructor() {
    this.settings = this.loadSettings();
    this.messageSound = new Audio(this.settings.messageSound);
    this.callSound = new Audio(this.settings.callSound);
    this.messageSound.preload = 'auto';
    this.callSound.preload = 'auto';
  }

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadSettings(): NotificationPreferences {
    const savedSettings = localStorage.getItem('notificationSettings');
    return savedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) } : DEFAULT_SETTINGS;
  }

  saveSettings(settings: Partial<NotificationPreferences>) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    
    if (settings.messageSound) {
      this.messageSound.src = settings.messageSound;
    }
    if (settings.callSound) {
      this.callSound.src = settings.callSound;
    }
  }

  getSettings(): NotificationPreferences {
    return { ...this.settings };
  }

  async initialize() {
    if (this.initialized) return;

    try {
      if (isPlatform.mobile) {
        await this.initializeMobileNotifications();
      } else {
        await this.initializeWebNotifications();
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      throw error;
    }
  }

  private async initializeWebNotifications() {
    try {
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';

      if (this.hasPermission) {
        this.messaging = getMessaging();
        const token = await getToken(this.messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        onMessage(this.messaging, (payload: MessagePayload) => {
          this.handleNotification(payload);
        });
      }
    } catch (error) {
      console.error('Error initializing web notifications:', error);
      throw error;
    }
  }

  private async initializeMobileNotifications() {
    try {
      const { checkPermissions, requestPermissions, register } = PushNotifications;

      const permissionStatus = await checkPermissions();
      
      if (permissionStatus.receive !== 'granted') {
        const permission = await requestPermissions();
        this.hasPermission = permission.receive === 'granted';
      } else {
        this.hasPermission = true;
      }

      if (this.hasPermission) {
        await register();
        
        PushNotifications.addListener('pushNotificationReceived', notification => {
          this.handleMobileNotification(notification);
        });
      }
    } catch (error) {
      console.error('Error initializing mobile notifications:', error);
      throw error;
    }
  }

  private async handleNotification(payload: MessagePayload) {
    if (!this.settings.background && document.hidden) return;

    if (this.settings.sound) {
      await this.playNotificationSound(payload.data?.type === 'call');
    }

    if (this.settings.vibration && isPlatform.mobile) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    if (this.settings.preview && this.hasPermission) {
      const { title, body } = payload.notification || {};
      
      if (!document.hidden) {
        await LocalNotifications.schedule({
          notifications: [{
            title: title || 'Nuovo messaggio',
            body: body || '',
            id: Date.now(),
            sound: this.settings.sound ? 'notification.wav' : null,
            attachments: null,
            actionTypeId: '',
            extra: null
          }]
        });
      } else {
        new Notification(title || 'Nuovo messaggio', {
          body: body || '',
          icon: '/logo.svg'
        });
      }
    }
  }

  private async handleMobileNotification(notification: any) {
    if (!this.settings.background && !notification.foreground) return;

    if (this.settings.sound) {
      await this.playNotificationSound(notification.data?.type === 'call');
    }

    if (this.settings.vibration) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    if (this.settings.preview) {
      await LocalNotifications.schedule({
        notifications: [{
          title: notification.title || 'Nuovo messaggio',
          body: notification.body || '',
          id: Date.now(),
          sound: this.settings.sound ? 'notification.wav' : null,
          attachments: null,
          actionTypeId: '',
          extra: notification.data
        }]
      });
    }
  }

  private async playNotificationSound(isCall: boolean = false) {
    try {
      const sound = isCall ? this.callSound : this.messageSound;
      sound.currentTime = 0;
      await sound.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  async sendServiceMatchNotification(match: ServiceMatch) {
    try {
      const notification = {
        title: 'Nuovo Match Servizio',
        body: `Il tuo servizio "${match.service1.name}" ha un potenziale match!`,
        icon: '/logo.svg',
        data: {
          type: 'service_match',
          matchId: match.id,
          service1Id: match.service1.id,
          service2Id: match.service2.id
        }
      };

      if (this.settings.preview && this.hasPermission) {
        await LocalNotifications.schedule({
          notifications: [{
            title: notification.title,
            body: notification.body,
            id: Date.now(),
            sound: this.settings.sound ? 'notification.wav' : null,
            attachments: null,
            actionTypeId: 'service_match',
            extra: notification.data
          }]
        });
      }

      // Invia evento personalizzato per il sistema di notifiche UI
      const event = new CustomEvent('showNotification', {
        detail: {
          type: 'info',
          title: notification.title,
          message: notification.body,
          action: {
            label: 'Visualizza',
            handler: () => {
              window.location.href = `/services/matches/${match.id}`;
            }
          }
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error sending service match notification:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('Questo browser non supporta le notifiche');
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Errore nella richiesta dei permessi:', error);
      return false;
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}) {
    try {
      if (!('Notification' in window)) return;
      
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          ...options
        });

        // Vibrazione (se supportata)
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }

        return notification;
      }
    } catch (error) {
      console.error('Errore nell\'invio della notifica:', error);
    }
  }
}