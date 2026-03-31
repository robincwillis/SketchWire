import * as THREE from 'three';

export type AppMode = 'draw' | 'navigate';

export interface Line3D {
  id: string;
  points: THREE.Vector3[];
}

export interface SketchState {
  mode: AppMode;
  lines: Line3D[];
  currentLine: THREE.Vector3[] | null;
  allPoints: THREE.Vector3[];
  selectPoint: THREE.Vector3 | null;
  planePoints: THREE.Vector3[];
}
