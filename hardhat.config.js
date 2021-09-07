/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
const { API_URL, PRIVATE_KEY, POLYGON_KEY } = process.env;
module.exports = {
  solidity: "0.8.3",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  defaultNetwork: "matic",
  networks: {
    hardhat: {
      chainId: 137
    },
    matic: {
      url: 'https://polygon-mainnet.infura.io/v3/'+POLYGON_KEY,
      // url:'https://rpc-mainnet.matic.network',
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: 8000000000
    },
    rinkeby: {
      url: API_URL,
      accounts: [ `0x${PRIVATE_KEY}` ]
    }
  },
}