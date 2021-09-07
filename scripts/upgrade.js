// scripts/upgrade_box.js
require('dotenv').config();
const { ethers, upgrades } = require('hardhat');
const { API_URL, PRIVATE_KEY, POLYGON_KEY, CONTRACT_ADDRESS } = process.env;

async function main() {
  const ERC721 = await ethers.getContractFactory("ERC721_V1");
  console.log('Upgrading ERC721...', CONTRACT_ADDRESS);
  await upgrades.upgradeProxy(CONTRACT_ADDRESS, ERC721);
  console.log('ERC721 CONTRACT UPGRADED');
}

main().then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });