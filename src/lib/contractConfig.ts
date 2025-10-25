// Celo Network Configuration
export const NETWORK_CONFIG = {
  testnet: {
    name: 'Celo Alfajores Testnet',
    chainId: 44787,
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    explorerUrl: 'https://alfajores.celoscan.io',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  mainnet: {
    name: 'Celo Mainnet',
    chainId: 42220,
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://celoscan.io',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
};

// Smart Contract Configuration
// TODO: Update this after deploying the contract to Celo testnet
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Contract ABI (Application Binary Interface)
export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "documentId", "type": "uint256" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": true, "name": "facility", "type": "address" },
      { "indexed": false, "name": "expiresAt", "type": "uint256" }
    ],
    "name": "AccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "documentId", "type": "uint256" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": true, "name": "facility", "type": "address" }
    ],
    "name": "AccessRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "name": "documentIds", "type": "uint256[]" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": false, "name": "facilities", "type": "address[]" }
    ],
    "name": "BatchAccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "documentId", "type": "uint256" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": false, "name": "ipfsCid", "type": "string" },
      { "indexed": false, "name": "documentType", "type": "string" },
      { "indexed": false, "name": "timestamp", "type": "uint256" }
    ],
    "name": "DocumentUploaded",
    "type": "event"
  },
  {
    "inputs": [
      { "name": "documentIds", "type": "uint256[]" },
      { "name": "facilities", "type": "address[]" }
    ],
    "name": "batchGrantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "documentId", "type": "uint256" }
    ],
    "name": "deactivateDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "documentId", "type": "uint256" }
    ],
    "name": "getDocument",
    "outputs": [
      { "name": "ipfsCid", "type": "string" },
      { "name": "documentType", "type": "string" },
      { "name": "timestamp", "type": "uint256" },
      { "name": "owner", "type": "address" },
      { "name": "encryptionHash", "type": "string" },
      { "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" }
    ],
    "name": "getUserDocuments",
    "outputs": [
      { "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "documentId", "type": "uint256" },
      { "name": "facility", "type": "address" },
      { "name": "expiresAt", "type": "uint256" }
    ],
    "name": "grantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "documentId", "type": "uint256" },
      { "name": "facility", "type": "address" }
    ],
    "name": "hasValidAccess",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "documentId", "type": "uint256" },
      { "name": "facility", "type": "address" }
    ],
    "name": "revokeAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "ipfsCid", "type": "string" },
      { "name": "documentType", "type": "string" },
      { "name": "encryptionHash", "type": "string" }
    ],
    "name": "uploadDocument",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// IPFS Configuration
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const IPFS_API_URL = 'https://api.pinata.cloud'; // Or use Web3.Storage, NFT.Storage, etc.

// Document Types
export const DOCUMENT_TYPES = [
  { value: 'insurance_card', label: 'Insurance Card' },
  { value: 'medical_record', label: 'Medical Record' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'vaccination_record', label: 'Vaccination Record' },
  { value: 'certification', label: 'Medical Certification' },
  { value: 'other', label: 'Other' },
] as const;
