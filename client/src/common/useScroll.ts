import { useRef, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { useTheme } from '@material-ui/styles';

export function useScroll(deps) {
  const theme = useTheme<Theme>()

  const ref = useRef(null);
  const executeScroll = () => {
    const offsetTop = ref.current?.offsetTop
      + (ref.current?.offsetParent as HTMLElement)?.offsetTop
      - Number(theme.mixins.toolbar.minHeight ?? 0)
      - 20;
    if (offsetTop) {
      setTimeout(() => window.scrollTo(0, offsetTop), 0);
    }
  };

  useEffect(executeScroll, [...deps, ref]);

  return ref;
}