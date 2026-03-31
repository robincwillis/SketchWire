import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSketchStore } from '../store/sketchStore';
import { DeviceLayout } from '../hooks/useDeviceLayout';

interface Props {
  layout: DeviceLayout;
}

export function Toolbar({ layout }: Props) {
  const insets = useSafeAreaInsets();
  const mode = useSketchStore((s) => s.mode);
  const setMode = useSketchStore((s) => s.setMode);
  const undo = useSketchStore((s) => s.undo);
  const clear = useSketchStore((s) => s.clear);
  const lines = useSketchStore((s) => s.lines);

  const btnSize = layout.toolbarButtonSize;
  const isLeft = layout.toolbarPosition === 'left';

  const containerStyle = isLeft
    ? [
        styles.containerLeft,
        { top: insets.top + 16, left: insets.left + 16, gap: 12 },
      ]
    : [
        styles.containerBottom,
        {
          bottom: insets.bottom + 16,
          left: 0,
          right: 0,
          gap: 12,
        },
      ];

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <ToolButton
        label="✏️"
        title="Draw"
        size={btnSize}
        active={mode === 'draw'}
        onPress={() => setMode('draw')}
      />
      <ToolButton
        label="✋"
        title="Navigate"
        size={btnSize}
        active={mode === 'navigate'}
        onPress={() => setMode('navigate')}
      />
      <ToolButton
        label="↩"
        title="Undo"
        size={btnSize}
        disabled={lines.length === 0}
        onPress={undo}
      />
      <ToolButton
        label="✕"
        title="Clear"
        size={btnSize}
        disabled={lines.length === 0}
        onPress={clear}
      />
    </View>
  );
}

interface BtnProps {
  label: string;
  title: string;
  size: number;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

function ToolButton({ label, title, size, active, disabled, onPress }: BtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        active && styles.buttonActive,
        disabled && styles.buttonDisabled,
      ]}
      accessibilityLabel={title}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerLeft: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
  },
  containerBottom: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: 'rgba(80, 80, 200, 0.9)',
    borderColor: 'rgba(100,100,255,0.8)',
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonLabel: {
    fontSize: 22,
  },
});
