import { useEffect, useState } from 'react';
import NFTInput from './NFTInput';
import Button from './common/button';
import { connect } from 'react-redux';
import { _metadata, _metadataTypes } from 'lib/metadataSchema.ts';
import { event } from 'utility/analytics';
import FormInputs from './FormInputs';
import Oxsis from 'lib/oxsis';
import detectEthereumProvider from '@metamask/detect-provider';
let web3, oxsis;

function NFTForm({ address }) {
  const [state, setState] = useState({
    ..._metadata,
    type: '',
    attributes: [
      {
        trait_type: 'Developer Site:',
        value: 'https://moikapy.lazynft.app',
      },
      { trait_type: 'Mint Date:', value: new Date().toUTCString() },
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
    (async () =>
      (await detectEthereumProvider())
        ? (web3 = window.ethereum)
        : (web3 = process.env.API_URL))();

    oxsis = new Oxsis(web3);
  }, []);
  return (
    <div
      className={
        'nft-mint-form d-flex flex-column m-1 pb-5 mx-auto container-fluid h-auto'
      }>
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
            className={`col-xl-6 m-3 p-2 border border-dark d-inline-flex flex-column`}>
            <h4>NFT INFO</h4>
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
          </div>

          <div
            className={`col-xl-6 m-3 p-2 border border-dark d-inline-flex flex-column`}>
            <NFTInput
              id={'nft-input'}
              label={'File:'}
              onChange={async (e) => {
                if (typeof e.fileType !== 'undefined') {
                  e.fileType.split('/')[0] === 'audio' ||
                  e.fileType.split('/')[0] === 'video'
                    ? setState({
                        ...state,
                        animation_url: 'ipfs://' + e.cid,
                        fileData: '',
                        type: e.fileType.split('/')[0],
                        showInput: true,
                      })
                    : setState({
                        ...state,
                        animation_url: '',
                        fileData: 'ipfs://' + e.cid,
                        type: e.fileType.split('/')[0],
                        disable: false,
                        showInput: false,
                      });
                } else {
                  setState({
                    ...state,
                    animation_url: '',
                    fileData: '',
                    type: '',
                    disable: true,
                    showInput: false,
                  });
                }
              }}
            />
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
                      fileData: 'ipfs://' + e.cid,
                      disable: false,
                      token: null,
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
            <div className={`d-flex flex-column w-auto`}>
              {state.fileData !== undefined && state.fileData.length > 0 && (
                <>
                  <div className={'nft-img-preview mx-auto w-auto'}>
                    <img
                      alt="Lazy NFT App Image"
                      className={'w-100'}
                      src={
                        'https://ipfs.io/ipfs/' +
                        state.fileData.replace('ipfs://', '')
                      }
                    />
                  </div>
                  <hr />
                </>
              )}
              {state.type.split('/')[0] === 'video' && (
                <div className={'nft-video-preview mx-auto w-auto'}>
                  <video
                    controls
                    className={''}
                    src={
                      'https://ipfs.io/ipfs/' +
                      state.fileData.replace('ipfs://', '')
                    }
                  />
                </div>
              )}
              {state.type.split('/')[0] === 'audio' && (
                <div className={'nft-audio-preview'}>
                  <audio
                    controls
                    className={'w-100'}
                    src={
                      'https://ipfs.io/ipfs/' +
                      state.fileData.replace('ipfs://', '')
                    }
                  />
                </div>
              )}
              <Button
                disabled={
                  state.fileData === undefined && state.name.length === 0
                }
                buttonStyle={`btn-dark mb-3`}
                onPress={async () => {
                  await setState({ ...state, isLoading: true });
                  const json = JSON.stringify({
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
                        trait_type: 'File Type:',
                        value: state.type.toUpperCase(),
                      },
                    ],
                    properties: state.properties,
                  });
                  const _tkn = await Oxsis.storeFileAsBlob(json);
                  await Oxsis.mintNFT(address, _tkn);

                  if (_tkn !== undefined) {
                    event({
                      action: 'mint',
                      params: {
                        event_category: 'mint',
                        event_label: 'mint',
                      },
                    });

                    setState({
                      ...state,
                      token: token.token,
                      disable: !state.disable,
                      isLoading: false,
                    });
                  }
                }}>
                Mint
              </Button>
            </div>
          </div>
        </div>
        {state.isLoading && (
          <div
            className={`w-100 h-100 loader d-flex flex-column justify-content-center align-items-center`}>
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
