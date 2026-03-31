import React from 'react';
import * as THREE from 'three';

const FOCUS_SPHERE = new THREE.SphereGeometry(10, 5, 5);
const PLANE_SPHERE = new THREE.SphereGeometry(5, 5, 5);
const FOCUS_MAT = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const PLANE_MAT = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

interface Props {
  focusPoint?: THREE.Vector3 | null;
  planePoints: THREE.Vector3[];
}

export function PointIndicators({ focusPoint, planePoints }: Props) {
  return (
    <>
      {focusPoint && (
        <mesh
          geometry={FOCUS_SPHERE}
          material={FOCUS_MAT}
          position={focusPoint}
        />
      )}
      {planePoints.map((p, i) => (
        <mesh
          key={i}
          geometry={PLANE_SPHERE}
          material={PLANE_MAT}
          position={p}
        />
      ))}
    </>
  );
}
