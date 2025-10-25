import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_NETWORK } from '@lit-protocol/constants';

export class LitClient {
  private client: LitNodeClient | null = null;
  private isConnected = false;

  constructor() {
    this.client = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false
    });
  }

  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('Lit client not initialized');
    }

    if (this.isConnected) {
      return;
    }

    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('Connected to Lit Network');
    } catch (error) {
      console.error('Failed to connect to Lit Network:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('Disconnected from Lit Network');
    }
  }

  getClient(): LitNodeClient {
    if (!this.client) {
      throw new Error('Lit client not initialized');
    }
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }
}

export const litClient = new LitClient();