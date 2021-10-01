// scripts/upgrade_box.js
require('dotenv').config();
const { ethers, upgrades } = require('hardhat');
const { API_URL, PRIVATE_KEY, POLYGON_KEY, CONTRACT_ADDRESS } = process.env;

async function main() {
  const NFTCollection = await ethers.getContractFactory("NFTCollection");
  console.log('Upgrading NFTCollection...', CONTRACT_ADDRESS);
  await upgrades.upgradeProxy(CONTRACT_ADDRESS, NFTCollection);
  console.log('NFTCollection CONTRACT UPGRADED');
}

main().then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });