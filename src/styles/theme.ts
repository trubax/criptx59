// src/styles/theme.ts
export const theme = {
    colors: {
      primary: '#007AFF',
      background: Platform.select({
        ios: '#000000',
        android: '#1F2937'
      })
    },
    spacing: {
      safeAreaTop: Platform.select({
        ios: 44,
        android: 0
      })
    }
  };