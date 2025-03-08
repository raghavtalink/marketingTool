import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const BackgroundImage = ({ src, width, height }) => {
  const [image] = useImage(src);
  return (
    <Image
      image={image}
      width={width}
      height={height}
    />
  );
};

export default BackgroundImage;