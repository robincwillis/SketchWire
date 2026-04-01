import SwiftUI

struct ContentView: View {
    @StateObject private var store = SketchStore()

    var body: some View {
        GeometryReader { geo in
            let layout = DeviceLayout(screenSize: geo.size)
            // Using .overlay so only the toolbar buttons' actual area is hit-testable.
            // The transparent regions of the toolbar never block touches on the canvas.
            SketchSceneView(store: store, layout: layout)
                .ignoresSafeArea()
                .overlay(alignment: layout.toolbarOnLeft ? .bottomLeading : .bottom) {
                    Toolbar(store: store, layout: layout)
                }
        }
        .ignoresSafeArea()
        .preferredColorScheme(.dark)
    }
}
