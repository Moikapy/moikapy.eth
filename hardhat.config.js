/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
const { API_URL, PRIVATE_KEY, POLYGON_KEY, WALLET_ADDRESS, ETHERSCAN_API } = process.env;
module.exports = {
  solidity: "0.8.0",
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API
  },
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
      url: 'https://polygon-mainnet.infura.io/v3/' + POLYGON_KEY,
      // url:'https://rpc-mainnet.matic.network',
      accounts: [`0x${PRIVATE_KEY}`],
      gas: 2100000,
      gasPrice: 8000000000
    },
    rinkeby: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },

}