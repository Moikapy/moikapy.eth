import { useRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Banner from '@/components/common/banner';
import { setProfile, connectID, readProfile, login } from 'actions/web3Actions';

import NFTForm from '../components/NFTForm';
import { event } from 'utility/analytics';

function _index({ connectID, idxInstance }) {
  useEffect(() => {
    function Mount() {
      event({
        action: 'access_mint_page',
      });
    }

    async () => {
      Mount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <NFTForm />
    </>
  );
}
const mapStateToProps = (state) => ({
  address: state.session.address,
  profile: state.session.did_profile,
  idxInstance: state.session.idxInstance,
  did: state.session.did,
});
export default connect(mapStateToProps, { connectID })(_index);
