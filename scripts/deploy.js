// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat');


async function main() {
  const NFTCollection = await ethers.getContractFactory("NFTCollection");

  const mc = await upgrades.deployProxy(NFTCollection, ['MOIAVERSE', 'MIVTK', '0x71d1272c2357bbb6a3c0e8ace1ab84374a6426d9', '0x877728846bFB8332B03ac0769B87262146D777f3', 5, false, ""], { initializer: 'initialize' });

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
