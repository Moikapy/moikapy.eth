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
    }

    async () => {
      Mount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <NFTForm />;
}
const mapStateToProps = (state) => ({
  address: state.session.address,
});
export default connect(mapStateToProps, { })(Mint);
