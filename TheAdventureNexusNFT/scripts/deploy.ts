import { ethers } from "hardhat";

async function main() {
  const AdventureNFT = await ethers.getContractFactory("AdventureNFT");
  const contract = await AdventureNFT.deploy();
  await contract.waitForDeployment();

  console.log("Contract deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
