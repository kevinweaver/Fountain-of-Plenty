export function formatUSD(fdv: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(fdv);
}

export const uniswapBuyLink = (chain: 'base' | 'sepolia', tokenAddress: string) =>
  `https://app.uniswap.org/swap?chain=${chain}%26outputCurrency=${tokenAddress}%26inputCurrency=ETH`;
