import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import NFTForm from '../components/NFTForm';
import { event } from '../utility/analytics';

function Mint({ address, chainId }) {
  const router = useRouter();
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
          // address.toLowerCase() !== process.env.WALLET_ADDRESS &&
          //   router.push('/');
        } else {
          console.log('Please install MetaMask!');
        }
      }
    }

    Mount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return chainId === 137 ? <NFTForm /> : <div className='my-3 py-5'><p className={`h4 text-center`}>Please Switch to Polygon Network To Mint</p></div>
}
const mapStateToProps = (state) => ({
  address: state.session.address,
  chainId: state.session.chainId,
});
export default connect(mapStateToProps, {})(Mint);
