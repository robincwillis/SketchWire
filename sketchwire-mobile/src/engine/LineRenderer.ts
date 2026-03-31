import * as THREE from 'three';

const ACTIVE_LINE_MATERIAL = new THREE.LineBasicMaterial({ color: 0xff0000 });

/**
 * Builds a completed line mesh using CatmullRomCurve3 (direct equivalent of
 * Processing's curveVertex()) with a per-vertex gradient matching the Java:
 *   stroke(100 + 155 - (j * 100 / size) * 1.55)
 * i.e. brightness fades from ~255 at the start to ~100 at the end.
 */
export function buildCompletedLineMesh(points: THREE.Vector3[]): THREE.Line | null {
  if (points.length < 2) return null;

  const curve = new THREE.CatmullRomCurve3(points);
  const divisions = Math.max(50, points.length * 4);
  const curvePoints = curve.getPoints(divisions);

  const colors: number[] = [];
  for (let i = 0; i < curvePoints.length; i++) {
    const t = i / (curvePoints.length - 1);
    const brightness = (255 - t * 155) / 255;
    colors.push(brightness, brightness, brightness);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({ vertexColors: true });
  return new THREE.Line(geometry, material);
}

/**
 * Builds or updates the active (in-progress) line geometry.
 * Reuses the same geometry object to avoid per-frame allocations.
 */
export function updateActiveLineGeometry(
  geometry: THREE.BufferGeometry,
  points: THREE.Vector3[]
) {
  geometry.setFromPoints(points.length >= 2 ? points : []);
}

export { ACTIVE_LINE_MATERIAL };
