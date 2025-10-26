# Smart Contract Deployment Guide

This guide will help you deploy the HealthDocumentManager smart contract to Celo Alfajores testnet and enable real blockchain transactions.

## Prerequisites

1. **MetaMask Wallet**
   - Install MetaMask browser extension
   - Create or import a wallet

2. **Test CELO Tokens**
   - Visit: https://faucet.celo.org/alfajores
   - Enter your wallet address
   - Receive free test CELO for gas fees

3. **Private Key** (for deployment)
   - Open MetaMask
   - Click three dots → Account Details → Export Private Key
   - Copy your private key (keep it secret!)

## Deployment Steps

### Step 1: Set Up Environment Variables

Create or update your `.env` file in the project root:

```bash
# Add your private key (without 0x prefix)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Contract address will be added after deployment
VITE_CONTRACT_ADDRESS=
```

### Step 2: Compile the Smart Contract

```bash
npx hardhat compile
```

This compiles the Solidity contract and generates artifacts.

### Step 3: Deploy to Celo Alfajores Testnet

```bash
npx hardhat run scripts/deploy.js --network alfajores
```

Expected output:
```
Starting deployment to Celo Alfajores testnet...
Deploying contract with account: 0xYourAddress
Account balance: 1.0 CELO

Deploying HealthDocumentManager contract...

✅ Contract deployed successfully!
Contract address: 0xYourContractAddress

View on Celoscan:
https://alfajores.celoscan.io/address/0xYourContractAddress

📝 Next steps:
1. Update src/lib/contractConfig.ts with this address
2. Or add to .env file
3. Restart your dev server to see real blockchain transactions!
```

### Step 4: Update Contract Address

Choose one of these methods:

**Option A: Update .env file (Recommended)**
```bash
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

**Option B: Update contractConfig.ts directly**
```typescript
// src/lib/contractConfig.ts
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

### Step 5: Restart Development Server

```bash
npm run dev
```

## Verify Deployment

### 1. Check on Celoscan
Visit: `https://alfajores.celoscan.io/address/YOUR_CONTRACT_ADDRESS`

You should see:
- Contract creation transaction
- Contract code
- Contract balance

### 2. Test in the App

1. Connect your wallet
2. Upload a document
3. Share with facilities
4. Check transaction history

Real transactions will:
- Show in MetaMask activity
- Charge gas fees
- Take 5-10 seconds to confirm
- Appear on Celoscan

## Troubleshooting

### Error: "Insufficient funds for gas"
**Solution:** Get more test CELO from https://faucet.celo.org/alfajores

### Error: "Invalid nonce"
**Solution:** Reset your MetaMask account:
1. Settings → Advanced → Clear activity tab data

### Error: "Contract not deployed"
**Solution:** Verify the contract address in `.env` or `contractConfig.ts`

### Transactions not appearing
**Solution:**
1. Check MetaMask is on Celo Alfajores network
2. Verify contract address is correct
3. Check browser console for errors

## Verify Real Transactions

### Method 1: MetaMask
1. Open MetaMask
2. Click "Activity" tab
3. See transaction status (Pending/Success/Failed)

### Method 2: Celoscan
1. Copy transaction hash from app
2. Visit: https://alfajores.celoscan.io/
3. Paste transaction hash
4. View full details

### Method 3: In App
Click "View on Explorer" button next to each transaction

## Deploy to Mainnet (Production)

When ready for production:

1. **Get real CELO tokens**
   - Buy CELO from exchanges
   - Transfer to your wallet

2. **Update hardhat.config.js**
   - Use mainnet configuration
   - Increase gas settings if needed

3. **Deploy to mainnet**
```bash
npx hardhat run scripts/deploy.js --network celo
```

4. **Verify contract on Celoscan**
```bash
npx hardhat verify --network celo YOUR_CONTRACT_ADDRESS
```

## Security Reminders

- Never commit your private key to git
- Never share your private key
- Use separate wallets for dev and production
- Test thoroughly on testnet first
- Consider using multi-sig for mainnet contracts

## Gas Costs (Approximate)

On Celo Alfajores testnet:
- Deploy contract: ~0.05 CELO
- Upload document: ~0.001 CELO
- Grant access (single): ~0.001 CELO
- Batch grant access: ~0.002-0.005 CELO (depends on quantity)

## Need Help?

- Celo Documentation: https://docs.celo.org/
- Hardhat Documentation: https://hardhat.org/docs
- Celoscan: https://celoscan.io/
- Celo Discord: https://discord.gg/celo
