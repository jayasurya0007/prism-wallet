import { Transfer } from "../generated/src/Types.gen";

export async function handleTransfer(event: Transfer) {
  const { from, to, value } = event.params;
  
  // Log high-value transfers
  if (BigInt(value) > BigInt(10000 * 10**6)) { // $10k+ USDC
    console.log(`High-value transfer: ${value} from ${from} to ${to}`);
  }
  
  // Store transfer data
  const transfer = {
    id: event.transactionHash + "-" + event.logIndex,
    from,
    to,
    value: value.toString(),
    blockNumber: event.blockNumber,
    timestamp: event.blockTimestamp,
    chainId: event.chainId
  };
  
  // Save to database (Envio handles this automatically)
}