import SceneKit

// MARK: - Arithmetic

extension SCNVector3 {
    static func + (lhs: SCNVector3, rhs: SCNVector3) -> SCNVector3 {
        SCNVector3(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z)
    }

    static func - (lhs: SCNVector3, rhs: SCNVector3) -> SCNVector3 {
        SCNVector3(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z)
    }

    static func * (lhs: SCNVector3, rhs: Float) -> SCNVector3 {
        SCNVector3(lhs.x * rhs, lhs.y * rhs, lhs.z * rhs)
    }

    // MARK: - Vector math

    func dot(_ other: SCNVector3) -> Float {
        x * other.x + y * other.y + z * other.z
    }

    var lengthSquared: Float { x * x + y * y + z * z }

    var length: Float { lengthSquared.squareRoot() }

    var normalized: SCNVector3 {
        let l = length
        return l > 0 ? self * (1 / l) : SCNVector3(0, 0, 0)
    }

    // MARK: - SIMD interop

    var simd: SIMD3<Float> { SIMD3(x, y, z) }

    init(_ v: SIMD3<Float>) { self.init(v.x, v.y, v.z) }
}
