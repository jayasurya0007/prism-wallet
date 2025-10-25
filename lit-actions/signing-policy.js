const go = async () => {
  // Get parameters from the Lit Action
  const { 
    toSign, 
    publicKey, 
    sigName,
    transactionData,
    policy 
  } = Lit.Actions.getParams();

  // Default policy if not provided
  const defaultPolicy = {
    maxAmount: 100, // USDC
    allowedChains: [1, 10, 137, 42161],
    requireGasBelow: 200, // Gwei
    allowedTokens: ['USDC', 'USDT', 'ETH'],
    cooldownPeriod: 300 // 5 minutes in seconds
  };

  const activePolicy = policy || defaultPolicy;

  try {
    // Parse transaction data
    const txData = JSON.parse(transactionData);
    
    // Validation 1: Amount limit
    if (txData.amount && parseFloat(txData.amount) > activePolicy.maxAmount) {
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Amount ${txData.amount} exceeds limit of ${activePolicy.maxAmount}` 
        })
      });
    }

    // Validation 2: Chain allowlist
    if (txData.chainId && !activePolicy.allowedChains.includes(txData.chainId)) {
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Chain ${txData.chainId} not in allowed chains: ${activePolicy.allowedChains.join(', ')}` 
        })
      });
    }

    // Validation 3: Gas price limit
    if (txData.gasPrice && txData.gasPrice > activePolicy.requireGasBelow * 1e9) {
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Gas price ${txData.gasPrice / 1e9} Gwei exceeds limit of ${activePolicy.requireGasBelow} Gwei` 
        })
      });
    }

    // Validation 4: Token allowlist
    if (txData.token && !activePolicy.allowedTokens.includes(txData.token)) {
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Token ${txData.token} not in allowed tokens: ${activePolicy.allowedTokens.join(', ')}` 
        })
      });
    }

    // Validation 5: Cooldown period (simplified - in production use persistent storage)
    const now = Math.floor(Date.now() / 1000);
    const lastSigningTime = parseInt(txData.lastSigningTime || '0');
    
    if (lastSigningTime && (now - lastSigningTime) < activePolicy.cooldownPeriod) {
      const remainingCooldown = activePolicy.cooldownPeriod - (now - lastSigningTime);
      return Lit.Actions.setResponse({ 
        response: JSON.stringify({ 
          success: false,
          error: `Cooldown period active. Wait ${remainingCooldown} seconds` 
        })
      });
    }

    // All validations passed - proceed with signing
    const sigShare = await Lit.Actions.signEcdsa({
      toSign,
      publicKey,
      sigName
    });

    Lit.Actions.setResponse({ 
      response: JSON.stringify({ 
        success: true,
        signature: sigShare,
        timestamp: now,
        policy: activePolicy
      })
    });

  } catch (error) {
    Lit.Actions.setResponse({ 
      response: JSON.stringify({ 
        success: false,
        error: `Policy validation failed: ${error.message}` 
      })
    });
  }
};

go();