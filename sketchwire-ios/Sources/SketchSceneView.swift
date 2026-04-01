import SwiftUI
import SceneKit

// MARK: - UIViewRepresentable

struct SketchSceneView: UIViewRepresentable {
    @ObservedObject var store: SketchStore
    let layout: DeviceLayout

    func makeCoordinator() -> Coordinator {
        Coordinator(store: store, layout: layout)
    }

    func makeUIView(context: Context) -> SCNView {
        let view = SCNView()
        let c    = context.coordinator

        view.scene               = c.scene
        view.pointOfView         = c.cameraNode
        view.backgroundColor     = UIColor(white: 0.294, alpha: 1)   // Processing background(75)
        view.allowsCameraControl = false
        view.autoenablesDefaultLighting = false
        view.rendersContinuously = true
        view.antialiasingMode    = .multisampling4X

        // Single-finger pan → draw
        let drawPan = UIPanGestureRecognizer(
            target: c, action: #selector(Coordinator.handleDrawPan(_:))
        )
        drawPan.maximumNumberOfTouches = 1
        drawPan.delegate = c
        view.addGestureRecognizer(drawPan)

        // Two-finger pan → orbit
        let orbitPan = UIPanGestureRecognizer(
            target: c, action: #selector(Coordinator.handleOrbitPan(_:))
        )
        orbitPan.minimumNumberOfTouches = 2
        orbitPan.maximumNumberOfTouches = 2
        orbitPan.delegate = c
        view.addGestureRecognizer(orbitPan)

        // Pinch → zoom
        let pinch = UIPinchGestureRecognizer(
            target: c, action: #selector(Coordinator.handlePinch(_:))
        )
        pinch.delegate = c
        view.addGestureRecognizer(pinch)

        c.scnView = view
        return view
    }

    func updateUIView(_ uiView: SCNView, context: Context) {
        context.coordinator.store  = store
        context.coordinator.layout = layout
        context.coordinator.syncScene()  // handles undo/clear triggered from toolbar
    }
}

// MARK: - Coordinator

extension SketchSceneView {
    final class Coordinator: NSObject, UIGestureRecognizerDelegate {

        // MARK: Dependencies
        var store:  SketchStore
        var layout: DeviceLayout
        weak var scnView: SCNView?

        // MARK: Scene graph
        let scene      = SCNScene()
        let cameraNode = SCNNode()
        let linesNode  = SCNNode()          // container for completed line nodes

        // MARK: Engines
        let drawingEngine    = DrawingEngine()
        let cameraController = CameraController()

        // MARK: Scene tracking
        var activeLineNode:  SCNNode?
        var renderedLineIds: [UUID: SCNNode] = [:]  // id → completed-line node

        // MARK: Gesture state
        var prevOrbitTouch: CGPoint = .zero
        var prevPinchScale: CGFloat = 1

        // MARK: Init

        init(store: SketchStore, layout: DeviceLayout) {
            self.store  = store
            self.layout = layout
            super.init()
            setupScene()
        }

        // MARK: - Scene setup

        private func setupScene() {
            let camera     = SCNCamera()
            camera.fieldOfView = 45
            camera.zNear   = 1
            camera.zFar    = 20_000
            cameraNode.camera = camera
            cameraNode.name   = "camera"
            scene.rootNode.addChildNode(cameraNode)
            scene.rootNode.addChildNode(linesNode)
            cameraController.applyToCamera(cameraNode)
        }

        // MARK: - Scene sync (called after any store mutation)

        func syncScene() {
            cameraController.applyToCamera(cameraNode)

            let storeIds = Set(store.lines.map { $0.id })

            // Add newly completed lines
            for line in store.lines where renderedLineIds[line.id] == nil {
                if let node = LineBuilder.buildCompletedLine(points: line.points) {
                    node.name = line.id.uuidString
                    linesNode.addChildNode(node)
                    renderedLineIds[line.id] = node
                }
            }

            // Remove undone/cleared lines
            let toRemove = renderedLineIds.keys.filter { !storeIds.contains($0) }
            for id in toRemove {
                renderedLineIds[id]?.removeFromParentNode()
                renderedLineIds.removeValue(forKey: id)
            }

            // Rebuild active line
            activeLineNode?.removeFromParentNode()
            activeLineNode = nil
            if let pts = store.currentLine, pts.count >= 2 {
                activeLineNode = LineBuilder.buildActiveLine(points: pts)
                activeLineNode.map { scene.rootNode.addChildNode($0) }
            }
        }

        // MARK: - Gesture: draw  (single finger)

        @objc func handleDrawPan(_ g: UIPanGestureRecognizer) {
            guard store.mode == .draw, let view = scnView else { return }
            let touch = g.location(in: view)

            switch g.state {
            case .began:
                // Snap anchor to nearest existing point if within hit radius
                if let nearest = drawingEngine.findNearestPoint(
                    touch: touch, allPoints: store.allPoints, in: view,
                    hitRadius: layout.touchRadius
                ) {
                    store.selectPoint = nearest
                }
                if let pt = drawingEngine.getDrawPoint(
                    touch: touch, in: view, selectPoint: store.selectPoint
                ) {
                    store.startLine(at: pt)
                }

            case .changed:
                if let pt = drawingEngine.getDrawPoint(
                    touch: touch, in: view, selectPoint: store.selectPoint
                ) {
                    store.addPoint(pt)
                    syncScene()  // update active line immediately (no SwiftUI re-render needed)
                }

            case .ended, .cancelled:
                store.finishLine()
                syncScene()

            default:
                break
            }
        }

        // MARK: - Gesture: orbit  (two-finger pan)

        @objc func handleOrbitPan(_ g: UIPanGestureRecognizer) {
            guard store.mode == .navigate else { return }

            switch g.state {
            case .began:
                prevOrbitTouch = g.location(in: scnView)
            case .changed:
                let cur = g.location(in: scnView)
                cameraController.orbit(
                    deltaX: Float(cur.x - prevOrbitTouch.x),
                    deltaY: Float(cur.y - prevOrbitTouch.y)
                )
                prevOrbitTouch = cur
                cameraController.applyToCamera(cameraNode)
            default:
                break
            }
        }

        // MARK: - Gesture: zoom  (pinch)

        @objc func handlePinch(_ g: UIPinchGestureRecognizer) {
            guard store.mode == .navigate else { return }

            switch g.state {
            case .began:
                prevPinchScale = g.scale
            case .changed:
                let delta = Float(g.scale / prevPinchScale)
                prevPinchScale = g.scale
                cameraController.zoom(scale: delta)
                cameraController.applyToCamera(cameraNode)
            default:
                break
            }
        }

        // MARK: - UIGestureRecognizerDelegate

        func gestureRecognizer(
            _ gr: UIGestureRecognizer,
            shouldRecognizeSimultaneouslyWith other: UIGestureRecognizer
        ) -> Bool { true }
    }
}
