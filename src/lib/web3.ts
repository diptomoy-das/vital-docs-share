import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_CONFIG } from './contractConfig';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Web3 Integration for Celo Healthcare dApp
 * 
 * IMPORTANT: This is a client-side Web3 integration setup.
 * For production use, you'll need to:
 * 1. Deploy the smart contract to Celo testnet/mainnet
 * 2. Update CONTRACT_ADDRESS in contractConfig.ts
 * 3. Install ethers: npm install ethers
 * 4. Configure IPFS storage (Pinata, Web3.Storage, etc.)
 * 5. Implement proper encryption for documents before upload
 */

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  /**
   * Initialize Web3 provider and connect to MetaMask
   */
  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found. Please install MetaMask.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Initialize provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== NETWORK_CONFIG.testnet.chainId) {
        await this.switchToCeloTestnet();
      }

      // Initialize contract
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer
      );

      return accounts[0];
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  /**
   * Switch to Celo Alfajores testnet
   */
  async switchToCeloTestnet(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(NETWORK_CONFIG.testnet.chainId) }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: ethers.utils.hexValue(NETWORK_CONFIG.testnet.chainId),
            chainName: NETWORK_CONFIG.testnet.name,
            nativeCurrency: NETWORK_CONFIG.testnet.nativeCurrency,
            rpcUrls: [NETWORK_CONFIG.testnet.rpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.testnet.explorerUrl],
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Get current account address
   */
  async getAccount(): Promise<string | null> {
    if (!this.provider) return null;
    const accounts = await this.provider.listAccounts();
    return accounts[0] || null;
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<string> {
    if (!this.provider || !this.signer) throw new Error('Not connected');
    const balance = await this.signer.getBalance();
    return ethers.utils.formatEther(balance);
  }

  /**
   * Upload document to blockchain
   * @param ipfsCid IPFS Content ID from encrypted file upload
   * @param documentType Type of document
   * @param encryptionHash Hash of encryption key
   */
  async uploadDocument(
    ipfsCid: string,
    documentType: string,
    encryptionHash: string
  ): Promise<{ documentId: number; txHash: string }> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.uploadDocument(
        ipfsCid,
        documentType,
        encryptionHash
      );
      const receipt = await tx.wait();
      
      // Extract document ID from event
      const event = receipt.events?.find((e: any) => e.event === 'DocumentUploaded');
      const documentId = event?.args?.documentId.toNumber();

      return {
        documentId,
        txHash: receipt.transactionHash,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Batch grant access to multiple facilities for multiple documents
   * @param documentIds Array of document IDs
   * @param facilityAddresses Array of facility wallet addresses
   */
  async batchGrantAccess(
    documentIds: number[],
    facilityAddresses: string[]
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.batchGrantAccess(
        documentIds,
        facilityAddresses
      );
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error: any) {
      throw new Error(`Failed to grant access: ${error.message}`);
    }
  }

  /**
   * Revoke facility access to a document
   */
  async revokeAccess(
    documentId: number,
    facilityAddress: string
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.revokeAccess(documentId, facilityAddress);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error: any) {
      throw new Error(`Failed to revoke access: ${error.message}`);
    }
  }

  /**
   * Get all documents for current user
   */
  async getUserDocuments(): Promise<number[]> {
    if (!this.contract || !this.signer) throw new Error('Not connected');
    
    const address = await this.signer.getAddress();
    const documentIds = await this.contract.getUserDocuments(address);
    return documentIds.map((id: ethers.BigNumber) => id.toNumber());
  }

  /**
   * Get document details
   */
  async getDocument(documentId: number): Promise<any> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const doc = await this.contract.getDocument(documentId);
    return {
      ipfsCid: doc.ipfsCid,
      documentType: doc.documentType,
      timestamp: doc.timestamp.toNumber(),
      owner: doc.owner,
      encryptionHash: doc.encryptionHash,
      isActive: doc.isActive,
    };
  }

  /**
   * Check if facility has access to document
   */
  async hasValidAccess(
    documentId: number,
    facilityAddress: string
  ): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.hasValidAccess(documentId, facilityAddress);
  }

  /**
   * Listen to account changes
   */
  onAccountChanged(callback: (account: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          callback(accounts[0]);
        }
      });
    }
  }

  /**
   * Listen to network changes
   */
  onNetworkChanged(callback: (chainId: number) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        callback(parseInt(chainId, 16));
      });
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }
}

export const web3Service = new Web3Service();
