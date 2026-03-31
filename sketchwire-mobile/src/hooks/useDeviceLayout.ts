import { useWindowDimensions } from 'react-native';

export interface DeviceLayout {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  touchRadius: number;
  toolbarButtonSize: number;
  toolbarPosition: 'bottom' | 'left';
}

export function useDeviceLayout(): DeviceLayout {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  return {
    width,
    height,
    isTablet,
    isLandscape,
    touchRadius: isTablet ? 28 : 20,
    toolbarButtonSize: isTablet ? 56 : 48,
    toolbarPosition: isTablet ? 'left' : 'bottom',
  };
}
