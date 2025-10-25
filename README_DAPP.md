# HealthChain - Decentralized Healthcare Document Management dApp

A blockchain-based healthcare document management system built on Celo, enabling patients to securely upload and share medical documents with multiple facilities in a single transaction.

## 🌟 Features

- **Wallet Integration**: MetaMask/WalletConnect support for Celo testnet
- **Document Upload**: Encrypted file upload with IPFS storage
- **Batch Sharing**: Share multiple documents with multiple facilities in one transaction
- **Access Control**: Grant/revoke facility access to documents
- **Smart Contracts**: Solidity contracts for metadata and access management
- **End-to-End Encryption**: Client-side encryption before upload
- **Transaction History**: Complete audit trail of all sharing activities

## 🏗️ Architecture

```
Frontend (React + TypeScript + Tailwind)
          ↓
Web3 Provider (ethers.js)
          ↓
Celo Blockchain (Smart Contracts)
          ↓
IPFS/Filecoin (Encrypted Documents)
```

## 📦 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **ethers.js** for blockchain interaction
- **Sonner** for toast notifications

### Blockchain
- **Celo Alfajores Testnet** (development)
- **Solidity ^0.8.19** for smart contracts
- **Hardhat** for contract deployment

### Storage
- **IPFS** for decentralized file storage
- Options: Pinata, Web3.Storage, NFT.Storage, or Filecoin

## 🚀 Getting Started

### Prerequisites

1. **Install Node.js** (v16 or higher)
   ```bash
   node --version
   ```

2. **Install MetaMask**
   - Browser extension: https://metamask.io/

3. **Get Celo Testnet Funds**
   - Visit: https://faucet.celo.org/alfajores
   - Request testnet CELO tokens

### Installation

1. **Clone and Install**
   ```bash
   npm install
   npm install ethers
   ```

2. **Configure Environment**
   Create `.env` file:
   ```env
   VITE_CONTRACT_ADDRESS=<your_deployed_contract_address>
   VITE_IPFS_API_KEY=<your_ipfs_api_key>
   VITE_IPFS_SECRET=<your_ipfs_secret>
   ```

3. **Deploy Smart Contract**
   ```bash
   cd contracts
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

   Create `hardhat.config.js`:
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   require('dotenv').config();

   module.exports = {
     solidity: "0.8.19",
     networks: {
       alfajores: {
         url: "https://alfajores-forno.celo-testnet.org",
         accounts: [process.env.PRIVATE_KEY],
         chainId: 44787,
       }
     }
   };
   ```

   Deploy:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network alfajores
   ```

4. **Update Contract Address**
   Copy deployed address to `src/lib/contractConfig.ts`:
   ```typescript
   export const CONTRACT_ADDRESS = '0xYourDeployedAddress';
   ```

5. **Configure IPFS**
   
   **Option A: Pinata (Recommended)**
   - Sign up: https://www.pinata.cloud/
   - Get API keys
   - Add to `.env`

   **Option B: Web3.Storage**
   - Sign up: https://web3.storage/
   - Get API token
   - Install SDK: `npm install web3.storage`

### Running the dApp

```bash
npm run dev
```

Visit: `http://localhost:8080`

## 🔐 Security Implementation

### Client-Side Encryption

Before uploading to IPFS, implement encryption:

```typescript
import CryptoJS from 'crypto-js';

async function encryptFile(file: File, password: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();
  return new Blob([encrypted], { type: 'application/octet-stream' });
}
```

### Key Management

Store encryption keys securely:
- User's wallet signature as key derivation
- Never store keys in smart contract
- Use key stretching (PBKDF2/Argon2)

## 📝 Smart Contract Functions

### Upload Document
```solidity
function uploadDocument(
    string memory ipfsCid,
    string memory documentType,
    string memory encryptionHash
) external returns (uint256)
```

### Batch Grant Access
```solidity
function batchGrantAccess(
    uint256[] memory documentIds,
    address[] memory facilities
) external
```

### Revoke Access
```solidity
function revokeAccess(
    uint256 documentId,
    address facility
) external
```

## 🧪 Testing

### Test Smart Contract
```bash
npx hardhat test
```

### Test Frontend with Mock Data
The dApp includes mock data for testing without real blockchain connection:
- Mock wallet connection
- Simulated IPFS uploads
- Mock transaction responses

To enable real blockchain:
1. Deploy contract
2. Update `CONTRACT_ADDRESS`
3. Configure IPFS provider
4. Connect MetaMask to Celo testnet

## 🌐 IPFS Integration

### Using Pinata

```typescript
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK({ pinataApiKey, pinataSecretApiKey });

async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const result = await pinata.pinFileToIPFS(file);
  return result.IpfsHash; // Returns CID
}
```

### Using Web3.Storage

```typescript
import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({ token: API_TOKEN });

async function uploadToIPFS(file: File): Promise<string> {
  const cid = await client.put([file]);
  return cid;
}
```

## 🔧 Configuration

### Celo Network Setup

MetaMask configuration for Celo Alfajores:
- **Network Name**: Celo Alfajores Testnet
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Chain ID**: 44787
- **Currency Symbol**: CELO
- **Block Explorer**: https://alfajores.celoscan.io

## 📊 Contract Deployment

### Gas Estimation

Approximate gas costs on Celo:
- Deploy contract: ~2,000,000 gas
- Upload document: ~150,000 gas
- Batch grant (5 facilities × 3 docs): ~500,000 gas
- Revoke access: ~50,000 gas

### Mainnet Deployment

For production:
1. Audit smart contract
2. Use `celo` network in hardhat config
3. Get mainnet CELO from exchange
4. Deploy with sufficient gas
5. Verify contract on CeloScan

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask not connecting**
   - Ensure Celo network is added
   - Check if dApp is on localhost or HTTPS

2. **Transaction failing**
   - Check wallet has sufficient CELO for gas
   - Verify contract address is correct
   - Ensure you're on correct network

3. **IPFS upload failing**
   - Verify API credentials
   - Check file size limits (usually 100MB)
   - Test IPFS gateway connectivity

## 📚 Additional Resources

- [Celo Documentation](https://docs.celo.org/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)

## ⚠️ Important Notes

### Current Implementation Status

This dApp frontend is **fully functional with simulated blockchain calls**. To enable real blockchain functionality:

1. **Deploy Smart Contract**: Follow deployment instructions in `contracts/README.md`
2. **Configure IPFS**: Set up Pinata/Web3.Storage API keys
3. **Update Configuration**: Add contract address to `contractConfig.ts`
4. **Install ethers**: Run `npm install ethers`
5. **Test Integration**: Connect MetaMask and test with testnet CELO

### Production Readiness Checklist

Before deploying to production:
- [ ] Smart contract security audit
- [ ] Implement real encryption (not mock)
- [ ] Configure production IPFS provider
- [ ] Set up proper key management
- [ ] Add comprehensive error handling
- [ ] Implement transaction retry logic
- [ ] Add loading states and UX polish
- [ ] Test on Celo mainnet
- [ ] Configure proper gas estimation
- [ ] Add contract verification on CeloScan
- [ ] Implement MCP (Model Context Protocol) integration
- [ ] Add comprehensive logging and monitoring

## 🤝 Contributing

This is a reference implementation. For production use, ensure:
- Smart contract audits
- Proper encryption implementation
- HIPAA/GDPR compliance (if applicable)
- Comprehensive testing
- Security best practices

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ on Celo Blockchain**
