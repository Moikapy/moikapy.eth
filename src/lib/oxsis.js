import { ethers } from 'ethers';
import { NFTStorage, File, Blob, FormData } from 'nft.storage';
import moifetch from 'moifetch';
const api = process.env.LAZY_NFT_KEY;
const nft_storage = new NFTStorage({ token: api });
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
  /**********
   * NFT ACTIONS
   * **************/
  static getCIDStatus = async (cid) => {
    try {
      const cidStatus =
        nft_storage !== undefined && (await nft_storage.status(cid));
      return cidStatus;
    } catch (error) {
      throw error;
    }
  };
  // Deletes a CID
  static deleteByCID = async (cid) => {
    try {
      const cidStatus =
        nft_storage !== undefined && (await nft_storage.delete(cid));
      return cidStatus;
    } catch (error) {
      throw error;
    }
  };
  // Check if CID is valid
  static checkByCID = async (cid) => {
    try {
      const cidStatus =
        nft_storage !== undefined && (await nft_storage.check(cid));
      return cidStatus;
    } catch (error) {
      throw error;
    }
  };
  //Stores File and Returns IPFS CID
  static storeAsFile = async (file) => {
    try {
      const _file = new File([file], file[0].name, file[0].type);
      return _file;
    } catch (error) {
      throw error;
    }
  };
  //Stores File Blob and Returns IPFS CID
  static storeFileAsBlob = async (file) => {
    try {
      const cid =
        nft_storage !== undefined &&
        (await nft_storage.storeBlob(
          new Blob([Array.isArray(file) ? file[0] : file])
        ));
      return cid;
    } catch (error) {
      throw error;
    }
  };

  //Stores Multiple Files Into Directory and Returns IPFS CID
  static storeMultiFile = async (files) => {
    let _files = [];
    let i = 0;
    try {
      for await (var file of files) {
        const _file = new File([file], i);
        _files.push(_file);
      }

      const cid =
        nft_storage !== undefined && (await nft_storage.storeDirectory(_files));

      return cid;
    } catch (error) {
      throw error;
    }
  };

  mintNFT = async (address, tokenURI) => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    // const provider = new ethers.providers.Web3Provider(window.ethereum);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    if (this.web3 !== undefined) {
      const signer = await this.web3.getSigner();
      // console.log('signer', signer);
      var abi = require('../../artifacts/contracts/ERC721.sol/ERC721_V1.json');
      var contract = await new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi.abi,
        this.web3
      );
      var contractSign = await contract.connect(signer);
      var gas = await this.web3.getGasPrice();
      var data = await contractSign
        .mintNFT(address, 'https://ipfs.io/ipfs/' + tokenURI)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          return err;
        });
      console.log('tx', data);
      return data;
    } else {
      throw new Error('Web3 is not defined');
    }
  };

  getNFTCount = async () => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    // const provider = new ethers.providers.Web3Provider(window.ethereum);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...

    const signer = this.web3.getSigner();
    var abi = require('../../artifacts/contracts/ERC721.sol/ERC721_V1.json');
    var contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      abi.abi,
      this.web3
    );
    var contractSign = await contract.connect(signer);
    return await contractSign
      .getTotalItemsMinted()
      .then((res) => {
        console.log(res);
        return parseInt(Number(res._hex), 10);
      })
      .catch((err) => {
        throw err;
      });
  };
  getNFTURI = async (id) => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    // const provider = new ethers.providers.Web3Provider(window.ethereum);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    if (this.web3 !== undefined) {
      const signer = this.web3.getSigner();
      var abi = require('../../artifacts/contracts/ERC721.sol/ERC721_V1.json');
      var contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi.abi,
        this.web3
      );
      var contractSign = await contract.connect(signer);

      return await contractSign.tokenURI('0x' + id);
    } else {
      return [];
    }
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

      var abi = require('../../artifacts/contracts/ERC721.sol/ERC721_V1.json');
      var contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi.abi,
        this.web3
      );
      var contractSign = await contract.connect(signer);

      return await contractSign.getRoyaltiesPercentage();
    } else {
      return 0;
    }
  };
  getCollection = async (ddr) => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    // const provider = new ethers.providers.Web3Provider(window.ethereum);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    if (this.web3 !== undefined) {
      const signer = this.web3.getSigner();
      var abi = require('../../artifacts/contracts/ERC721.sol/ERC721_V1.json');
      var contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi.abi,
        this.web3
      );
      var contractSign = await contract.connect(signer);
      var arr = [];
      await contractSign
        .getTotalItemsMinted()
        .then((res) => {
          for (var i = 0; i < parseInt(Number(res._hex), 10); i++) {
            var id = i + 1;
            const handleURI = async (id) =>
              await contractSign.tokenURI('0x' + id);
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
  getNFTs = async (addr) => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what Metamask injects as window.ethereum into each page
    // const provider = new ethers.providers.Web3Provider(window.ethereum);

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    if (this.web3 !== undefined) {
      const signer = this.web3.getSigner();
      var abi = require('../../artifacts/contracts/ERC721.sol/ERC721_V1.json');
      var contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi.abi,
        this.web3
      );
      var contractSign = await contract.connect(signer);
      return await contractSign
        .tokensOfOwner(addr)
        .then(async (res) => {
          return await res.map(async ({ _hex }) => {
            const _id = parseInt(Number(_hex), 10);
            const uri = await contractSign.tokenURI(parseInt(Number(_hex), 10));
            return { tokenID: _id, _uri: uri };
          });
        })
        .catch((err) => {
          throw err;
        });
    } else {
      return [];
    }
  };
  static getGasFees = async (callback) => {
    try {
      let wsObj;
      let wsUrl = 'wss://www.gasnow.org/ws';
      let _data;
      let updatePageGasPriceData = async (data) => {
        const eth = await moifetch.GET(
          'https://api.coingecko.com/api/v3/coins/ethereum'
        );

        if (data && data.gasPrices) {
          let slow = Math.floor(
            await oxsis.formatUnits(
              await oxsis.parseUnits(data.gasPrices.slow.toString(), 'wei'),
              'gwei'
            )
          );
          let standard = Math.floor(
            await oxsis.formatUnits(
              await oxsis.parseUnits(data.gasPrices.standard.toString(), 'wei'),
              'gwei'
            )
          );
          let fast = Math.floor(
            await oxsis.formatUnits(
              await oxsis.parseUnits(data.gasPrices.fast.toString(), 'wei'),
              'gwei'
            )
          );
          let rapid = Math.floor(
            await oxsis.formatUnits(
              await oxsis.parseUnits(data.gasPrices.rapid.toString(), 'wei'),
              'gwei'
            )
          );
          const blockNumber = await this.getBlockNumber();
          _data = {
            lastBlock: blockNumber,
            price: eth.data.market_data.current_price.usd,
            show: true,
            slow: slow,
            standard: standard,
            fast: fast,
            rapid: rapid,
          };
          callback(_data);
        }
      };

      wsObj = new WebSocket(wsUrl);

      wsObj.onopen = (evt) => {
        console.log('Connection open ...');
      };

      wsObj.onmessage = async (evt) => {
        const dataStr = evt.data;
        const data = JSON.parse(dataStr);

        if (data.type) {
          updatePageGasPriceData(data.data);
        }
      };

      wsObj.onclose = (evt) => {
        console.log('Connection closed.');
      };
      return _data;
    } catch (error) {
      throw error;
    }
  };
}
