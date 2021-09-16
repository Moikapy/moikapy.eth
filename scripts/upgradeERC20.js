// scripts/upgrade_box.js
require('dotenv').config();
const { ethers, upgrades } = require('hardhat');
const { API_URL, PRIVATE_KEY, POLYGON_KEY, CONTRACT_ADDRESS } = process.env;

async function main() {
  const ERC20 = await ethers.getContractFactory("LobbyToken");
  console.log('Upgrading LobbyToken...', '0xCb659699948024F0364B88b89175f1f4D26F75ea');
  await upgrades.upgradeProxy('0xCb659699948024F0364B88b89175f1f4D26F75ea', ERC20);
  console.log('LobbyToken CONTRACT UPGRADED');
}

main().then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });