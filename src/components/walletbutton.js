import { useState } from 'react';
import { truncateAddress } from '../lib/moiWeb3';
function WalletButton({ address = '', onPress = () => {} }) {
  const [show, setShow] = useState(false);
  return (
    <div className={`h-100 border-start border-dark wallet-button `}>
      <style>
        {`
        .wallet-button{  
          width: 175px;
          background-color:#fff;
        }
        .wallet-button-items{
          max-height:18.75rem;
          width: 175px;
        }
        `}
      </style>

      {address.length > 0 ? (
        <div
          className={`wallet-button-address hover-blackflame d-flex flex-column align-items-center justify-content-center px-3 h-100 w-100 cursor-point`}
          onClick={() => {
            setShow(!show);
          }}>
          {truncateAddress(address)}
        </div>
      ) : (
        <div
          className={`wallet-button-address hover-blackflame d-flex flex-column align-items-center justify-content-center px-3 h-100 w-100 cursor-point`}
          onClick={() => {
            onPress();
          }}>
          CONNECT
        </div>
      )}
      {/* {show && (
        <div
          className={`wallet-button-items d-flex flex-column px-2 mr-1 bg-grey`}>
          <WalletButtonItem text={`Profile`} onPress={()=>router.push('/home')} />
        </div>
      )} */}
    </div>
  );
}
export default WalletButton;
