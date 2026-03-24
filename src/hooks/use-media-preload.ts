import { useEffect, useState, useRef } from "react";
import { useMediaPreloader } from "@/utils/media-preloader";

interface UseMediaPreloadOptions {
  preloadOnMount?: boolean;
  preloadOnHover?: boolean;
  preloadOnVisible?: boolean;
  priority?: 'high' | 'low';
}

export const useMediaPreload = (
  mediaUrls: { images?: string[]; pdfs?: string[] },
  options: UseMediaPreloadOptions = {}
) => {
  const { preloadPageMedia, isPreloaded } = useMediaPreloader();
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedMedia, setPreloadedMedia] = useState<Set<string>>(new Set());

  const {
    preloadOnMount = false,
    preloadOnHover = true,
    preloadOnVisible = true,
    priority = 'low'
  } = options;

  // Preload on mount if requested
  useEffect(() => {
    if (preloadOnMount && (mediaUrls.images?.length || mediaUrls.pdfs?.length)) {
      setIsPreloading(true);
      preloadPageMedia(mediaUrls).finally(() => {
        setIsPreloading(false);
        // Track preloaded media
        const allUrls = [...(mediaUrls.images || []), ...(mediaUrls.pdfs || [])];
        setPreloadedMedia(new Set(allUrls.filter(url => isPreloaded(url))));
      });
    }
  }, [preloadOnMount, mediaUrls, preloadPageMedia, isPreloaded]);

  // Handlers for hover and visibility
  const handleHover = () => {
    if (preloadOnHover && !isPreloading) {
      setIsPreloading(true);
      preloadPageMedia(mediaUrls).finally(() => {
        setIsPreloading(false);
      });
    }
  };

  const handleVisible = () => {
    if (preloadOnVisible && !isPreloading) {
      setIsPreloading(true);
      preloadPageMedia(mediaUrls).finally(() => {
        setIsPreloading(false);
      });
    }
  };

  return {
    isPreloading,
    preloadedMedia,
    handleHover,
    handleVisible,
    isMediaPreloaded: (url: string) => preloadedMedia.has(url) || isPreloaded(url),
  };
};

// Intersection Observer hook for visibility-based preloading
export const useIntersectionPreload = (
  mediaUrls: { images?: string[]; pdfs?: string[] },
  options: UseMediaPreloadOptions = {}
) => {
  const { preloadPageMedia } = useMediaPreloader();
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!elementRef.current || hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
          preloadPageMedia(mediaUrls);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [mediaUrls, preloadPageMedia, hasBeenVisible]);

  return {
    elementRef,
    hasBeenVisible,
  };
};
