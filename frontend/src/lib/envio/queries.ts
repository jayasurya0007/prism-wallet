// GraphQL Query Definitions
// Reference: https://docs.envio.dev/docs/HyperIndex/getting-started

export const HIGH_VALUE_TRANSFERS = `
  query GetHighValueTransfers($chainId: Int, $minAmount: String!, $limit: Int!) {
    Transfer(
      where: {
        ${`chainId: { _eq: $chainId }`}
        value: { _gte: $minAmount }
      }
      order_by: { timestamp: desc }
      limit: $limit
    ) {
      id
      chainId
      from
      to
      value
      blockNumber
      transactionHash
      timestamp
    }
  }
`;

export const WALLET_ACTIVITY = `
  query GetWalletActivity($address: String!, $chainIds: [Int!], $limit: Int!) {
    Transfer(
      where: {
        _or: [
          { from: { _eq: $address } }
          { to: { _eq: $address } }
        ]
        chainId: { _in: $chainIds }
      }
      order_by: { timestamp: desc }
      limit: $limit
    ) {
      id
      chainId
      from
      to
      value
      blockNumber
      transactionHash
      timestamp
    }
  }
`;

export const RECENT_TRANSFERS = `
  query GetRecentTransfers($timestamp: Int!, $chainIds: [Int!], $limit: Int!) {
    Transfer(
      where: {
        timestamp: { _gte: $timestamp }
        chainId: { _in: $chainIds }
      }
      order_by: { timestamp: desc }
      limit: $limit
    ) {
      id
      chainId
      from
      to
      value
      blockNumber
      transactionHash
      timestamp
    }
  }
`;

export const PORTFOLIO_SUMMARY = `
  query GetPortfolioSummary($address: String!, $chainIds: [Int!]) {
    Transfer(
      where: {
        _or: [
          { from: { _eq: $address } }
          { to: { _eq: $address } }
        ]
        chainId: { _in: $chainIds }
      }
    ) {
      chainId
      value
      timestamp
    }
  }
`;

export const TRANSFER_SUBSCRIPTION = `
  subscription TransferUpdates($chainIds: [Int!]) {
    Transfer(
      where: { chainId: { _in: $chainIds } }
      order_by: { timestamp: desc }
      limit: 1
    ) {
      id
      chainId
      from
      to
      value
      blockNumber
      transactionHash
      timestamp
    }
  }
`;