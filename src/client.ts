// src/client.ts
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';
import { WebSocketService } from './services/websocket.service';
import { AuthConfig, AccessToken, Account, Order, Position, MarketData } from './types';

export class ProjectXClient {
  private authService: AuthService;
  private apiService: ApiService;
  private wsService?: WebSocketService;

  constructor(config: AuthConfig) {
    this.authService = new AuthService(config);
    this.apiService = new ApiService(this.authService);
  }

  // Authentication methods
  getAuthUrl(): Promise<string> {
    return this.authService.getAuthUrl();
  }

  async authenticate(code: string): Promise<AccessToken> {
    const token = await this.authService.exchangeCodeForToken(code);
    this.apiService.setAccessToken(token);
    return token;
  }

  setAccessToken(token: AccessToken): void {
    this.apiService.setAccessToken(token);
  }

  // WebSocket methods
  connectWebSocket(): void {
    if (!this.apiService['accessToken']) {
      throw new Error('No access token available. Please authenticate first.');
    }

    this.wsService = new WebSocketService(
      this.authService['baseUrl'],
      this.apiService['accessToken'].access_token
    );

    this.wsService.connect();
  }

  // Proxy methods to API service
  getAccounts(): Promise<Account[]> {
    return this.apiService.getAccounts();
  }

  getAccount(accountId: string): Promise<Account> {
    return this.apiService.getAccount(accountId);
  }

  getOrders(accountId: string): Promise<Order[]> {
    return this.apiService.getOrders(accountId);
  }

  createOrder(accountId: string, order: Partial<Order>): Promise<Order> {
    return this.apiService.createOrder(accountId, order);
  }

  cancelOrder(accountId: string, orderId: string): Promise<void> {
    return this.apiService.cancelOrder(accountId, orderId);
  }

  getPositions(accountId: string): Promise<Position[]> {
    return this.apiService.getPositions(accountId);
  }

  closePosition(accountId: string, positionId: string): Promise<void> {
    return this.apiService.closePosition(accountId, positionId);
  }

  getMarketData(symbols: string[]): Promise<MarketData[]> {
    return this.apiService.getMarketData(symbols);
  }

  // WebSocket event listeners
  onMarketData(callback: (data: MarketData) => void): void {
    this.wsService?.on('market_data', callback);
  }

  onOrderUpdate(callback: (order: Order) => void): void {
    this.wsService?.on('order_update', callback);
  }

  onPositionUpdate(callback: (position: Position) => void): void {
    this.wsService?.on('position_update', callback);
  }

  onConnected(callback: () => void): void {
    this.wsService?.on('connected', callback);
  }

  onDisconnected(callback: () => void): void {
    this.wsService?.on('disconnected', callback);
  }

  onError(callback: (error: any) => void): void {
    this.wsService?.on('error', callback);
  }

  disconnectWebSocket(): void {
    this.wsService?.disconnect();
  }
}