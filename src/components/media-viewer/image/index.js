import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import styles from './styles.module.scss';

export const ImageComponent = ({
  artifactUri,
  displayUri,
  previewUri,
  onDetailView,
  preview,
  displayView,
  imageStyle
}) => {
  let src = onDetailView ? artifactUri : displayUri || artifactUri;
  return (
    <div>
      <div>
        <LazyLoadImage className={styles.style} src={src} alt="💥" />
      </div>
    </div>
  );
};
