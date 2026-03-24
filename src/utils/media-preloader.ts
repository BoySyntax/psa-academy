// Media preloader utility for critical images and PDFs

interface PreloadOptions {
  priority?: 'high' | 'low';
  timeout?: number;
}

class MediaPreloader {
  private cache = new Map<string, Promise<HTMLImageElement | boolean>>();
  private preloadedUrls = new Set<string>();

  // Preload an image
  preloadImage(src: string, options: PreloadOptions = {}): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return this.cache.get(src) as Promise<HTMLImageElement>;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      const timeout = options.timeout || 10000; // 10s default timeout
      
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image preload timeout: ${src}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(img);
        this.preloadedUrls.add(src);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to preload image: ${src}`));
      };

      // Start loading
      img.src = src;
      
      // Set priority if specified
      if (options.priority === 'high') {
        img.fetchPriority = 'high';
      }
    });

    this.cache.set(src, promise);
    return promise;
  }

  // Preload a PDF (check availability)
  preloadPdf(src: string, options: PreloadOptions = {}): Promise<boolean> {
    if (this.cache.has(src)) {
      return this.cache.get(src) as Promise<boolean>;
    }

    const promise = new Promise<boolean>((resolve) => {
      const timeout = options.timeout || 5000; // 5s for PDFs
      
      const timeoutId = setTimeout(() => {
        resolve(false); // Assume unavailable on timeout
      }, timeout);

      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', src);
      xhr.onload = () => {
        clearTimeout(timeoutId);
        const isAvailable = xhr.status === 200;
        if (isAvailable) {
          this.preloadedUrls.add(src);
        }
        resolve(isAvailable);
      };
      xhr.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
      xhr.send();
    });

    this.cache.set(src, promise);
    return promise;
  }

  // Preload multiple images
  preloadImages(urls: string[], options: PreloadOptions = {}): Promise<HTMLImageElement[]> {
    return Promise.allSettled(
      urls.map(url => this.preloadImage(url, options))
    ).then(results => 
      results
        .filter((result): result is PromiseFulfilledResult<HTMLImageElement> => result.status === 'fulfilled')
        .map(result => result.value)
    );
  }

  // Check if media is preloaded
  isPreloaded(src: string): boolean {
    return this.preloadedUrls.has(src);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.preloadedUrls.clear();
  }

  // Preload critical media for a page
  preloadPageMedia(mediaUrls: { images?: string[]; pdfs?: string[] }): Promise<void> {
    const promises: Promise<any>[] = [];
    
    if (mediaUrls.images) {
      promises.push(this.preloadImages(mediaUrls.images, { priority: 'high' }));
    }
    
    if (mediaUrls.pdfs) {
      promises.push(...mediaUrls.pdfs.map(pdf => this.preloadPdf(pdf, { priority: 'low' })));
    }
    
    return Promise.allSettled(promises).then(() => {});
  }
}

// Export singleton instance
export const mediaPreloader = new MediaPreloader();

// Hook for React components
export const useMediaPreloader = () => {
  return {
    preloadImage: mediaPreloader.preloadImage.bind(mediaPreloader),
    preloadPdf: mediaPreloader.preloadPdf.bind(mediaPreloader),
    preloadImages: mediaPreloader.preloadImages.bind(mediaPreloader),
    preloadPageMedia: mediaPreloader.preloadPageMedia.bind(mediaPreloader),
    isPreloaded: mediaPreloader.isPreloaded.bind(mediaPreloader),
  };
};
