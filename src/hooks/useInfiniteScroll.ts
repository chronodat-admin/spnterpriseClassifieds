import * as React from 'react';

export interface IUseInfiniteScrollOptions {
  enabled?: boolean;
  onLoadMore: () => void | Promise<void>;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll(options: IUseInfiniteScrollOptions): React.RefObject<HTMLDivElement> {
  const { enabled = true, onLoadMore, rootMargin = '200px', threshold = 0.1 } = options;
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const onLoadMoreRef = React.useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!enabled || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            Promise.resolve(onLoadMoreRef.current()).catch(() => undefined);
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, rootMargin, threshold]);

  return sentinelRef;
}
