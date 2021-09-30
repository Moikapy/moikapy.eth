import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Oxsis from '../../lib/oxsis';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { event } from '../../utility/analytics';

let oxsis;

function _index({ address, chainId }) {
  const router = useRouter();
  const [state, setState] = useState({ collectionCount: 0, NFTs: [] });

  useEffect(() => {
    function Mount() {
      event({
        action: 'access_dashboard',
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
          console.log(
            'address',
            address.toLowerCase() == process.env.WALLET_ADDRESS
          );

          // address.toLowerCase() !== process.env.WALLET_ADDRESS &&
          //   router.push('/');
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
        className={`container d-flex flex-row justify-content-center mx-auto h-100`}
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
          ) : (
            <p>Welcome to Your Dashboard</p>
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
