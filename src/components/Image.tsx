import React from "react";
import LazyLoad from "react-lazyload";

interface ImageProps {
  src: string;
  alt: string;
  height?: number;
  width?: number;
}

const Image: React.FC<ImageProps> = ({ src, alt, height, width }) => {
  return (
    <LazyLoad height={height} offset={100}>
      <img src={src} alt={alt} height={height} width={width} />
    </LazyLoad>
  );
};

export default Image;
