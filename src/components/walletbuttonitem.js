import { useState } from 'react';
import { truncateAddress } from '../lib/moiWeb3';
function WalletButtonItem({
  text = '',
  onPress = () => {
    console.log('connecting...');
  },
  walletItemStyle = '',
}) {
  return (
    <div
      className={`wallet-button-item d-flex flex-row justify-content-end border-bottom border-dark cursor-point ${walletItemStyle}`}
      onClick={() => onPress()}>
      {text}
    </div>
  );
}
export default WalletButtonItem;
