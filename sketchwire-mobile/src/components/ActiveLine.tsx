import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ACTIVE_LINE_MATERIAL, updateActiveLineGeometry } from '../engine/LineRenderer';

interface Props {
  points: THREE.Vector3[];
}

export function ActiveLine({ points }: Props) {
  const geometryRef = useRef(new THREE.BufferGeometry());
  const lineRef = useRef<THREE.Line>(null);

  useEffect(() => {
    updateActiveLineGeometry(geometryRef.current, points);
  }, [points]);

  if (points.length < 2) return null;

  return (
    <primitive
      object={new THREE.Line(geometryRef.current, ACTIVE_LINE_MATERIAL)}
      ref={lineRef}
    />
  );
}
