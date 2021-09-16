import React, { useContext, useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import Context from '../Context';
import { Button } from '../../common/button';
import {
  dataRUIToBuffer,
  prepareFilesFromZIP,
  validateFiles,
} from '../htmlHelpers';
import { VisuallyHidden } from '../visually-hidden';
import styles from './styles.module.scss';
// import './styles.css'

const uid = Math.round(Math.random() * 100000000).toString();

export const HTMLComponent = (props) => {
  const {
    viewer,
    artifactUri,
    displayUri,
    previewUri,
    creator,
    objkt,
    onDetailView,
    preview,
    displayView,
  } = props;
  console.log(props);
  const context = useContext(Context);

  let _creator_ = false;
  let _viewer_ = false;
  let _objectId_ = false;

  if (creator && creator.address) {
    _creator_ = creator.address;
  }

  if (viewer && viewer !== undefined) {
    _viewer_ = viewer;
  }

  if (objkt) {
    _objectId_ = String(objkt);
  }

  // preview
  const iframeRef = useRef(null);
  const unpackedFiles = useRef(null);
  const unpacking = useRef(false);
  const [validHTML, setValidHTML] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [contentRef, setContentRef] = useState(null);

  const unpackZipFiles = async () => {
    unpacking.current = true;

    const buffer = dataRUIToBuffer(previewUri);
    const filesArr = await prepareFilesFromZIP(buffer);
    const files = {};
    filesArr.forEach((f) => {
      files[f.path] = f.blob;
    });

    unpackedFiles.current = files;

    const result = await validateFiles(unpackedFiles.current);
    if (result.error) {
      console.error(result.error);
      setValidationError(result.error);
    } else {
      setValidationError(null);
    }
    setValidHTML(result.valid);

    unpacking.current = false;
  };

  if (preview && !unpackedFiles.current && !unpacking.current) {
    unpackZipFiles();
  }

  useEffect(() => {
    const handler = async (event) => {
      if (event.data !== uid) {
        return;
      }

      iframeRef.current.contentWindow.postMessage(
        {
          target: 'hicetnunc-html-preview',
          data: unpackedFiles.current,
        },
        '*'
      );
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, [previewUri]);

  const classes = classnames({
    [styles.container]: true,
    [styles.interactive]: false,
  });

  if (preview) {
    // creator is viewer in preview
    _creator_ = _viewer_;

    if (validHTML) {
      return (
        <div className={classes}>
          <iframe
            ref={iframeRef}
            title="html-zip-embed"
            src={`https://hicetnunc2000.github.io/hicetnunc/gh-pages/html-preview/?uid=${uid}&creator=${_creator_}&viewer=${_viewer_}&objkt=${_objectId_}`}
            sandbox="allow-scripts allow-same-origin allow-modals"
            allow="accelerometer; camera; gyroscope; microphone; xr-spatial-tracking;"
          />
        </div>
      );
    } else if (validHTML === false) {
      return (
        <div className={styles.error}>Preview Error: {validationError}</div>
      );
    }
  }

  if (!displayView) {
    try {
      return (
        <div>
          <iframe
            className={styles.html + ' zip-embed'}
            title="html-embed"
            src={`${artifactUri}/?creator=${_creator_}&viewer=${_viewer_}&objkt=${_objectId_}`}
            sandbox="allow-scripts allow-same-origin"
            allow="accelerometer; camera; gyroscope; microphone; xr-spatial-tracking;"
          />
        </div>
      );
    } catch (err) {
      return undefined;
    }
  } else {
    console.log('displayView', displayView);
    return (
      <div>
        <iframe
          className={styles.html}
          title="html-embed"
          src={`${artifactUri}/?creator=${_creator_}&viewer=${_viewer_}&objkt=${_objectId_}`}
          // /?creator=${_creator_}&viewer=${_viewer_}&objkt=${_objectId_}
          sandbox="allow-scripts allow-same-origin"
          allow="accelerometer; camera; gyroscope; microphone; xr-spatial-tracking;"
        />
      </div>
    );
  }
};
