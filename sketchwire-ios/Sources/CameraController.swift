import SceneKit

/// Spherical-coordinate orbit controller.
/// Replaces PeasyCam: initial distance 1000, min 10, max 10 000.
final class CameraController {
    var theta: Float = 0             // horizontal angle
    var phi: Float = .pi / 4         // vertical angle (0 = top, π = bottom)
    var radius: Float = 1000         // distance from target
    var target = SCNVector3(0, 0, 0) // look-at target (world origin)

    private let minRadius: Float = 10
    private let maxRadius: Float = 10_000
    private let minPhi: Float = 0.05
    private let maxPhi: Float = .pi - 0.05

    // MARK: - Controls

    /// Two-finger pan delta → orbit.  Replaces PeasyCam Space+drag.
    func orbit(deltaX: Float, deltaY: Float, sensitivity: Float = 0.005) {
        theta -= deltaX * sensitivity
        phi   = phi - deltaY * sensitivity
        phi   = min(maxPhi, max(minPhi, phi))
    }

    /// Pinch scale factor → zoom.  Replaces R/F keys.
    func zoom(scale: Float) {
        guard scale > 0 else { return }
        radius = min(maxRadius, max(minRadius, radius / scale))
    }

    // MARK: - Apply

    func applyToCamera(_ node: SCNNode) {
        let sinPhi = sinf(phi)
        let x = target.x + radius * sinPhi * sinf(theta)
        let y = target.y + radius * cosf(phi)
        let z = target.z + radius * sinPhi * cosf(theta)
        node.position = SCNVector3(x, y, z)
        node.look(at: target, up: SCNVector3(0, 1, 0), localFront: SCNVector3(0, 0, -1))
    }
}
