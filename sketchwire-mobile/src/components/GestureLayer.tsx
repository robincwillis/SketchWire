import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import * as THREE from 'three';
import { useSketchStore } from '../store/sketchStore';
import { DrawingEngine } from '../engine/DrawingEngine';
import { CameraController } from '../engine/CameraController';
import { AppMode } from '../types';

interface Props {
  drawingEngine: DrawingEngine;
  cameraController: CameraController;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  screenSize: { width: number; height: number };
}

function screenToNDC(
  x: number,
  y: number,
  size: { width: number; height: number }
): THREE.Vector2 {
  return new THREE.Vector2(
    (x / size.width) * 2 - 1,
    -((y / size.height) * 2 - 1)
  );
}

export function GestureLayer({ drawingEngine, cameraController, cameraRef, screenSize }: Props) {
  const mode = useSketchStore((s) => s.mode);
  const selectPoint = useSketchStore((s) => s.selectPoint);
  const allPoints = useSketchStore((s) => s.allPoints);
  const startLine = useSketchStore((s) => s.startLine);
  const addPoint = useSketchStore((s) => s.addPoint);
  const finishLine = useSketchStore((s) => s.finishLine);
  const setSelectPoint = useSketchStore((s) => s.setSelectPoint);

  const modeRef = useRef<AppMode>(mode);
  modeRef.current = mode;

  // ─── Single-finger draw ───────────────────────────────────────────────────
  const drawGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .runOnJS(true)
    .onStart((e) => {
      if (modeRef.current !== 'draw') return;
      const cam = cameraRef.current;
      if (!cam) return;

      // Snap to nearest point if touching near one
      const nearest = drawingEngine.findNearestPoint(
        { x: e.x, y: e.y },
        allPoints,
        cam,
        screenSize
      );
      const anchor = nearest ?? selectPoint ?? new THREE.Vector3(0, 0, 0);
      setSelectPoint(anchor);

      const ndc = screenToNDC(e.x, e.y, screenSize);
      const point = drawingEngine.getDrawPoint(ndc, cam, anchor);
      if (point) startLine(point.clone());
    })
    .onUpdate((e) => {
      if (modeRef.current !== 'draw') return;
      const cam = cameraRef.current;
      if (!cam) return;
      const anchor = selectPoint ?? new THREE.Vector3(0, 0, 0);
      const ndc = screenToNDC(e.x, e.y, screenSize);
      const point = drawingEngine.getDrawPoint(ndc, cam, anchor);
      if (point) addPoint(point.clone());
    })
    .onEnd(() => {
      if (modeRef.current !== 'draw') return;
      finishLine();
    });

  // ─── Two-finger orbit ─────────────────────────────────────────────────────
  const prevOrbit = useRef({ x: 0, y: 0 });
  const orbitGesture = Gesture.Pan()
    .minPointers(2)
    .runOnJS(true)
    .onStart((e) => {
      prevOrbit.current = { x: e.translationX, y: e.translationY };
    })
    .onUpdate((e) => {
      if (modeRef.current !== 'navigate') return;
      const dx = e.translationX - prevOrbit.current.x;
      const dy = e.translationY - prevOrbit.current.y;
      prevOrbit.current = { x: e.translationX, y: e.translationY };
      cameraController.orbit(dx, dy);
    });

  // ─── Pinch zoom ───────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onUpdate((e) => {
      if (modeRef.current !== 'navigate') return;
      if (e.scale !== 0) cameraController.zoom(e.scale);
    });

  const composed = Gesture.Race(
    drawGesture,
    Gesture.Simultaneous(orbitGesture, pinchGesture)
  );

  return (
    <GestureDetector gesture={composed}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-only" />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({});
