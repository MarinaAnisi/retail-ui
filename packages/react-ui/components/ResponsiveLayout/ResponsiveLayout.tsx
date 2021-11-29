import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { ThemeContext } from '../../lib/theming/ThemeContext';
import { isFunction } from '../../lib/utils';

import { addResponsiveLayoutListener, checkMatches } from './ResponsiveLayoutEvents';

interface ResponsiveLayoutProps {
  onLayoutChange?: (layout: ResponsiveLayoutState) => void;
  children?: React.ReactNode | ((currentLayout: ResponsiveLayoutState) => React.ReactNode);
}

interface ResponsiveLayoutState {
  isMobile: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = (props) => {
  const theme = useContext(ThemeContext);

  const getLayoutFromGlobal = (): ResponsiveLayoutState => {
    const isMobile = checkMatches(theme.mobileMediaQuery);

    return { isMobile: !!isMobile };
  };

  const [state, setState] = useState(getLayoutFromGlobal());

  const mobileListener: React.MutableRefObject<{ remove: () => void } | null> = useRef(null);

  const prepareMediaQueries = useCallback(() => {
    if (!theme) {
      return;
    }

    mobileListener.current = addResponsiveLayoutListener(theme.mobileMediaQuery, checkLayoutsMediaQueries);

    // Checking for SSR use case
    const globalLayout = getLayoutFromGlobal();

    if (globalLayout.isMobile !== state.isMobile) {
      setState(globalLayout);
    }
  }, [theme]);

  const checkLayoutsMediaQueries = useCallback(
    (e: MediaQueryListEvent) => {
      if (!theme) {
        return;
      }

      if (e.media === theme.mobileMediaQuery) {
        setState((prevState: ResponsiveLayoutState) => ({
          ...prevState,
          isMobile: e.matches,
        }));
      }
    },
    [theme],
  );

  useEffect(() => {
    if (props.onLayoutChange) {
      props.onLayoutChange(state);
    }
  }, [state]);

  useEffect(() => {
    prepareMediaQueries();

    return () => {
      mobileListener.current?.remove;
    };
  }, []);

  if (isFunction(props.children)) {
    return (props.children(state) ?? null) as React.ReactElement;
  }

  return (props.children ?? null) as React.ReactElement;
};

export function responsiveLayout<T extends new (...args: any[]) => React.Component>(WrappedComp: T) {
  const ComponentWithLayout = class extends WrappedComp {
    public layout!: ResponsiveLayoutState;

    public get currentLayout(): ResponsiveLayoutState {
      return this.layout;
    }

    public set currentLayout(value: ResponsiveLayoutState) {
      //
    }

    public get isMobileLayout(): boolean {
      return this.layout.isMobile;
    }

    public set isMobileLayout(value: boolean) {
      //
    }

    public renderWithLayout = (currentLayout: ResponsiveLayoutState) => {
      this.layout = currentLayout;

      return super.render();
    };

    public render() {
      return <ResponsiveLayout>{this.renderWithLayout}</ResponsiveLayout>;
    }
  };

  const nameDescriptor = Object.getOwnPropertyDescriptor(ComponentWithLayout, 'name');

  if (!nameDescriptor || nameDescriptor.configurable) {
    Object.defineProperty(ComponentWithLayout, 'name', { value: WrappedComp.name });
  }

  return ComponentWithLayout;
}
