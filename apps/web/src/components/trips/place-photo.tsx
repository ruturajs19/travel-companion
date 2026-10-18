'use client';

import {
  fetchWikipediaPlacePhoto,
  getCategoryPhoto,
  getCuratedLandmarkPhoto,
  getDestinationHero,
  resolvePostCover,
  resolveTripPhoto,
} from '@/lib/place-photos';
import { Camera, ExternalLink, MapPin, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PlacePhotoThumbnailProps {
  title: string;
  locationName?: string | null;
  notes?: string | null;
  destination?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlacePhotoThumbnail({
  title,
  locationName,
  notes,
  destination,
  className = '',
  size = 'md',
}: PlacePhotoThumbnailProps): React.ReactElement {
  // Check curated or category photo synchronously
  const curatedPhoto =
    getCuratedLandmarkPhoto(title, locationName) ||
    getCategoryPhoto(title, notes);

  const fallbackPhoto = getDestinationHero(destination);
  const [wikiPhoto, setWikiPhoto] = useState<{
    url: string;
    caption?: string;
    source: string;
  } | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const curatedUrl = curatedPhoto?.url;

  useEffect(() => {
    if (curatedUrl) {
      return;
    }

    const lookupTarget = (locationName || title)?.trim();
    if (!lookupTarget) {
      return;
    }

    let isMounted = true;
    fetchWikipediaPlacePhoto(lookupTarget).then((result) => {
      if (isMounted && result) {
        setWikiPhoto(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [curatedUrl, title, locationName]);

  const photo = curatedPhoto || wikiPhoto || fallbackPhoto;

  const sizeClasses = {
    sm: 'h-14 w-14 min-w-[3.5rem]',
    md: 'h-20 w-20 min-w-[5rem]',
    lg: 'h-28 w-28 min-w-[7rem]',
  }[size];

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (imgError || !photo) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-md border border-border/80 bg-muted/40 text-muted-foreground ${sizeClasses} ${className}`}
        title={locationName || title}
        aria-label={`Photo placeholder for ${title}`}
      >
        <Camera className="h-5 w-5 opacity-40" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group relative shrink-0 overflow-hidden rounded-md border border-border/80 bg-muted focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer ${sizeClasses} ${className}`}
        title={`View photo of ${locationName || title}`}
        aria-label={`View photo of ${locationName || title}`}
      >
        {!isLoaded ? (
          <div className="absolute inset-0 animate-pulse bg-muted/60" />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || title}
          onLoad={() => setIsLoaded(true)}
          onError={() => setImgError(true)}
          className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />
        <span className="absolute bottom-1 right-1 rounded bg-black/60 p-0.5 text-[10px] text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
          <Camera className="h-3 w-3" />
        </span>
      </button>

      {/* Lightbox Modal */}
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[70vh] overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption || title}
                className="max-h-[70vh] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 cursor-pointer rounded-full bg-black/60 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-black/80"
                aria-label="Close photo preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                {locationName ? (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 text-primary" />
                    {locationName}
                  </p>
                ) : null}
                {photo.caption && photo.caption !== title ? (
                  <p className="mt-1 text-xs italic text-muted-foreground/80">
                    {photo.caption}
                  </p>
                ) : null}
              </div>
              <a
                href={photo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
              >
                <span>Original</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

interface TripHeroBannerProps {
  destination: string;
  title: string;
  className?: string;
}

export function TripHeroBanner({
  destination,
  title,
  className = '',
}: TripHeroBannerProps): React.ReactElement {
  const hero = getDestinationHero(destination);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative mb-6 h-48 w-full overflow-hidden rounded-[var(--radius)] border border-border/80 shadow-xs sm:h-60 ${className}`}
    >
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.url}
          alt={hero.caption || destination}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <div className="h-full w-full bg-linear-to-r from-primary/20 via-primary/10 to-muted" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
      <div className="absolute bottom-4 left-4 right-4 flex flex-col justify-end text-white">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md">
          <MapPin className="h-3 w-3" />
          {destination}
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white drop-shadow-xs sm:text-3xl">
          {title}
        </h1>
      </div>
    </div>
  );
}

interface TripCardPhotoProps {
  destination: string;
  title?: string;
  className?: string;
}

export function TripCardPhoto({
  destination,
  title,
  className = '',
}: TripCardPhotoProps): React.ReactElement {
  const photo = resolveTripPhoto(destination, title);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-muted text-muted-foreground ${className}`}
      >
        <MapPin className="h-6 w-6 opacity-40" />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-muted ${className}`}
    >
      {!isLoaded ? (
        <div className="absolute inset-0 animate-pulse bg-muted/60" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.caption || destination}
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgError(true)}
        className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
    </div>
  );
}

interface BlogCardPhotoProps {
  title: string;
  coverImage?: string | null;
  tags?: string[];
  className?: string;
}

export function BlogCardPhoto({
  title,
  coverImage,
  tags,
  className = '',
}: BlogCardPhotoProps): React.ReactElement {
  const photo = resolvePostCover({ title, coverImage, tags });
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-muted text-muted-foreground ${className}`}
      >
        <Camera className="h-6 w-6 opacity-40" />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-muted ${className}`}
    >
      {!isLoaded ? (
        <div className="absolute inset-0 animate-pulse bg-muted/60" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.caption || title}
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgError(true)}
        className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
    </div>
  );
}

