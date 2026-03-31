import * as THREE from 'three';

/**
 * Replaces PeasyCam with a spherical-coordinate orbit controller.
 * Java: cam = new PeasyCam(this, 1000) with min=10, max=10000
 */
export class CameraController {
  theta = 0;
  phi = Math.PI / 4;
  radius = 1000;
  target = new THREE.Vector3(0, 0, 0);

  private readonly MIN_RADIUS = 10;
  private readonly MAX_RADIUS = 10000;
  private readonly MIN_PHI = 0.1;
  private readonly MAX_PHI = Math.PI - 0.1;

  /** Two-finger pan delta → orbit. Replaces Space+drag (PeasyCam). */
  orbit(deltaX: number, deltaY: number, sensitivity = 0.005) {
    this.theta -= deltaX * sensitivity;
    this.phi = THREE.MathUtils.clamp(
      this.phi - deltaY * sensitivity,
      this.MIN_PHI,
      this.MAX_PHI
    );
  }

  /** Pinch scale factor → zoom. Replaces R/F keys. */
  zoom(scaleDelta: number) {
    this.radius = THREE.MathUtils.clamp(
      this.radius / scaleDelta,
      this.MIN_RADIUS,
      this.MAX_RADIUS
    );
  }

  /** Apply current state to the Three.js camera each frame. */
  applyToCamera(camera: THREE.PerspectiveCamera) {
    camera.position.setFromSphericalCoords(this.radius, this.phi, this.theta);
    camera.position.add(this.target);
    camera.lookAt(this.target);
  }
}
