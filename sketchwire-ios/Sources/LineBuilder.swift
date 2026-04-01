import SceneKit

/// Builds SceneKit line geometry.
///
/// Completed lines use CatmullRomCurve3-equivalent spline sampling with a
/// per-vertex grayscale gradient matching the Java formula:
///   stroke(100 + 155 - (j * 100 / size) * 1.55)
/// Active (in-progress) lines are drawn solid red.
enum LineBuilder {

    // MARK: - Completed line

    static func buildCompletedLine(points: [SCNVector3]) -> SCNNode? {
        guard points.count >= 2 else { return nil }

        let curve    = catmullRomSample(points, divisions: 4)
        let n        = curve.count
        guard n >= 2 else { return nil }

        var indices = [Int32]()
        indices.reserveCapacity((n - 1) * 2)
        for i in 0 ..< n - 1 {
            indices.append(Int32(i))
            indices.append(Int32(i + 1))
        }

        let posSource = SCNGeometrySource(vertices: curve)
        let colSource = gradientColorSource(count: n)
        let element   = SCNGeometryElement(indices: indices, primitiveType: .line)
        let geometry  = SCNGeometry(sources: [posSource, colSource], elements: [element])

        let mat = SCNMaterial()
        mat.lightingModel = .constant
        geometry.materials = [mat]

        return SCNNode(geometry: geometry)
    }

    // MARK: - Active line

    static func buildActiveLine(points: [SCNVector3]) -> SCNNode? {
        guard points.count >= 2 else { return nil }

        var indices = [Int32]()
        indices.reserveCapacity((points.count - 1) * 2)
        for i in 0 ..< points.count - 1 {
            indices.append(Int32(i))
            indices.append(Int32(i + 1))
        }

        let posSource = SCNGeometrySource(vertices: points)
        let element   = SCNGeometryElement(indices: indices, primitiveType: .line)
        let geometry  = SCNGeometry(sources: [posSource], elements: [element])

        let mat = SCNMaterial()
        mat.lightingModel = .constant
        mat.diffuse.contents = UIColor.red
        geometry.materials = [mat]

        return SCNNode(geometry: geometry)
    }

    // MARK: - Catmull-Rom sampling

    /// Equivalent of Three.js CatmullRomCurve3.getPoints().
    private static func catmullRomSample(
        _ pts: [SCNVector3],
        divisions: Int
    ) -> [SCNVector3] {
        guard pts.count >= 2 else { return pts }

        // Extend the control points at both ends (matches Three.js CatmullRom behavior)
        var cp = pts
        cp.insert(pts.first!, at: 0)
        cp.append(pts.last!)

        var result = [SCNVector3]()
        result.reserveCapacity((cp.count - 3) * divisions + 1)

        for i in 1 ..< cp.count - 2 {
            let p0 = cp[i - 1], p1 = cp[i], p2 = cp[i + 1], p3 = cp[i + 2]
            let steps = (i == cp.count - 3) ? divisions + 1 : divisions
            for j in 0 ..< steps {
                let t  = Float(j) / Float(divisions)
                result.append(catmullRom(p0: p0, p1: p1, p2: p2, p3: p3, t: t))
            }
        }
        return result
    }

    /// Catmull-Rom interpolation formula.
    private static func catmullRom(
        p0: SCNVector3, p1: SCNVector3, p2: SCNVector3, p3: SCNVector3,
        t: Float
    ) -> SCNVector3 {
        let t2 = t * t, t3 = t2 * t
        func cr(_ a: Float, _ b: Float, _ c: Float, _ d: Float) -> Float {
            0.5 * ((2 * b) + (-a + c) * t + (2*a - 5*b + 4*c - d) * t2 + (-a + 3*b - 3*c + d) * t3)
        }
        return SCNVector3(
            cr(p0.x, p1.x, p2.x, p3.x),
            cr(p0.y, p1.y, p2.y, p3.y),
            cr(p0.z, p1.z, p2.z, p3.z)
        )
    }

    // MARK: - Gradient color source

    /// Per-vertex grayscale gradient:
    /// Java: stroke(100 + 155 - (j * 100 / size) * 1.55)  →  1.0 … 0.39
    private static func gradientColorSource(count: Int) -> SCNGeometrySource {
        var floats = [Float]()
        floats.reserveCapacity(count * 4)
        for i in 0 ..< count {
            let t = Float(i) / Float(max(count - 1, 1))
            let b = (255 - t * 155) / 255   // bright → dimmer
            floats += [b, b, b, 1.0]
        }
        let data = floats.withUnsafeBytes { Data($0) }
        return SCNGeometrySource(
            data: data,
            semantic: .color,
            vectorCount: count,
            usesFloatComponents: true,
            componentsPerVector: 4,
            bytesPerComponent: MemoryLayout<Float>.size,
            dataOffset: 0,
            dataStride: MemoryLayout<Float>.size * 4
        )
    }
}
