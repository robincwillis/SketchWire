// swift-tools-version: 5.9
// This Package.swift lets editors resolve types and run swift-syntax checks.
// To run on a device, open Xcode → File → New Project → iOS App (SwiftUI),
// then drag Sources/ into the project and delete the generated ContentView.
import PackageDescription

let package = Package(
    name: "SketchWireIOS",
    platforms: [.iOS(.v16)],
    targets: [
        .target(
            name: "SketchWireIOS",
            path: "Sources"
        )
    ]
)
