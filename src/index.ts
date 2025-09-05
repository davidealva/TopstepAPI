// src/index.ts
import { ProjectXClient } from './client';

const config = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  environment: 'demo' // or 'live'
};

const client = new ProjectXClient(config);

// Get authentication URL
const authUrl = await client.getAuthUrl();
console.log('Please authenticate at:', authUrl);

// After user authenticates and gets code
const code = 'authorization-code-from-redirect';
const token = await client.authenticate(code);

// Use REST API
const accounts = await client.getAccounts();
const orders = await client.getOrders('account-id');
const marketData = await client.getMarketData(['ES', 'NQ']);

// Use WebSocket
client.connectWebSocket();

client.onMarketData((data) => {
  console.log('Market data update:', data);
});

client.onOrderUpdate((order) => {
  console.log('Order update:', order);
});

client.onError((error) => {
  console.error('Error:', error);
});