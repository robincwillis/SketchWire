import * as THREE from 'three';

/**
 * Ports the core 3D math from SketchWire.java:
 *   getMousePerp()    → getDrawPoint()
 *   getDepth2()       → getDepth()
 *   getPlanePoints2() → getPlanePoints()
 *   getPoint()        → findNearestPoint()
 */
export class DrawingEngine {
  private readonly raycaster = new THREE.Raycaster();
  private readonly drawPlane = new THREE.Plane();

  /**
   * Replaces getMouse3D() + getMousePerp().
   * Projects a touch point (as NDC) onto the plane that is:
   *   - perpendicular to the camera's look direction
   *   - passes through selectPoint (the anchor point / world origin)
   * This is the direct Three.js equivalent of the gluUnProject + trig
   * approach used in the Java source.
   */
  getDrawPoint(
    touchNDC: THREE.Vector2,
    camera: THREE.PerspectiveCamera,
    selectPoint: THREE.Vector3
  ): THREE.Vector3 | null {
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    this.drawPlane.setFromNormalAndCoplanarPoint(cameraDir, selectPoint);
    this.raycaster.setFromCamera(touchNDC, camera);
    const target = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.drawPlane, target);
  }

  /**
   * Replaces getDepth2().
   * Projects a point onto the camera look-at vector to get a scalar depth,
   * matching the Java formula: aVL * vertDist (cosine projection).
   */
  getDepth(point: THREE.Vector3, camera: THREE.PerspectiveCamera): number {
    const lookDir = new THREE.Vector3();
    camera.getWorldDirection(lookDir);
    return point.clone().sub(camera.position).dot(lookDir);
  }

  /**
   * Replaces getPlanePoints2().
   * Returns all points within tolerance of selectPoint's depth.
   * Tolerance scales with camera distance so snapping stays consistent
   * at any zoom level.
   */
  getPlanePoints(
    allPoints: THREE.Vector3[],
    selectPoint: THREE.Vector3,
    camera: THREE.PerspectiveCamera
  ): THREE.Vector3[] {
    const selectDepth = this.getDepth(selectPoint, camera);
    const tolerance = camera.position.distanceTo(selectPoint) * 0.002 + 1;
    return allPoints.filter((p) => {
      const d = this.getDepth(p, camera);
      return Math.abs(d - selectDepth) < tolerance;
    });
  }

  /**
   * Replaces getPoint().
   * Finds the nearest 3D point to a screen-space touch position.
   * Uses 20px radius (wider than the 10px desktop hit area) for comfortable touch.
   */
  findNearestPoint(
    touchScreen: { x: number; y: number },
    allPoints: THREE.Vector3[],
    camera: THREE.PerspectiveCamera,
    screenSize: { width: number; height: number },
    hitRadius = 20
  ): THREE.Vector3 | null {
    const projected = new THREE.Vector3();
    let nearest: THREE.Vector3 | null = null;
    let minDist = Infinity;

    for (const p of allPoints) {
      projected.copy(p).project(camera);
      const sx = (projected.x * 0.5 + 0.5) * screenSize.width;
      const sy = (1 - (projected.y * 0.5 + 0.5)) * screenSize.height;
      const d = Math.hypot(sx - touchScreen.x, sy - touchScreen.y);
      if (d < hitRadius && d < minDist) {
        minDist = d;
        nearest = p;
      }
    }
    return nearest;
  }
}
