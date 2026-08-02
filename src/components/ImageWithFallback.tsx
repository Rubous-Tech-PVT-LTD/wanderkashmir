"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

export default function ImageWithFallback(props: ImageWithFallbackProps) {
  const { src, fallbackSrc = 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800', ...rest } = props;
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setError(false);
  }, [src]);

  return (
    <Image
      {...rest}
      src={error ? fallbackSrc : src}
      onError={() => {
        setError(true);
      }}
    />
  );
}
