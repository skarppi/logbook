import { useRef, useEffect } from 'react';

export function useScroll(deps) {
  const ref = useRef(null);
  const executeScroll = () => {
    const offsetTop = ref.current?.offsetTop + (ref.current?.offsetParent as HTMLElement)?.offsetTop;
    if (offsetTop) {
      setTimeout(() => window.scrollTo(0, offsetTop), 0);
    }
  };

  useEffect(executeScroll, [...deps, ref]);

  return ref;
}