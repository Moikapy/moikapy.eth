// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat');


async function main() {
  const ERC721 = await ethers.getContractFactory("ERC721_V1");

  const mc = await upgrades.deployProxy(ERC721);

  await mc.deployed();
  console.log("MyCollectible deployed to:", mc.address);
}


// 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
main().then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });



// getGasPrice returns the gas price on the current network
