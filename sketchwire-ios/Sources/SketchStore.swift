import Foundation
import SceneKit

enum AppMode { case draw, navigate }

struct Line3D: Identifiable {
    let id = UUID()
    var points: [SCNVector3]
}

final class SketchStore: ObservableObject {
    @Published var mode: AppMode = .draw
    @Published var lines: [Line3D] = []

    /// Points currently being drawn (not yet committed). Not @Published
    /// so we can update it at gesture-handler frequency without re-rendering SwiftUI.
    private(set) var currentLine: [SCNVector3]?

    /// All points from completed lines — used for plane-snapping search.
    private(set) var allPoints: [SCNVector3] = []

    /// Anchor point whose depth defines the current draw plane.
    var selectPoint: SCNVector3 = SCNVector3(0, 0, 0)

    // MARK: - Mutations called from UIKit gesture handlers (always on main thread)

    func startLine(at point: SCNVector3) {
        currentLine = [point]
        allPoints.append(point)
    }

    func addPoint(_ point: SCNVector3) {
        currentLine?.append(point)
        allPoints.append(point)
    }

    func finishLine() {
        defer { currentLine = nil }
        guard let pts = currentLine, pts.count >= 2 else { return }
        // Publish only on finish so SwiftUI doesn't re-render every addPoint call.
        lines.append(Line3D(points: pts))
    }

    func undo() {
        guard !lines.isEmpty else { return }
        lines.removeLast()
        allPoints = lines.flatMap { $0.points }
    }

    func clear() {
        lines = []
        currentLine = nil
        allPoints = []
        selectPoint = SCNVector3(0, 0, 0)
    }

    func setMode(_ mode: AppMode) {
        self.mode = mode
    }
}
