# Healthcare Document Manager Smart Contract

This Solidity smart contract manages healthcare document metadata and access control on the Celo blockchain.

## Deployment Instructions

### Prerequisites

1. **Install Dependencies**
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npm install @celo/contractkit
   ```

2. **Get Celo Testnet Funds**
   - Visit [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
   - Request testnet CELO tokens
   - Save your wallet private key securely

### Deployment Steps

1. **Create Hardhat Config** (`hardhat.config.js`):
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
       },
       celo: {
         url: "https://forno.celo.org",
         accounts: [process.env.PRIVATE_KEY],
         chainId: 42220,
       }
     }
   };
   ```

2. **Create Deployment Script** (`scripts/deploy.js`):
   ```javascript
   async function main() {
     const HealthDocumentManager = await ethers.getContractFactory("HealthDocumentManager");
     const contract = await HealthDocumentManager.deploy();
     await contract.deployed();
     
     console.log("HealthDocumentManager deployed to:", contract.address);
   }

   main().catch((error) => {
     console.error(error);
     process.exitCode = 1;
   });
   ```

3. **Create .env File**:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   ```

4. **Deploy to Celo Testnet**:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network alfajores
   ```

5. **Verify Contract** (optional):
   ```bash
   npx hardhat verify --network alfajores DEPLOYED_CONTRACT_ADDRESS
   ```

### Contract Address Configuration

After deployment, copy the contract address and update it in:
- `src/lib/contractConfig.ts` - Set `CONTRACT_ADDRESS`
- Environment variable: `VITE_CONTRACT_ADDRESS`

## Key Features

- **Document Upload**: Store encrypted document metadata with IPFS CID
- **Batch Access Control**: Grant access to multiple facilities in a single transaction
- **Access Revocation**: Patients can revoke facility access at any time
- **Time-based Expiration**: Optional expiration timestamps for access grants
- **Event Logging**: All actions emit events for transparency and auditing

## Security Considerations

1. Documents are stored as IPFS CIDs (metadata only, not actual files)
2. Encryption happens client-side before upload
3. Only document owners can grant/revoke access
4. Access control is enforced at the smart contract level
5. All sensitive operations emit events for audit trails

## Gas Optimization

The contract uses:
- Efficient storage patterns with mappings
- Batch operations to reduce transaction costs
- Minimal on-chain data storage (IPFS for files)

## Testing

Create test file `test/HealthDocumentManager.test.js`:
```javascript
const { expect } = require("chai");

describe("HealthDocumentManager", function () {
  let contract, owner, facility1, facility2;

  beforeEach(async function () {
    [owner, facility1, facility2] = await ethers.getSigners();
    const HealthDocumentManager = await ethers.getContractFactory("HealthDocumentManager");
    contract = await HealthDocumentManager.deploy();
    await contract.deployed();
  });

  it("Should upload a document", async function () {
    const tx = await contract.uploadDocument(
      "QmTest123",
      "insurance_card",
      "encryption_hash_123"
    );
    await tx.wait();
    
    const doc = await contract.getDocument(1);
    expect(doc.ipfsCid).to.equal("QmTest123");
    expect(doc.owner).to.equal(owner.address);
  });

  it("Should batch grant access", async function () {
    await contract.uploadDocument("QmTest123", "insurance_card", "hash1");
    await contract.uploadDocument("QmTest456", "medical_record", "hash2");
    
    await contract.batchGrantAccess(
      [1, 2],
      [facility1.address, facility2.address]
    );
    
    expect(await contract.hasValidAccess(1, facility1.address)).to.be.true;
    expect(await contract.hasValidAccess(2, facility2.address)).to.be.true;
  });
});
```

Run tests:
```bash
npx hardhat test
```
