import { AccessService } from './AccessService';
import { SessionService } from './SessionService';
import { DeviceInfoService } from './DeviceInfoService';

export class AuthTrackingService {
  private static instance: AuthTrackingService;
  private accessService: AccessService;
  private sessionService: SessionService;
  private deviceInfoService: DeviceInfoService;

  private constructor() {
    this.accessService = AccessService.getInstance();
    this.sessionService = SessionService.getInstance();
    this.deviceInfoService = new DeviceInfoService();
  }

  static getInstance() {
    if (!AuthTrackingService.instance) {
      AuthTrackingService.instance = new AuthTrackingService();
    }
    return AuthTrackingService.instance;
  }

  async trackLogin(userId: string) {
    const deviceInfo = await this.deviceInfoService.getDeviceInfo();
    const session = await this.sessionService.getCurrentSession();
    
    if (session) {
      await this.accessService.registerAccess(userId, session.sessionId, deviceInfo);
    }
  }
} 