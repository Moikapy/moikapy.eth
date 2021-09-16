/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { PauseIcon, PlayIcon } from './icons';
import { Visualiser } from './visualiser';
import styles from './styles.module.scss';

export const AudioComponent = ({
  artifactUri,
  displayUri,
  previewUri,
  preview,
  displayView,
}) => {
  const visualiser = useRef();
  const [userTouched, setUserTouched] = useState(false);
  const [play, setPlay] = useState(false);
  console.log('sound', displayView);
  const togglePlay = () => {
    setUserTouched(true);
    setPlay(!play);
  };

  // user interaction
  useEffect(() => {
    if (userTouched) {
      visualiser.current.init();
    }
  }, [userTouched]);

  useEffect(() => {
    if (userTouched) {
      if (play) {
        visualiser.current.play();
      } else {
        visualiser.current.pause();
      }
    }
  }, [play]);

  const classes = classnames({
    [styles.container]: true,
    [styles.userTouch]: userTouched,
  });
  /*   console.log(displayUri)
   */

  if (!displayView) {
    return (
      <div>
        <style jsx>
          {`
            #audio {
              width: '100%';
            }
          `}
        </style>
        <div>
          <img
            style={{ height: '50vh', display: 'block', margin: '0 auto' }}
            src={displayUri}
            alt="audio-cover"
          />
          <br />
          <audio
            style={{ display: 'block', margin: '0 auto' }}
            src={preview ? previewUri : artifactUri}
            controls
          />
        </div>
        {false && <Visualiser ref={visualiser} src={artifactUri} />}
        {false && (
          <div className={styles.icons} onClick={togglePlay}>
            {play ? <PauseIcon /> : <PlayIcon />}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <>
        <div>
          <span>
            <img style={{ width: '100%' }} src={displayUri} alt="audio-cover"/>
            <br />
            <audio
              style={{ width: '100%' }}
              src={preview ? previewUri : artifactUri}
              controls
            />
          </span>
          {false && <Visualiser ref={visualiser} src={artifactUri} />}
          {false && (
            <div className={styles.icons} onClick={togglePlay}>
              {play ? <PauseIcon /> : <PlayIcon />}
            </div>
          )}
        </div>
      </>
    );
  }
};
