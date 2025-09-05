// src/services/auth.service.ts
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { AuthConfig, AccessToken } from '../types';

export class AuthService {
  private config: AuthConfig;
  private baseUrl: string;

  constructor(config: AuthConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'live' 
      ? 'https://api.topstep.com' 
      : 'https://api-demo.topstep.com';
  }

  async getAuthUrl(): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri || `${this.baseUrl}/oauth/callback`,
      response_type: 'code',
      scope: 'trading account market_data',
    });

    return `${this.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<AccessToken> {
    const response = await axios.post(`${this.baseUrl}/oauth/token`, {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri,
    });

    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AccessToken> {
    const response = await axios.post(`${this.baseUrl}/oauth/token`, {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return response.data;
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}