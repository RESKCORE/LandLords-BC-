import React, { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  id: string;
  src: string;
  poster: string;
  alt: string;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ id, src, poster, alt }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const still = imgRef.current;
    if (!video) return;

    video.src = src;

    const handlePlaying = () => {
      if (still) {
        still.style.transition = 'opacity 1s';
        still.style.opacity = '0';
        setTimeout(() => {
          still.style.animation = 'none';
        }, 1050);
      }
    };

    video.addEventListener('playing', handlePlaying, { once: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: '150px 0px' }
    );

    observer.observe(video);

    return () => {
      video.removeEventListener('playing', handlePlaying);
      observer.disconnect();
    };
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        className="media"
        id={id}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
      />
      <img
        ref={imgRef}
        className="media kb"
        data-fallback={id}
        src={poster}
        alt={alt}
      />
    </>
  );
};

