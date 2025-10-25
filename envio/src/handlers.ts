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
      token: 'USDC'
    };
    
    console.log(`AI Alert [high_value_transfer]:`, highValueTransfer);
  }
  
  // Update wallet activity metrics
  console.log(`Wallet activity: ${from} -> ${to} on chain ${event.chainId}, value: $${usdValue}`);
}

function calculateUSDValue(value: string, chainId: number): number {
  return parseFloat(value) / 1e6; // USDC 6 decimals
}

// Gas price monitoring handler
export async function handleBlock(event: any) {
  const gasPrice = event.block?.gasPrice || '0';
  const gasPriceGwei = parseFloat(gasPrice) / 1e9;
  
  if (gasPriceGwei < 50) {
    console.log(`AI Alert [optimal_gas]: Chain ${event.chainId} gas below 50 Gwei: ${gasPriceGwei}`);
  }
}