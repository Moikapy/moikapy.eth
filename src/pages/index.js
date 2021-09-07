import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Oxsis from 'lib/oxsis';
import Image from 'next/image';
import { event } from 'utility/analytics';

let oxsis;
function _index({ address, chainId }) {
  const [state, setState] = useState({ collectionCount: 0, NFTs: [] });
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
      const { ethereum } = window;
      if (ethereum && ethereum.isMetaMask) {
        // Access the decentralized web!
        ethereum.request({ method: 'eth_requestAccounts' });
        oxsis = new Oxsis();
        const wallet = process.env.WALLET_ADDRESS;
        // if (address !== undefined && address.length > 0 && chainId === 137) {
          let NFTCount = await oxsis.getNFTCount();
          async function getNFTs() {
            let NFTs = await oxsis.getCollection();
            let array = [];
            for await (const nft of NFTs) {
              const _nft = await nft;
              const uri = await _nft._uri;
              await fetch(uri)
                .then(async (res) => await res.json())
                .then(async (out) => {
                  out._id = _nft.tokenID;
                  await array.push(out);
                })
                .catch((err) => {
                  throw err;
                });
            }
            return array;
          }
          setState({
            ...state,
            collectionCount: NFTCount,
            NFTs: await getNFTs(),
          });
        // }
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
        className={`container d-flex flex-column justify-content-start mx-auto`}>

        <p className={`h4`}>Total NFT: {state.collectionCount}</p>
        <a href="https://opensea.io/collection/moia-studios">Collection on Opensea</a>
        <hr />
      </div>
      <div
        className={`container d-flex flex-row justify-content-center mx-auto`}>
        <div
          className={`h-100 d-flex flex-row flex-wrap justify-content-between ${state.NFTs.length == 0 ? 'align-items-center' : ''
            }`}>
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
                  }>
                  ID:{_id}
                  <hr />
                  <div className={`h-100 w-100`}>
                    {
                      <Image
                        height={'100%'}
                        width={'100%'}
                        layout='responsive'
                        title={name + '; ' + description}
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
                    <div className={`d-flex flex-row justify-content-between`}>
                      <a

                        href={`token/${_id}`}>
                        View Here
                      </a>
                      <a
                        rel="noreferrer"
                        target="_blank"
                        href={`https://opensea.io/assets/matic/${process.env.CONTRACT_ADDRESS}/${_id}`}>
                        View On Opensea
                      </a>
                    </div>
                  </div>
                </div>
              )
            )
          ) : (
            <p>Refresh</p>
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
