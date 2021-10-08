import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Oxsis from 'lib/oxsis';
import Image from 'next/image';
import MediaViewer from 'components/media-viewer';
import { event } from 'utility/analytics';

let oxsis;

function _index({ address, chainId }) {
  const [state, setState] = useState({ collectionCount: 0, NFTs: [] });

  async function getNFTs(NFTCount) {
    try {
      let NFTs = await oxsis.getCollection();
      let array = [];
      for (var i = 0; i < NFTCount; i++) {
        const _nft = await NFTs[i];
        const tokenID = _nft.tokenID;
        const uri = await _nft._uri;
        const res = await fetch(uri)
          .then(async (res) => await res.json())
          .then(async (out) => {
            const obj = {
              ...out,
              _id: tokenID,
              tokens_claimed: await oxsis.getClaimStatus(tokenID),
            };
            return obj;
          })
          .catch((err) => {
            throw err;
          });
        array.push(res);

        setState({
          ...state,
          collectionCount: NFTCount,
          NFTs: array,
        });
      }
    } catch (error) {
      throw error;
    }
  }

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

    async function handleEthereum() {
      try {
        const { ethereum } = window;
        if (ethereum && ethereum.isMetaMask) {
          // Access the decentralized web!
          ethereum.request({ method: 'eth_requestAccounts' });
          oxsis = new Oxsis(ethereum);
          const wallet = process.env.WALLET_ADDRESS;
          let NFTCount = await oxsis.getNFTCount();

          console.log('Loading NFTS');
          await getNFTs(NFTCount);
        } else {
          console.log('Please install MetaMask!');
        }
      } catch (error) {
        throw error;
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
            max-height: 625px;
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
      <div
        className={`container d-flex flex-column justify-content-start mx-auto`}
      >
        <p className={`h4`}>Total NFT: {state.collectionCount}</p>
        <a href="https://opensea.io/collection/moiaverse-space">
          Collection on Opensea
        </a>
        <hr />
      </div>
      <div
        className={`container d-flex flex-row justify-content-center mx-auto`}
      >
        <div
          className={`h-100 d-flex flex-row flex-wrap justify-content-between ${
            state.NFTs.length == 0 ? 'align-items-center' : ''
          }`}
        >
          {(address !== undefined && address.length == 0) || chainId !== 137 ? (
            <p className={'text-capitalize'}>
              please connect to the matic network to view collection
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
                  }
                >
                  ID:{_id}
                  <hr />
                  <div className={`h-100 w-100`}>
                    {attributes.map(({ trait_type, value }, key) => {
                      if (trait_type === 'File Type:') {
                        return (
                          <MediaViewer
                            mimeType={'image/png'}
                            displayUri={image}
                            artifactUri={image}
                            type={'ipfs'}
                          />
                        );
                      }
                    })}

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
                    <div className={`d-flex flex-row justify-content-between`}>
                      <a href={`token/${_id}`}>View Here</a>
                      <a
                        rel="noreferrer"
                        target="_blank"
                        href={`https://opensea.io/assets/matic/${process.env.CONTRACT_ADDRESS}/${_id}`}
                      >
                        View On Opensea
                      </a>
                    </div>
                  </div>
                </div>
              )
            )
          ) : (
            <p>Previews Coming Soon</p>
          )}
        </div>
      </div>
      <hr className={`container`} />
    </>
  );
}
const mapStateToProps = (state) => ({
  address: state.session.address,
  chainId: state.session.chainId,
});
export default connect(mapStateToProps, {})(_index);
