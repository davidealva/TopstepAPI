// src/services/api.service.ts
import axios, { AxiosInstance } from 'axios';
import { Account, Order, Position, MarketData } from '../types';
import { AuthService, AccessToken } from './auth.service';

export class ApiService {
  private authService: AuthService;
  private httpClient: AxiosInstance;
  private accessToken?: AccessToken;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.httpClient = axios.create({
      baseURL: authService['baseUrl'],
    });

    this.setupInterceptors();
  }

  setAccessToken(token: AccessToken) {
    this.accessToken = token;
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token.access_token}`;
  }

  private setupInterceptors() {
    this.httpClient.interceptors.request.use(async (config) => {
      if (this.accessToken && this.authService.isTokenExpired(this.accessToken.access_token)) {
        const newToken = await this.authService.refreshToken(this.accessToken.refresh_token);
        this.setAccessToken(newToken);
      }
      return config;
    });
  }

  // Account methods
  async getAccounts(): Promise<Account[]> {
    const response = await this.httpClient.get('/accounts');
    return response.data.accounts;
  }

  async getAccount(accountId: string): Promise<Account> {
    const response = await this.httpClient.get(`/accounts/${accountId}`);
    return response.data;
  }

  // Order methods
  async getOrders(accountId: string): Promise<Order[]> {
    const response = await this.httpClient.get(`/accounts/${accountId}/orders`);
    return response.data.orders;
  }

  async createOrder(accountId: string, order: Partial<Order>): Promise<Order> {
    const response = await this.httpClient.post(`/accounts/${accountId}/orders`, order);
    return response.data;
  }

  async cancelOrder(accountId: string, orderId: string): Promise<void> {
    await this.httpClient.delete(`/accounts/${accountId}/orders/${orderId}`);
  }

  // Position methods
  async getPositions(accountId: string): Promise<Position[]> {
    const response = await this.httpClient.get(`/accounts/${accountId}/positions`);
    return response.data.positions;
  }

  async closePosition(accountId: string, positionId: string): Promise<void> {
    await this.httpClient.delete(`/accounts/${accountId}/positions/${positionId}`);
  }

  // Market data methods
  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    const response = await this.httpClient.get('/market-data', {
      params: { symbols: symbols.join(',') }
    });
    return response.data.quotes;
  }
}