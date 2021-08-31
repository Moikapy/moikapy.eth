import Rarepress from 'rarepress.js';
import decryptData from './decryptData';
import encryptData from '../lib/encryptData';
import { _metadata } from './metadataSchema.ts';

export default class MoiNFTs {
  constructor({ _host, _rarepress, _storeAccount }) {
    this._host = _host;
    this._storeAccount = _storeAccount;
  }
  static async initRarepress() {
    try {
      const rarepress = new Rarepress();
      return rarepress;
    } catch (error) {
      throw error;
    }
  }
  static encryptData(data, sk) {
    try {
      let encryptedData = encryptData(data, sk);
      return encryptedData;
    } catch (error) {
      throw error;
    }
  }
  static async decryptData(data) {
    try {
      let decryptedData = decryptData(data, process.env.SECRETKEY);

      return decryptedData;
    } catch (error) {
      throw error;
    }
  }
  async getNFTSByAddress({ account, skip = 0, limit = 100 }) {
    return await fetch(
      this._host +
        `/user/${account.toLowerCase()}/tokens?skip=${skip}&limit=${limit}`
    ).then((res) => {
      return res.json();
    });
  }
  async getUserByNFTAddress({ account, tokenId }) {
    return await fetch(
      this._host + `/user/${account.toLowerCase()}/tokens/${tokenId}`
    ).then((res) => {
      return res.json();
    });
  }
  async getCID(files) {
    try {
      const rarepress = await MoiNFTs.initRarepress();
      await rarepress.init({ host: await this._host });

      let file = files[0];
      let cid = await rarepress.add(file);

      return { file: file, cid, fileType: file.type };
    } catch (error) {
      throw error;
    }
  }
  async mintNFT({ account, metadata, supply = 1, _royalties = 200 }) {
    try {
      const metaDataObj = {
        ..._metadata,
        ...metadata,
      };
      console.log(metaDataObj);
      const rarepress = await MoiNFTs.initRarepress();
      await rarepress.init({ host: await this._host });
      let token = await rarepress.create({
        metadata: { ...metaDataObj },

        supply: supply,
        creators: [
          {
            account: account,
            value: 10000,
          },
        ],
        royalties: [
          {
            account: account,
            value: _royalties,
          },
        ],
      });
      return { token };
    } catch (error) {
      throw error;
    }
  }
  async tradeNFT({ token, ercToken = 'ETH', price }) {
    const rarepress = await MoiNFTs.initRarepress();
    await rarepress.init({ host: await this._host });
    const trade = await rarepress.trade.create({
      what: {
        type: 'ERC721',
        id: token.tokenId,
      },
      with: {
        type: ercToken,
        value: price !== '0' ? price * Math.pow(10, 18) : 0,
      },
      how: {
        originFees: [
          {
            account: this._storeAccount,
            value: 750,
          },
        ],
      },
    });
    return { trade };
  }
}
