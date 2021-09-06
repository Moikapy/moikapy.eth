import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Oxsis from 'lib/oxsis';

let oxsis;
import { event } from 'utility/analytics';

function _index({ address, chainId }) {
  const [state, setState] = useState({ collectionCount: 0, NFTs: [] });
  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {

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

    async function handleEthereum() {
      const { ethereum } = window;
      if (ethereum && ethereum.isMetaMask) {
        // Access the decentralized web!
        ethereum.request({ method: 'eth_requestAccounts' });
        oxsis = new Oxsis();
        const wallet = process.env.WALLET_ADDRESS;
        if (address !== undefined && address.length > 0 && chainId === 137) {
          let NFTCount = await oxsis.getNFTCount();
          if (id !== undefined) {
            event({
              action: `token_${id}`,
            });
            let NFT = await oxsis.getNFTURI(id);
            let _NFT = await fetch(NFT)
              .then(async (res) => await res.json())
              .then(async (out) => {
                return out;
              })
              .catch((err) => {
                throw err;
              });
            console.log(_NFT)
            _NFT['_id'] = await id;
            setState({
              ...state,
              NFTs: [_NFT],
              collectionCount: NFTCount,
            });
          }
        }
      } else {
        console.log('Please install MetaMask!');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return (
    <>
      <Head>
        <title>
          MOIKAPY {router.pathname !== '/' ? router.pathname.replace('[id]', id).toUpperCase() : ''}
        </title>
      </Head>
      <style jsx>
        {`
          .nft-card {
            max-width: 600px;
            max-height: 900px;
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
        className={`container w-100 h-100 d-flex flex-row justify-content-center`}>
        {console.log(state.NFTs)}
        <div
          className={`h-100 w-100 d-flex flex-row flex-wrap justify-content-center ${state.NFTs.length == 0 ? 'align-items-center' : ''
            }`}>
          {(address !== undefined && address.length == 0) || chainId !== 137 ? (
            <p className={'text-capitalize'}>
              please connect to the matic network to view collection
            </p>
          ) : state.NFTs !== undefined && state.NFTs.length > 0 ? (
            <>   <div
              className={
                'nft-card card p-3 m-1 d-flex flex-column justify-content-between'
              }>
              ID:{state.NFTs[0]._id}
              <hr />
              <div className={`h-100 w-100`}>
                {
                  <Image
                    height={'100%'}
                    width={'100%'}
                    layout='responsive'
                    title={state.NFTs[0].name + '; ' + state.NFTs[0].description}
                    src={state.NFTs[0].image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                  />
                }
                <hr />
                <p className={`m-0`}>{state.NFTs[0].name}</p>
                <hr />
                <p className={`m-0 desc-section text-wrap`}>
                  {state.NFTs[0].description.length > 0 ? state.NFTs[0].description : 'N/A'}
                </p>
              </div>
              <div className={`h-100 w-100`}>
                <hr />
                {state.NFTs[0].attributes.map(({ trait_type, value }, key) => {
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
                  rel="noreferrer"
                  target="_blank"
                  href={`https://opensea.io/assets/matic/${process.env.CONTRACT_ADDRESS}/${state.NFTs[0]._id}`}>
                  View On Opensea
                </a>
              </div>
            </div>
            </>
          ) : (
            <p>Error... NFT MAY NOT EXIST... TRY REFRESHING...</p>
          )}
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
