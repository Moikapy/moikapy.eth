
import { useEffect, useState } from 'react';
import NFTInput from './NFTInput';
import Button from './common/button';
import { connect } from 'react-redux';
import { _metadata, _metadataTypes } from '../lib/metadataSchema.ts';
import { event } from '../utility/analytics';
import FormInputs from './FormInputs';
import Oxsis from '../lib/oxsis';
import nft from '../lib/nft-storage';
import MediaViewer from './media-viewer';
import Input from './common/input';
let web3, oxsis;

function NFTForm({ address }) {
  const [supply, setSupply] = useState(1);
  const [state, setState] = useState({
    ..._metadata,
    type: '',
    attributes: [
      { trait_type: 'Mint_Date', value: new Date().toUTCString() },
    ],
    token: null,
    disable: true,
    showInput: false,
    isLoading: false,
  });

  const handleFormResponses = (e, data) => {
    if (
      _metadataTypes[data + 'Type'] == 'string' ||
      _metadataTypes[data + 'Type'] == 'url' ||
      _metadataTypes[data + 'Type'] == 'color'
    ) {
      setState({ ...state, [data]: e.target.value });
    }
  };
  useEffect(() => {
    oxsis = new Oxsis(window.ethereum);
  }, []);
  return (
    <div
      className={
        'nft-mint-form d-flex flex-column m-1 pb-5 mx-auto container-fluid h-auto'
      }
    >
      <style global jsx>
        {`
          .file-widget {
            max-width: 18.75rem;
            max-width: 37.5rem;
          }
          .royalty-btn {
            min-width: 4.6875rem;
            margin: 0.5rem;
          }
          .nft-img-preview img {
            object-fit: contain;
          }
          .nft-img-preview img,
          .nft-video-preview video {
            max-height: 300px;
          }
          .loader {
            position: fixed; /* Sit on top of the page content */
            top: 0;
            left: 0;
            background-color: grey;
            z-index: 100; /* Specify a stack order in case you're using a different order for other elements */
            cursor: pointer; /* Add a pointer on hover */
            opacity: 50%;
          }
          .loader div {
            opacity: 100%;
          }
        `}
      </style>

      <div className="rounded overflow-md-scroll d-flex flex-column justify-content-between align-items-center p-1 h-100">
        {/* TOP SECTION */}
        <div className="d-flex flex-xl-row flex-column flex-wrap justify-content-around mx-2 w-100">
          <div
            className={`col-xl-6 m-3 p-2 border border-dark d-inline-flex flex-column`}
          >
            <h4>NFT INFO</h4>
            This is The Art Factory NFT minting form for the MOIAVERSE
            <hr />
            {Object.keys(_metadata).map((data, key) => (
              <FormInputs
                show={data === 'image' || state.showInput}
                key={key}
                id={data}
                label={data.replace('_', ' ')}
                type={_metadataTypes[data + 'Type']}
                onChange={(e) => handleFormResponses(e, data)}
                style={`w-100`}
              />
            ))}
            <>
              <Input
                id={10}
                label={'NFT Supply'}
                type={'number'}
                value={supply}
                placeholder={
                  supply
                }
                onChange={(e) => setSupply(e.target.value)}
                className={`w-100 col-6`}
              />
              <hr />
            </>
          </div>

          <div
            className={`col-xl-6 m-3 p-2 border border-dark d-inline-flex flex-column`}
          >
            <NFTInput
              id={'nft-input'}
              label={'File:'}
              onChange={async (e) => {
                console.log('ew', e.fileType);

                setState({
                  ...state,
                  fileData: 'https://ipfs.io/ipfs/' + e.cid,
                  animation_url: 'https://ipfs.io/ipfs/' + e.cid,
                  type: e.fileType.split('/')[0],
                  showInput: true,
                  memeType:
                    e.fileType == 'application/zip'
                      ? 'application/zip'
                      : e.fileType,
                });
              }}
            />
            <br/>
            NFT COVER FOR VIDEO/AUDIO (NON IMAGE NFT)
            <br />
            {state.showInput && (
              <NFTInput
                id={'nft-input-cover'}
                label={'Cover:'}
                accept={'image/*'}
                onChange={(e) => {
                  if (typeof e.fileType !== 'undefined') {
                    setState({
                      ...state,
                      fileData: 'https://ipfs.io/ipfs/' + e.cid,
                      disable: false,
                      token: null,
                      memeType: e.fileType,
                    });
                  } else {
                    setState({
                      ...state,
                      fileData: '',
                      disable: true,
                      showInput: false,
                    });
                  }
                }}
              />
            )}
            <hr />
            <div className="d-flex flex-column justify-content-around">

              name: {state.name},<br />
              description: {state.description},<br />
              image: {state.fileData},<br />
              animation_url: {state.animation_url},<br />
              background_color: {state.background_color},<br />
              external_url: {state.external_url},<br />
              youtube_url: {state.youtube_url},<br />
              attributes: {state.attributes[0].trait_type},
              {'File Type:'},<br />

              properties: {state.properties},<br />

            </div>
            <hr />
            <div className={`d-flex flex-column w-auto`}>


              {state.animation_url !== undefined &&
                state.animation_url.length > 0 && (
                  <>
                    <div className={'nft-img-preview mx-auto w-auto'}>
                      <MediaViewer
                        mimeType={state.memeType}
                        displayUri={state.animation_url}
                        artifactUri={state.animation_url}
                        type={'ipfs'}
                      />
                    </div>
                    <hr />
                  </>
                )}

              <Button
                disabled={
                  state.fileData === undefined && state.name.length === 0
                }
                buttonStyle={`btn-dark mb-3`}
                onPress={async () => {
                  await setState({ ...state, isLoading: true });
                  const json = JSON.stringify({
                    ..._metadata,
                    minted_by: address,
                    name: state.name,
                    description: state.description,
                    image: state.fileData,
                    animation_url: state.animation_url,
                    background_color: state.background_color,
                    external_url: state.external_url,
                    youtube_url: state.youtube_url,
                    attributes: [
                      ...state.attributes,
                      {
                        trait_type: 'File_Type',
                        value: state.type.toUpperCase(),
                      }, {
                        trait_type: 'NFT_TYPE',
                        value: 'ART', // ADD LAND, ENTITIES, WEARABLES, and EQUIPMENT
                      }
                    ],
                    properties: state.properties,
                    seller_fee_basis_points: 500,
                  });

                  const _tkn = await nft.storeFileAsBlob(json);
                  await oxsis.mintNFT(address, _tkn, supply, 'ART');


                  event({
                    action: 'mint',
                    params: {
                      event_category: 'mint',
                      event_label: 'mint',
                    },
                  });

                  setState({
                    ...state,
                    token: _tkn,
                    disable: !state.disable,
                    isLoading: false,
                  });
                }}
              >
                Mint
              </Button>
            </div>
          </div>
        </div>
        {state.isLoading && (
          <div
            className={`w-100 h-100 loader d-flex flex-column justify-content-center align-items-center`}
          >
            <div className="mx-auto text-uppercase mb-3">
              Minting NFT
              <hr />
            </div>
            <div className="spinner-border mx-auto" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
const mapStateToProps = (state) => ({
  address: state.session.address,
});
export default connect(mapStateToProps)(NFTForm);
