import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/upbit';

export interface Account {
  currency: string;
  balance: string;
  locked: string;
  avg_buy_price: string;
  avg_buy_price_modified: boolean;
  unit_currency: string;
}

export const account = {
  getBalance: async () => {
    const response = await axios.get(`${BASE_URL}/accounts`);
    return response;
  }
}; 