import { NETWORK_CONFIG } from './contractConfig';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Simplified Web3 Integration for Celo Healthcare dApp
 * 
 * NOTE: This is a lightweight implementation that connects to MetaMask
 * without the full ethers.js complexity. It simulates blockchain interactions
 * until you deploy the actual smart contract.
 * 
 * For production use with real blockchain:
 * 1. Deploy smart contract to Celo testnet/mainnet
 * 2. Update CONTRACT_ADDRESS in contractConfig.ts
 * 3. Upgrade to full ethers.js v6 implementation
 * 4. Configure IPFS storage (Pinata, Web3.Storage, etc.)
 * 5. Implement proper encryption for documents
 */

export class Web3Service {
  private account: string | null = null;

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

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      this.account = accounts[0];
      
      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      
      if (currentChainId !== NETWORK_CONFIG.testnet.chainId) {
        await this.switchToCeloTestnet();
      }

      return accounts[0];
    } catch (error: any) {
      console.error('Connection error:', error);
      throw new Error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Switch to Celo Alfajores testnet
   */
  async switchToCeloTestnet(): Promise<void> {
    try {
      const chainIdHex = '0x' + NETWORK_CONFIG.testnet.chainId.toString(16);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        const chainIdHex = '0x' + NETWORK_CONFIG.testnet.chainId.toString(16);
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
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
    if (!window.ethereum) return null;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts[0] || null;
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<string> {
    if (!window.ethereum || !this.account) throw new Error('Not connected');
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [this.account, 'latest'],
      });
      
      // Convert from wei to CELO (divide by 10^18)
      const balanceInCelo = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInCelo.toFixed(4);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Upload document to blockchain (simulated until contract is deployed)
   * @param ipfsCid IPFS Content ID from encrypted file upload
   * @param documentType Type of document
   * @param encryptionHash Hash of encryption key
   */
  async uploadDocument(
    ipfsCid: string,
    documentType: string,
    encryptionHash: string
  ): Promise<{ documentId: number; txHash: string }> {
    if (!this.account) throw new Error('Wallet not connected');

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const documentId = Math.floor(Math.random() * 10000);
      const txHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      return {
        documentId,
        txHash,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Batch grant access to multiple facilities for multiple documents (simulated)
   * @param documentIds Array of document IDs
   * @param facilityAddresses Array of facility wallet addresses
   */
  async batchGrantAccess(
    documentIds: number[],
    facilityAddresses: string[]
  ): Promise<string> {
    if (!this.account) throw new Error('Wallet not connected');

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      return txHash;
    } catch (error: any) {
      throw new Error(`Failed to grant access: ${error.message}`);
    }
  }

  /**
   * Revoke facility access to a document (simulated)
   */
  async revokeAccess(
    documentId: number,
    facilityAddress: string
  ): Promise<string> {
    if (!this.account) throw new Error('Wallet not connected');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const txHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      return txHash;
    } catch (error: any) {
      throw new Error(`Failed to revoke access: ${error.message}`);
    }
  }

  /**
   * Get all documents for current user (simulated)
   */
  async getUserDocuments(): Promise<number[]> {
    if (!this.account) throw new Error('Not connected');
    
    // Return empty array for now - would fetch from blockchain
    return [];
  }

  /**
   * Get document details (simulated)
   */
  async getDocument(documentId: number): Promise<any> {
    if (!this.account) throw new Error('Wallet not connected');
    
    return {
      ipfsCid: 'QmExample...',
      documentType: 'insurance_card',
      timestamp: Date.now(),
      owner: this.account,
      encryptionHash: 'hash...',
      isActive: true,
    };
  }

  /**
   * Check if facility has access to document (simulated)
   */
  async hasValidAccess(
    documentId: number,
    facilityAddress: string
  ): Promise<boolean> {
    if (!this.account) throw new Error('Wallet not connected');
    return true;
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
    this.account = null;
  }
}

export const web3Service = new Web3Service();
