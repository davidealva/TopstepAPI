// src/services/websocket.service.ts
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { MarketData, Order, Position } from '../types';

interface WebSocketMessage {
  type: string;
  data: any;
}

export class WebSocketService extends EventEmitter {
  private ws?: WebSocket;
  private url: string;
  private accessToken: string;
  private reconnectInterval: number = 5000;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(baseUrl: string, accessToken: string) {
    super();
    this.url = `${baseUrl.replace('http', 'ws')}/ws`;
    this.accessToken = accessToken;
  }

  connect(): void {
    this.ws = new WebSocket(this.url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    this.ws.on('open', () => {
      console.log('WebSocket connected');
      this.emit('connected');
      this.authenticate();
    });

    this.ws.on('message', (data: WebSocket.Message) => {
      this.handleMessage(data.toString());
    });

    this.ws.on('close', () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
      this.scheduleReconnect();
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  private authenticate(): void {
    this.send({
      type: 'auth',
      token: this.accessToken
    });
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'market_data':
          this.emit('market_data', message.data as MarketData);
          break;
        case 'order_update':
          this.emit('order_update', message.data as Order);
          break;
        case 'position_update':
          this.emit('position_update', message.data as Position);
          break;
        case 'error':
          this.emit('error', message.data);
          break;
        default:
          this.emit('message', message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  subscribeToMarketData(symbols: string[]): void {
    this.send({
      type: 'subscribe',
      channel: 'market_data',
      symbols
    });
  }

  subscribeToOrders(accountId: string): void {
    this.send({
      type: 'subscribe',
      channel: 'orders',
      account_id: accountId
    });
  }

  subscribeToPositions(accountId: string): void {
    this.send({
      type: 'subscribe',
      channel: 'positions',
      account_id: accountId
    });
  }

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.ws) {
      this.ws.close();
    }
  }
}