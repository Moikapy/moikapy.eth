import { ethers } from 'ethers';


var abi = [{ "inputs": [{ "internalType": "address", "name": "_logic", "type": "address" }, { "internalType": "address", "name": "admin_", "type": "address" }, { "internalType": "bytes", "name": "_data", "type": "bytes" }], "stateMutability": "payable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "previousAdmin", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "AdminChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "beacon", "type": "address" }], "name": "BeaconUpgraded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "implementation", "type": "address" }], "name": "Upgraded", "type": "event" }, { "stateMutability": "payable", "type": "fallback" }, { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "admin_", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "changeAdmin", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "implementation", "outputs": [{ "internalType": "address", "name": "implementation_", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }], "name": "upgradeTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "upgradeToAndCall", "outputs": [], "stateMutability": "payable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }];

export default class Oxsis {
  constructor() {
    this.web3 = new ethers.providers.Web3Provider(window.ethereum);
  }

  // Foramt
  static formatUnits = async (value, formatTo) => {
    return ethers.utils.formatUnits(value, formatTo);
  };
  static parseUnits = async (value, formatTo) => {
    return ethers.utils.parseUnits(value, formatTo);
  };
  //Get Nonce
  static getNonce = async (address) => {
    try {
      const nonce = await this.web3.getTransactionCount(address, 'latest');
      console.log('The latest nonce is ' + nonce);
      return await nonce;
    } catch (error) {
      throw error;
    }
  };
  // Get Network
  static getNetwork = async (name_or_id) => {
    try {
      const network = await this.web3.getNetwork(name_or_id);
      console.log('The network is: ' + JSON.stringify(network));
      return await JSON.stringify(network);
    } catch (error) {
      throw error;
    }
  };
  // Get Balance of Address in BigNumber
  static getAddress = async () => {
    await this.web3.provider.request({ method: 'eth_requestAccounts' });
    const signer = this.web3.getSigner();
    await signer.getAddress();
  };
  // Get Block Number
  static getBlockNumber = async () => {
    try {
      const blockNumber = await this.web3.getBlockNumber();
      console.log('The latest block number is ' + blockNumber);
      return await blockNumber;
    } catch (error) {
      throw error;
    }
  };
  // Get Balance of Address in BigNumber
  static getBalance = async (address) => {
    return await this.web3.getBalance(address);
  };
  //
  //
  static getGasPrice = async () => await this.web3.getGasPrice();
  //
  static getContract = (contractJson, contractAddress) => {
    // const contractAddress = process.env.CONTRACT_ADDRESS;
    const contract = contractJson;
    return { contract, contractAddress };
  };

  static signTransaction = async (transaction) => {
    const signedTx = await web3.eth.accounts.signTransaction(transaction);
    return signedTx;
  };

  static sendTransaction = async (transaction) => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page

    await this.web3.sendTransaction(transaction, function (error, hash) {
      if (!error) {
        console.log(
          '🎉 The hash of your transaction is: ',
          hash,
          "\n Check Alchemy's Mempool to view the status of your transaction!"
        );
      } else {
        console.log(
          '❗Something went wrong while submitting your transaction:',
          error
        );
      }
    });
  };


  mintNFT = async (address, cid, amount, type, fixedSupply = true) => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    // const provider = new ethers.providers.Web3Provider(window.ethereum);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    if (this.web3 !== undefined) {
      const signer = await this.web3.getSigner();
      // console.log('signer', signer);

      var contract = await new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi,
        this.web3
      );
      var contractSign = await contract.connect(signer);
      var data = await contractSign
        .push(address, 'https://ipfs.io/ipfs/' + cid, amount, 'ART', true)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          return err;
        });
      return data;
    } else {
      throw new Error('Web3 is not defined');
    }
  };

  getNFTCount = async () => {
    const signer = this.web3.getSigner();
    var contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      abi,
      this.web3
    );
    var contractSign = await contract.connect(signer);
    return await contractSign
      .totalSupply()
      .then((res) => {
        console.log(res);
        return parseInt(Number(res._hex), 10);
      })
      .catch((err) => {
        throw err;
      });
  };
  getRoyaltiesPercentage = async () => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    // const provider = new ethers.providers.Web3Provider(window.ethereum);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    if (this.web3 !== undefined) {
      const signer = this.web3.getSigner();
      var contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi,
        this.web3
      );
      var contractSign = await contract.connect(signer);

      return await contractSign.getRoyaltiesPercentage();
    } else {
      return 0;
    }
  };
  getCollection = async (ddr) => {
    if (this.web3 !== undefined) {
      const signer = this.web3.getSigner();
      var contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi,
        this.web3
      );
      var contractSign = await contract.connect(signer);
      var arr = [];
      await contractSign
        .totalSupply()
        .then((res) => {
          for (var i = 0; i < parseInt(Number(res._hex), 10); i++) {
            var id = i + 1;
            const handleURI = async (id) =>
              await contractSign.uri('0x' + id);
            // console.log('handleURI', handleURI(id));
            arr.push({ tokenID: id, _uri: handleURI(id) });
          }
        })
        .catch((err) => {
          throw err;
        });
      // console.log(arr)
      return arr;
    } else {
      return [];
    }
  };
}
