import { UAParser } from 'ua-parser-js';

export class DeviceInfoService {
  private parser: UAParser;

  constructor() {
    this.parser = new UAParser();
  }

  async getDeviceInfo() {
    const result = this.parser.getResult();
    
    return {
      browser: result.browser.name || 'Sconosciuto',
      browserVersion: result.browser.version || 'Sconosciuto',
      os: result.os.name || 'Sconosciuto',
      osVersion: result.os.version || 'Sconosciuto',
      platform: this.getPlatform(),
      fingerprint: await this.generateFingerprint(),
      timestamp: new Date()
    };
  }

  private getPlatform(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  private async generateFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width,
      screen.height,
      screen.colorDepth
    ].join('|');

    const encoder = new TextEncoder();
    const data = encoder.encode(components);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
} 