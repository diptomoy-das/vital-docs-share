import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_CONFIG } from './contractConfig';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private account: string | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found. Please install MetaMask.');
    }

    try {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      this.account = accounts[0];
      this.signer = this.provider.getSigner();

      const network = await this.provider.getNetwork();

      if (network.chainId !== NETWORK_CONFIG.testnet.chainId) {
        await this.switchToCeloTestnet();
      }

      if (CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.signer
        );
      }

      return accounts[0];
    } catch (error: any) {
      console.error('Connection error:', error);
      throw new Error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
    }
  }

  async switchToCeloTestnet(): Promise<void> {
    try {
      const chainIdHex = '0x' + NETWORK_CONFIG.testnet.chainId.toString(16);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
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

  async getBalance(): Promise<string> {
    if (!this.provider || !this.account) throw new Error('Not connected');

    try {
      const balance = await this.provider.getBalance(this.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async uploadDocument(
    ipfsCid: string,
    documentType: string,
    encryptionHash: string
  ): Promise<{ documentId: number; txHash: string }> {
    if (!this.contract) {
      return this.simulateUploadDocument(ipfsCid, documentType, encryptionHash);
    }

    try {
      const tx = await this.contract.uploadDocument(ipfsCid, documentType, encryptionHash);
      const receipt = await tx.wait();

      const event = receipt.events?.find((e: any) => e.event === 'DocumentUploaded');
      const documentId = event?.args?.documentId.toNumber() || 0;

      return {
        documentId,
        txHash: receipt.transactionHash,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  async batchGrantAccess(
    documentIds: number[],
    facilityAddresses: string[]
  ): Promise<string> {
    if (!this.contract) {
      return this.simulateBatchGrantAccess(documentIds, facilityAddresses);
    }

    try {
      const tx = await this.contract.batchGrantAccess(documentIds, facilityAddresses);
      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error: any) {
      throw new Error(`Failed to grant access: ${error.message}`);
    }
  }

  async revokeAccess(
    documentId: number,
    facilityAddress: string
  ): Promise<string> {
    if (!this.contract) {
      return this.simulateRevokeAccess(documentId, facilityAddress);
    }

    try {
      const tx = await this.contract.revokeAccess(documentId, facilityAddress);
      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error: any) {
      throw new Error(`Failed to revoke access: ${error.message}`);
    }
  }

  async getUserDocuments(): Promise<number[]> {
    if (!this.contract || !this.account) {
      return [];
    }

    try {
      const docs = await this.contract.getUserDocuments(this.account);
      return docs.map((d: any) => d.toNumber());
    } catch (error) {
      console.error('Failed to get user documents:', error);
      return [];
    }
  }

  async getDocument(documentId: number): Promise<any> {
    if (!this.contract) {
      return this.simulateGetDocument(documentId);
    }

    try {
      const doc = await this.contract.getDocument(documentId);
      return {
        ipfsCid: doc[0],
        documentType: doc[1],
        timestamp: doc[2].toNumber(),
        owner: doc[3],
        encryptionHash: doc[4],
        isActive: doc[5],
      };
    } catch (error: any) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  async hasValidAccess(
    documentId: number,
    facilityAddress: string
  ): Promise<boolean> {
    if (!this.contract) return true;

    try {
      return await this.contract.hasValidAccess(documentId, facilityAddress);
    } catch (error) {
      console.error('Failed to check access:', error);
      return false;
    }
  }

  private async simulateUploadDocument(
    ipfsCid: string,
    documentType: string,
    encryptionHash: string
  ): Promise<{ documentId: number; txHash: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const documentId = Math.floor(Math.random() * 10000);
    const txHash = '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { documentId, txHash };
  }

  private async simulateBatchGrantAccess(
    documentIds: number[],
    facilityAddresses: string[]
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const txHash = '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return txHash;
  }

  private async simulateRevokeAccess(
    documentId: number,
    facilityAddress: string
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const txHash = '0x' + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return txHash;
  }

  private simulateGetDocument(documentId: number): any {
    return {
      ipfsCid: 'QmExample...',
      documentType: 'insurance_card',
      timestamp: Date.now(),
      owner: this.account,
      encryptionHash: 'hash...',
      isActive: true,
    };
  }

  onAccountChanged(callback: (account: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          callback(accounts[0]);
        }
      });
    }
  }

  onNetworkChanged(callback: (chainId: number) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        callback(parseInt(chainId, 16));
      });
    }
  }

  disconnect(): void {
    this.account = null;
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  isContractDeployed(): boolean {
    return CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
  }
}

export const web3Service = new Web3Service();
