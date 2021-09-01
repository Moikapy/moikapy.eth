import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import NFTForm from '../components/NFTForm';
import { event } from 'utility/analytics';

function Mint({ caddress }) {
  useEffect(() => {
    function Mount() {
      event({
        action: 'access_mint_page',
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

      function handleEthereum() {
        const { ethereum } = window;
        if (ethereum && ethereum.isMetaMask) {
          console.log('Ethereum successfully detected!');
          // Access the decentralized web!
          ethereum.request({ method: 'eth_requestAccounts' });
        } else {
          console.log('Please install MetaMask!');
        }
      }
    }

    Mount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <NFTForm />;
}
const mapStateToProps = (state) => ({
  address: state.session.address,
});
export default connect(mapStateToProps, {})(Mint);
