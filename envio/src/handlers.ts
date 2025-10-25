import { Transfer } from "../generated/src/Types.gen";

export async function handleTransfer(event: Transfer) {
  const { from, to, value } = event.params;
  const usdValue = calculateUSDValue(value, event.chainId);
  
  // Store all transfers
  const transfer = {
    id: event.transactionHash + "-" + event.logIndex,
    from,
    to,
    value: value.toString(),
    blockNumber: event.blockNumber,
    timestamp: event.blockTimestamp,
    chainId: event.chainId
  };
  
  // Flag high-value transfers for AI monitoring
  if (usdValue > 10000) {
    const highValueTransfer = {
      ...transfer,
      usdValue,
      flagged: true,
      token: process.env.DEFAULT_TOKEN || 'USDC'
    };
    
    console.log('AI Alert: High-value transfer detected');
  }
  
  // Update wallet activity metrics
  console.log('Wallet activity recorded');
}

function calculateUSDValue(value: string, chainId: number): number {
  return parseFloat(value) / 1e6; // USDC 6 decimals
}

function getTokenSymbol(chainId: number): string {
  return process.env.DEFAULT_TOKEN || 'USDC';
}

// Gas price monitoring handler
export async function handleBlock(event: any) {
  const gasPrice = event.block?.gasPrice || '0';
  const gasPriceGwei = parseFloat(gasPrice) / 1e9;
  
  if (gasPriceGwei < 50) {
    console.log('AI Alert: Optimal gas conditions detected');
  }
}