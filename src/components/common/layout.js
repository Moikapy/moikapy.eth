import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Navbar from './navbar';
import LoginModal from '../loginModal';
import { startCore } from '../../actions/';
import { useRouter } from 'next/router';
function Layout({ children, layoutContainerStyle = '', startCore }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  // INITS WEB3 Functionality
  useEffect(() => {
    startCore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`d-flex flex-column h-100 w-100 fnt-monospace`}>
      <style jsx global>
        {`
          html,
          body,
          #__next {
            height: 100%;
            font-family: monospace;
          }

          .content-wrapper {
            height: calc(100% - 36px);
            width: 100%;
          }
        `}
      </style>
      {/* NAVBAR */}
      <Navbar
        navbarContainerStyle={'sticky-top border-top border-bottom border-dark'}
        brandText={process.env.BRAND_NAME || 'MOIAVERSE.SPACE'}
        brandTextStyle={`text-uppercase`}
        onClick={() => setShow(true)}
        onClickCreate={() => router.push('/mint')}
      />
      <div className={`content-wrapper contianer-fluid d-flex flex-column`}>
        {/**Main Content */}
        <main className={`p-2 w-100 h-100 ${layoutContainerStyle}`}>
          {children}

          <div className='text-center w-100 p-3 mx-auto'>
            Contract Addresses:{' '}<br />
            NIDUS TOKEN: <a
              href={`https://polygonscan.com/address/${'0xC3eF62F7F4EB2b9340FBc72e501A41b53CdEbE56'}`}>
              {'0xC3eF62F7F4EB2b9340FBc72e501A41b53CdEbE56'}
            </a><br />
            MOIAVERSE: <a
              href={`https://polygonscan.com/address/${process.env.CONTRACT_ADDRESS}`}>
              {process.env.CONTRACT_ADDRESS}
            </a><br />
            ART_FACTORY: <a
              href={`https://polygonscan.com/address/${'0xFAd7F020dCef9BE47d4d6e408c4f19EF01039B5e'}`}>
              {'0xFAd7F020dCef9BE47d4d6e408c4f19EF01039B5e'}
            </a>
          </div>
          <hr className={`container`} />
        </main>
      </div>
      {/* LOGIN MODAL */}
      {show && <LoginModal handleShow={() => setShow(!show)} />}
      <a href='#' id='open_preferences_center' className={'d-none'}>
        Open Preferences Center
      </a>
    </div>
  );
}
const mapStateToProps = (state) => ({
  online_user_count: state.session.online_user_count,
});
export default connect(null, { startCore })(Layout);
