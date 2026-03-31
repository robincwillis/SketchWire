import React, { useRef, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as THREE from 'three';
import { Scene3D } from './Scene3D';
import { GestureLayer } from './GestureLayer';
import { Toolbar } from './Toolbar';
import { DrawingEngine } from '../engine/DrawingEngine';
import { CameraController } from '../engine/CameraController';
import { useDeviceLayout } from '../hooks/useDeviceLayout';

export function SketchCanvas() {
  const layout = useDeviceLayout();
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const drawingEngine = useMemo(() => new DrawingEngine(), []);
  const cameraController = useMemo(() => new CameraController(), []);

  const screenSize = { width: layout.width, height: layout.height };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/* Three.js canvas fills the whole screen */}
        <Canvas
          style={StyleSheet.absoluteFill as ViewStyle}
          onCreated={({ camera }) => {
            cameraRef.current = camera as THREE.PerspectiveCamera;
          }}
          camera={{ fov: 45, near: 1, far: 20000, position: [0, 0, 1000] }}
        >
          <Scene3D
            cameraController={cameraController}
            drawingEngine={drawingEngine}
            screenSize={screenSize}
          />
        </Canvas>

        {/* Gesture overlay — transparent, sits above canvas */}
        <GestureLayer
          drawingEngine={drawingEngine}
          cameraController={cameraController}
          cameraRef={cameraRef}
          screenSize={screenSize}
        />

        {/* Floating toolbar — above gesture layer */}
        <Toolbar layout={layout} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#4b4b4b',
  },
});
