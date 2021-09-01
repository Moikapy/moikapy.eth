import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import Button from './button';
import WalletButton from '../walletbutton';

function Navbar({
  navbarContainerStyle = '',
  brandText = '',
  brandTextStyle = '',
  onClick = () => {
    return;
  },
  onClickCreate = () => {
    return;
  },
  address,
}) {
  const router = useRouter();
  return (
    <div
      className={`navbar d-flex flex-row justify-content-between align-items-center ps-3 py-0 ${navbarContainerStyle}`}>
      <style global jsx>{`
        .brand-text {
          font-size: 1.5rem;
        }
        .navbar {
          z-index: 3;
          min-height: 2.25rem;
          width: calc(100% - 0.55px);
          background-color: #fff;
        }
        .create-button {
          width: 175px;
          background-color: #fff;
        }
        .cursor-point {
          cursor: pointer;
        }
      `}</style>
      <span
        onClick={() => router.push('/')}
        className={`brand-text cursor-point h-100 d-flex flex-row align-items-center py-2 ${brandTextStyle}`}>
        {brandText}
      </span>
      <div className={`d-none d-sm-flex flex-row`}>
        {address !== undefined && address.length > 0 && (
          <Button
            buttonStyle={`create-button py-0`}
            onPress={() => onClickCreate()}>
            Mint
          </Button>
        )}
        <WalletButton onPress={onClick} address={address} />
      </div>
    </div>
  );
}
const mapStateToProps = (state) => ({ address: state.session.address });

export default connect(mapStateToProps, {})(Navbar);
