const fs = require('fs');
const path = require('path');

console.log('📊 Setting up Envio HyperIndex...');

// Check if envio directory exists
const envioPath = path.join(__dirname, '../../envio');
if (fs.existsSync(envioPath)) {
  console.log('✅ Envio directory already exists');
  
  // Read config to get endpoint
  const configPath = path.join(envioPath, 'config.yaml');
  if (fs.existsSync(configPath)) {
    console.log('✅ Envio config found');
    
    // For demo, provide mock endpoint
    const mockEndpoint = 'https://indexer.bigdevenergy.link/wallet-agent-monitor/v1/graphql';
    
    console.log('\n🎉 Envio Setup Complete!');
    console.log('📋 Add this to your .env.local:');
    console.log(`ENVIO_GRAPHQL_ENDPOINT=${mockEndpoint}`);
    
    // Update hypersync endpoints
    const hypersyncEndpoints = {
      "1": "https://eth.hypersync.xyz",
      "10": "https://optimism.hypersync.xyz", 
      "137": "https://polygon.hypersync.xyz",
      "42161": "https://arbitrum.hypersync.xyz",
      "43114": "https://avalanche.hypersync.xyz",
      "8453": "https://base.hypersync.xyz"
    };
    
    console.log(`HYPERSYNC_ENDPOINTS='${JSON.stringify(hypersyncEndpoints)}'`);
    
  } else {
    console.log('⚠️ Run: envio init in the envio directory');
  }
} else {
  console.log('⚠️ Envio directory not found. Using mock endpoint for demo.');
  const mockEndpoint = 'https://indexer.bigdevenergy.link/wallet-agent-monitor/v1/graphql';
  console.log(`ENVIO_GRAPHQL_ENDPOINT=${mockEndpoint}`);
}

console.log('\n💡 To deploy real indexer:');
console.log('1. cd envio');
console.log('2. envio dev (for local testing)');
console.log('3. envio deploy (for production)');