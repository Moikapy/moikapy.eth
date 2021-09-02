import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Oxsis from 'lib/oxsis';

let web3, oxsis;
import { event } from 'utility/analytics';

function _index({ address, chainId }) {
  const [state, setState] = useState({ collectionCount: 0, NFTs: [] });
  useEffect(async () => {
    oxsis = new Oxsis(
      'https://polygon-mainnet.infura.io/v3/' + process.env.POLYGON_KEY,
      'uri'
    );
    const wallet = process.env.WALLET_ADDRESS;
    if (address !== undefined && address.length > 0 && chainId === 137) {
      let NFTs = await oxsis.getNFTs(wallet);
      let array = [];
      for await (const nft of NFTs) {
        fetch(await nft)
          .then(async (res) => await res.json())
          .then(async (out) => await array.push(out))
          .catch((err) => {
            throw err;
          });
      }
      setState({
        ...state,
        collectionCount: await oxsis.getNFTCount(),
        NFTs: array,
      });
    }
  }, []);
  useEffect(() => {
    function Mount() {
      event({
        action: 'access_collection',
      });
    }

    async () => {
      Mount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <style jsx>
        {`
          .nft-card {
            max-width: 400px;
            max-height: 450px;
            height: 100%;
            width: 100%;
            min-height: 150px;
            min-width: 200px;
          }
        `}
      </style>
      <a href="https://opensea.io/collection/moia-studios">Opensea</a>
      <p>NFT in Collection: {state.collectionCount}</p>
      <div
        className={`h-100 d-flex flex-row flex-wrap mx-auto justify-content-center align-items-center`}>
        {(address !== undefined && address.length == 0) || chainId !== 137 ? (
          <p className={'text-capitalize'}>
            please connect to the polygon network to view collection
          </p>
        ) : state.NFTs !== undefined && state.NFTs.length > 0 ? (
          state.NFTs.map(({ name, description, image }, key) => (
            <div key={key} className={'nft-card card p-3 d-flex flex-column'}>
              {/* {description} */}
              <img
                title={name + '; ' + description}
                className={`h-100 w-100`}
                src={image.replace('ipfs://', 'https://ipfs.io/ipfs/')}></img>
              {name}
            </div>
          ))
        ) : (
          <p>Refresh</p>
        )}
        {}
      </div>
    </>
  );
}
const mapStateToProps = (state) => ({
  address: state.session.address,
  chainId: state.session.chainId,
});
export default connect(mapStateToProps, {})(_index);
