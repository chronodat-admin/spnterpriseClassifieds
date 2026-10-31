import * as React from 'react';

export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

function parseQuery(query: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(() => parseQuery(query));

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent): void => setMatches(event.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useBreakpoint(): {
  breakpoint: Breakpoint;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isXxl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} {
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  const isXxl = useMediaQuery(`(min-width: ${BREAKPOINTS.xxl}px)`);

  const breakpoint: Breakpoint = isXxl ? 'xxl' : isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : isSm ? 'sm' : 'xs';

  return {
    breakpoint,
    isXs: !isSm,
    isSm: isSm && !isMd,
    isMd: isMd && !isLg,
    isLg: isLg && !isXl,
    isXl: isXl && !isXxl,
    isXxl,
    isMobile: !isMd,
    isTablet: isMd && !isLg,
    isDesktop: isLg
  };
}
