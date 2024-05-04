import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { NEYNAR_API_KEY } from '@/app/config/constants';

export const getNeynar = () => {
  return new NeynarAPIClient(NEYNAR_API_KEY);
};
