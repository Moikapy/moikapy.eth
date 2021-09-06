import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { useRouter } from 'next/router';
import Oxsis from '../lib/oxsis';

let web3, oxsis;
import { event } from 'utility/analytics';

function _index({ address, chainId }) {
  const router = useRouter();
  const [state, setState] = useState({ collectionCount: 0, NFTs: [] });
  useEffect(() => {
    function Mount() {
      event({
        action: 'access_oasis',
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
        let array = [];

        // Access the decentralized web!
        ethereum.request({ method: 'eth_requestAccounts' });
        oxsis = new Oxsis();
        if (address !== undefined && address.length > 0 && chainId === 137) {
          let NFTs = await oxsis.getNFTs(address);

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
          if (array.length == 0) {
            router.push('/');
          }
        } else {
          if (array.length == 0) {
            router.push('/');
          }
        }
      } else {
        console.log('Please install MetaMask!');
        if (array.length == 0) {
          router.push('/');
        }
      }
    }

    Mount();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);
  return (
    <>
      <style jsx>{``}</style>
      <div
        className={`container h-100 d-flex flex-row justify-content-center align-items-center text-uppercase`}>
        The Lounge COMING SOON
      </div>
    </>
  );
}
const mapStateToProps = (state) => ({
  address: state.session.address,
  chainId: state.session.chainId,
});
export default connect(mapStateToProps, {})(_index);
