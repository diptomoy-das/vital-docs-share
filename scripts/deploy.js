const hre = require("hardhat");

async function main() {
  console.log("Starting deployment to Celo Alfajores testnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "CELO");

  if (balance === 0n) {
    console.error("\n❌ ERROR: No CELO balance!");
    console.log("\nGet test CELO from the faucet:");
    console.log("https://faucet.celo.org/alfajores");
    console.log("\nYour wallet address:", deployer.address);
    process.exit(1);
  }

  console.log("\nDeploying HealthDocumentManager contract...");
  const HealthDocumentManager = await hre.ethers.getContractFactory("HealthDocumentManager");
  const contract = await HealthDocumentManager.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("\nView on Celoscan:");
  console.log(`https://alfajores.celoscan.io/address/${contractAddress}`);

  console.log("\n📝 Next steps:");
  console.log(`1. Update src/lib/contractConfig.ts with this address:`);
  console.log(`   export const CONTRACT_ADDRESS = '${contractAddress}';`);
  console.log("\n2. Or add to .env file:");
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);

  console.log("\n3. Restart your dev server to see real blockchain transactions!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
