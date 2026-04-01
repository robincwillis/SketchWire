import SceneKit

/// Ports the core 3D math from SketchWire.java.
///
/// | Java                          | Swift                                      |
/// |-------------------------------|--------------------------------------------|
/// | getMouse3D() + getMousePerp() | getDrawPoint(touch:in:selectPoint:)        |
/// | getDepth2()                   | getDepth(point:camera:)                    |
/// | getPlanePoints2()             | getPlanePoints(allPoints:selectPoint:camera:|
/// | getPoint()                    | findNearestPoint(touch:allPoints:in:)      |
struct DrawingEngine {

    // MARK: - Draw point  (replaces getMouse3D + getMousePerp)

    /// Projects a touch onto a plane that is:
    ///   - perpendicular to the camera's look direction
    ///   - passes through `selectPoint` (anchor / world origin)
    ///
    /// This is the Three.js `Raycaster.ray.intersectPlane` equivalent, which
    /// is itself the direct equivalent of the Java trig-based getMousePerp().
    func getDrawPoint(
        touch: CGPoint,
        in view: SCNView,
        selectPoint: SCNVector3
    ) -> SCNVector3? {
        // Unproject touch at near and far depth to form the picking ray
        let near = view.unprojectPoint(SCNVector3(Float(touch.x), Float(touch.y), 0))
        let far  = view.unprojectPoint(SCNVector3(Float(touch.x), Float(touch.y), 1))

        let rayOrigin = near
        let rayDir    = (far - near).normalized

        // Camera look direction (world space): -Z column of world transform
        guard let cam = view.pointOfView else { return nil }
        let fwd = cam.simdWorldFront          // simd_float3, points where cam looks
        let planeNormal = SCNVector3(fwd)

        // Ray–plane intersection: t = (n·(p0 - o)) / (n·d)
        let denom = planeNormal.dot(rayDir)
        guard abs(denom) > 1e-6 else { return nil }   // ray parallel to plane

        let t = planeNormal.dot(selectPoint - rayOrigin) / denom
        return rayOrigin + rayDir * t
    }

    // MARK: - Depth  (replaces getDepth2)

    /// Scalar "depth" of `point` along the camera's look axis.
    /// Matches Java: `aVL * vertDist` (cosine projection onto look vector).
    func getDepth(point: SCNVector3, camera: SCNNode) -> Float {
        let fwd    = camera.simdWorldFront
        let toPoint = point.simd - camera.simdWorldPosition
        return simd_dot(toPoint, fwd)
    }

    // MARK: - Plane points  (replaces getPlanePoints2)

    /// All points within tolerance of `selectPoint`'s depth.
    /// Tolerance scales with camera distance so snapping stays consistent at any zoom.
    func getPlanePoints(
        allPoints: [SCNVector3],
        selectPoint: SCNVector3,
        camera: SCNNode
    ) -> [SCNVector3] {
        let selectDepth = getDepth(point: selectPoint, camera: camera)
        let camDist     = simd_distance(camera.simdWorldPosition, selectPoint.simd)
        let tolerance   = max(1.0, camDist * 0.002)

        return allPoints.filter { p in
            abs(getDepth(point: p, camera: camera) - selectDepth) < tolerance
        }
    }

    // MARK: - Nearest point  (replaces getPoint)

    /// Screen-space proximity search.  20 pt radius (wider than 10 px desktop hit area).
    func findNearestPoint(
        touch: CGPoint,
        allPoints: [SCNVector3],
        in view: SCNView,
        hitRadius: CGFloat = 20
    ) -> SCNVector3? {
        var nearest: SCNVector3?
        var minDist = CGFloat.infinity

        for p in allPoints {
            let s  = view.projectPoint(p)
            let dx = CGFloat(s.x) - touch.x
            let dy = CGFloat(s.y) - touch.y
            let d  = (dx * dx + dy * dy).squareRoot()
            if d < hitRadius && d < minDist {
                minDist = d
                nearest = p
            }
        }
        return nearest
    }
}
