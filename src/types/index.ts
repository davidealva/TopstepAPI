// src/types/index.ts
export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  environment?: 'demo' | 'live';
}

export interface AccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  status: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: string;
  side: string;
  quantity: number;
  price: number;
  stop_price?: number;
  limit_price?: number;
  status: string;
  created_at: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  pnl: number;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  timestamp: string;
}