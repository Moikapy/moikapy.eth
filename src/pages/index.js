import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Oxsis from 'lib/oxsis';

let web3, oxsis;
import { event } from 'utility/analytics';

function _index({ address, chainId }) {
  const [state, setState] = useState({ collectionCount: 0, NFTs: [] });
  useEffect(async () => {
    oxsis = new Oxsis();
    const wallet = process.env.WALLET_ADDRESS;
    if (address !== undefined && address.length > 0 && chainId === 137) {
      let NFTs = await oxsis.getNFTs(wallet);
      let NFTCount = await oxsis.getNFTCount();
      let array = [];
      for await (const nft of NFTs) {
        const _nft = await nft;
        await fetch(_nft._uri)
          .then(async (res) => await res.json())
          .then(async (out) => {
            out._id = _nft.tokenID;
            await array.push(out);
          })
          .catch((err) => {
            throw err;
          });
      }
      setState({
        ...state,
        collectionCount: NFTCount,
        NFTs: array,
      });
    }
  }, []);
  useEffect(() => {
    function Mount() {
      event({
        action: 'access_collection',
      });
      if (window.ethereum) {
        handleEthereum();
      } else {
        window.addEventListener('ethereum#initialized', handleEthereum, {
          once: true,
        });

        // If the event is not dispatched by the end of the timeout,
        // the user probably doesn't have MetaMask installed.
        setTimeout(handleEthereum, 3000); // 3 seconds
      }
    }
    function handleEthereum() {
      const { ethereum } = window;
      if (ethereum && ethereum.isMetaMask) {
        // Access the decentralized web!
        ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        console.log('Please install MetaMask!');
      }
    }

    Mount();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <style jsx>
        {`
          .nft-card {
            max-width: 315px;
            max-height: 650px;
            height: 100%;
            width: 100%;
            min-height: 150px;
            min-width: 200px;
          }
          .desc-section {
            min-height: 95px;
            vertical-align: middle;
          }
        `}
      </style>
      <a href="https://opensea.io/collection/moia-studios">Opensea</a>
      <p>NFT in Collection: {state.collectionCount}</p>
      <div
        className={`container d-flex flex-row justify-content-center mx-auto`}>
        <div
          className={`h-100 d-flex flex-row flex-wrap justify-content-start ${
            state.NFTs.length == 0 && 'align-items-center'
          }`}>
          {(address !== undefined && address.length == 0) || chainId !== 137 ? (
            <p className={'text-capitalize'}>
              please connect to the polygon network to view collection
            </p>
          ) : state.NFTs !== undefined && state.NFTs.length > 0 ? (
            state.NFTs.map(
              (
                {
                  _id,
                  name = 'untitled',
                  description,
                  image,
                  animation_url,
                  background_color,
                  external_url,
                  youtube_url,
                  attributes,
                  properties,
                },
                key
              ) => (
                <div
                  key={key}
                  className={
                    'nft-card card p-3 m-1 d-flex flex-column justify-content-between h-100'
                  }>
                  ID:{_id}
                  <hr />
                  <div className={`h-100 w-100`}>
                    {
                      <img
                        title={name + '; ' + description}
                        className={`h-100 w-100`}
                        src={image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                      />
                    }
                    <hr />
                    <p className={`m-0`}>{name}</p>
                    <hr />
                    <p className={`m-0 desc-section text-wrap`}>
                      {description.length > 0 ? description : 'N/A'}
                    </p>
                  </div>
                  <div className={`h-100 w-100`}>
                    <hr />
                    {attributes.map(({ trait_type, value }, key) => {
                      if (trait_type === 'File Type:') {
                        return (
                          <p key={key} className={`m-0`}>
                            {trait_type} {value}
                          </p>
                        );
                      }
                    })}
                    <hr />
                    <a
                      rel={`noRef`}
                      target="_blank"
                      href={`https://opensea.io/assets/matic/${process.env.CONTRACT_ADDRESS}/${_id}`}>
                      View On Opensea
                    </a>
                  </div>
                </div>
              )
            )
          ) : (
            <p>Refresh</p>
          )}
          {}
        </div>
      </div>
    </>
  );
}
const mapStateToProps = (state) => ({
  address: state.session.address,
  chainId: state.session.chainId,
});
export default connect(mapStateToProps, {})(_index);
