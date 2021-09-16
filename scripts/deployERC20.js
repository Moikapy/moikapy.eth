// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat');


async function main() {
  const ERC20 = await ethers.getContractFactory("LobbyToken");

  const mc = await upgrades.deployProxy(ERC20);

  await mc.deployed();
  console.log("LobbyToken deployed to:", mc.address);
}

main().then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

