import { useRef, useEffect } from "react";
import { Theme } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function useScroll<T extends HTMLElement>(deps: any[]) {
  const theme = useTheme<Theme>();

  const ref = useRef<T>(null);
  const executeScroll = () => {
    const offsetTop =
      (ref.current?.offsetTop ?? 0) +
      (ref.current?.offsetParent as HTMLElement)?.offsetTop -
      Number(theme.mixins.toolbar.minHeight ?? 0) -
      20;
    if (offsetTop) {
      setTimeout(() => window.scrollTo(0, offsetTop), 0);
    }
  };

  useEffect(executeScroll, [...deps, ref]);

  return ref;
}
