// src/services/platform.ts
export const PlatformService = {
    isIOS: () => Platform.OS === 'ios',
    isStandalone: () => Platform.OS !== 'web',
    getStatusBarHeight: () => Platform.OS === 'ios' ? 44 : 0
  };