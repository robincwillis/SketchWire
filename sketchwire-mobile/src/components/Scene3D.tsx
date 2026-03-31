import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { useSketchStore } from '../store/sketchStore';
import { CameraController } from '../engine/CameraController';
import { DrawingEngine } from '../engine/DrawingEngine';
import { ActiveLine } from './ActiveLine';
import { CompletedLines } from './CompletedLines';
import { PointIndicators } from './PointIndicators';

interface Props {
  cameraController: CameraController;
  drawingEngine: DrawingEngine;
  screenSize: { width: number; height: number };
}

export function Scene3D({ cameraController, drawingEngine, screenSize }: Props) {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;

  const lines = useSketchStore((s) => s.lines);
  const currentLine = useSketchStore((s) => s.currentLine);
  const allPoints = useSketchStore((s) => s.allPoints);
  const selectPoint = useSketchStore((s) => s.selectPoint);
  const planePoints = useSketchStore((s) => s.planePoints);
  const setSelectPoint = useSketchStore((s) => s.setSelectPoint);
  const setPlanePoints = useSketchStore((s) => s.setPlanePoints);
  const mode = useSketchStore((s) => s.mode);

  const frameCount = useRef(0);

  useFrame(() => {
    // Apply camera movement every frame
    cameraController.applyToCamera(cam);

    // Update plane snapping every 3 frames to avoid per-frame cost
    frameCount.current++;
    if (frameCount.current % 3 === 0 && mode === 'draw' && selectPoint) {
      const newPlanePoints = drawingEngine.getPlanePoints(allPoints, selectPoint, cam);
      setPlanePoints(newPlanePoints);
    }
  });

  return (
    <>
      <color attach="background" args={[0.29, 0.29, 0.29]} />
      <CompletedLines lines={lines} />
      {currentLine && <ActiveLine points={currentLine} />}
      <PointIndicators planePoints={planePoints} />
    </>
  );
}
