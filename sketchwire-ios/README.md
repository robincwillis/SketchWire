# SketchWire iOS

SwiftUI + SceneKit port of SketchWire for iPhone and iPad.

## Setup in Xcode

1. **New Project** → iOS App, Interface: SwiftUI, Language: Swift, minimum iOS 16
2. Delete the generated `ContentView.swift`
3. Drag the contents of `Sources/` into the project (Copy items if needed)
4. **Frameworks, Libraries** → `+` → add **SceneKit.framework**
5. In `Info.plist` set `UIRequiresFullScreen = YES` for best canvas behaviour on iPad

> The `Package.swift` is provided so editors (Xcode, VSCode + Swift extension) can
> resolve types without a full project. You do **not** need it for the Xcode project.

## Interaction

| Gesture | Action |
|---|---|
| 1 finger drag (Draw mode) | Draw a 3D stroke |
| 2 finger drag (Navigate mode) | Orbit camera |
| 2 finger pinch (Navigate mode) | Zoom in / out |
| **✏️** toolbar button | Switch to Draw mode |
| **✋** toolbar button | Switch to Navigate mode |
| **↩** toolbar button | Undo last stroke |
| **✕** toolbar button | Clear all strokes |

## Architecture

| File | Role |
|---|---|
| `App.swift` | `@main` entry point |
| `ContentView.swift` | Root `ZStack`: canvas + toolbar |
| `SketchSceneView.swift` | `UIViewRepresentable` + `Coordinator` (gestures, scene sync) |
| `DrawingEngine.swift` | 3D math — ports `getMousePerp`, `getDepth2`, `getPlanePoints2` |
| `CameraController.swift` | Spherical-coord orbit/zoom (replaces PeasyCam) |
| `LineBuilder.swift` | Catmull-Rom spline + gradient vertex colors |
| `SketchStore.swift` | `ObservableObject` state |
| `Toolbar.swift` | SwiftUI floating toolbar |
| `DeviceLayout.swift` | iPad vs iPhone responsive breakpoints |
| `SCNVector3+Math.swift` | `SCNVector3` arithmetic & dot-product helpers |

## Algorithm mapping

| Java (SketchWire.java) | Swift |
|---|---|
| `getMouse3D()` + `getMousePerp()` | `DrawingEngine.getDrawPoint()` — `SCNView.unprojectPoint` → ray → `Plane.intersect` |
| `getDepth2()` | `DrawingEngine.getDepth()` — dot product of (point−cam) onto look direction |
| `getPlanePoints2()` | `DrawingEngine.getPlanePoints()` — depth tolerance filter, scales with zoom |
| `getPoint()` | `DrawingEngine.findNearestPoint()` — `SCNView.projectPoint` + screen-space distance |
| PeasyCam | `CameraController` — spherical (theta, phi, radius), `SCNNode.look(at:up:localFront:)` |
| `curveVertex()` | `LineBuilder.catmullRomSample()` — Catmull-Rom formula, 4 subdivisions per segment |
| Color gradient | `LineBuilder.gradientColorSource()` — `SCNGeometrySource` with `.color` semantic |
