"use client";

import { useEffect } from "react";
import type { PhotoAlbum } from "./photo-manifest";

type CityGalleryProps = {
  album: PhotoAlbum;
  onBack: () => void;
};

const photoUrl = (path: string) => `./${path}`;

export default function CityGallery({ album, onBack }: CityGalleryProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${album.local} · Through My Lens`;
    return () => { document.title = previousTitle; };
  }, [album]);

  return (
    <main className="gallery-page">
      <nav className="gallery-nav">
        <button onClick={onBack} aria-label="返回世界地图">
          <span aria-hidden="true">←</span>
          返回地图
        </button>
        <p>The World I’ve Explored <em>Through My Lens</em></p>
      </nav>

      <header className="gallery-heading">
        <p>{album.countryLocal}</p>
        <h1>{album.local}</h1>
        <span>{album.photos.length + 1} photographs</span>
      </header>

      <figure className="gallery-hero">
        <img src={photoUrl(album.hero)} alt={`${album.local}摄影集封面`} />
      </figure>

      <section className="gallery-grid" aria-label={`${album.local}摄影作品`}>
        {album.photos.map((photo, index) => (
          <figure key={photo}>
            <img
              src={photoUrl(photo)}
              alt={`${album.local}摄影作品 ${index + 1}`}
              loading="lazy"
            />
          </figure>
        ))}
      </section>

      <section className="story-placeholder">
        <div>
          <span>AI STORY</span>
          <h2>A memory waiting to be told.</h2>
        </div>
        <p>{album.story}</p>
      </section>

      <footer className="gallery-footer">
        <button onClick={onBack}>← 回到旅行地图</button>
      </footer>
    </main>
  );
}
