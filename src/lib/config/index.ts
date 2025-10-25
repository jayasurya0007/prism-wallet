export * from './networks';
export * from './lit';
export * from './envio';

export interface AppConfig {
  environment: 'development' | 'production';
  enableTestnets: boolean;
  walletConnectProjectId: string;
}

export const getAppConfig = (): AppConfig => ({
  environment: (process.env.NEXT_PUBLIC_ENVIRONMENT as 'development' | 'production') || 'development',
  enableTestnets: process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true',
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''
});