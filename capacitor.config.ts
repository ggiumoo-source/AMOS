import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.amos.profilostudio',
  appName: 'AMOS Profilo di Studio',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
