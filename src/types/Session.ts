export interface Session {
  sessionId: string;
  deviceInfo: {
    browser: string;
    os: string;
    platform: string;
  };
  lastActive: Date;
  isCurrentSession: boolean;
  isActive: boolean;
} 