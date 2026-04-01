import SwiftUI

/// Floating toolbar for mode toggle, undo, and clear.
/// Positioned by ContentView's `.overlay(alignment:)` — contains only its
/// own visible content so it never intercepts touches outside the buttons.
struct Toolbar: View {
    @ObservedObject var store: SketchStore
    let layout: DeviceLayout

    var body: some View {
        let pad: CGFloat = layout.toolbarOnLeft ? 20 : 32

        Group {
            if layout.toolbarOnLeft {
                VStack(spacing: 12) { buttons }
            } else {
                HStack(spacing: 12) { buttons }
            }
        }
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .padding(layout.toolbarOnLeft ? .leading : .horizontal, pad)
        .padding(.bottom, 40)
    }

    @ViewBuilder
    private var buttons: some View {
        ToolButton(icon: "pencil",               label: "Draw",
                   active: store.mode == .draw,    size: layout.buttonSize) { store.setMode(.draw) }
        ToolButton(icon: "hand.raised",           label: "Navigate",
                   active: store.mode == .navigate, size: layout.buttonSize) { store.setMode(.navigate) }
        ToolButton(icon: "arrow.uturn.backward",  label: "Undo",
                   disabled: store.lines.isEmpty,   size: layout.buttonSize) { store.undo() }
        ToolButton(icon: "xmark",                 label: "Clear",
                   disabled: store.lines.isEmpty,   size: layout.buttonSize) { store.clear() }
    }
}

// MARK: - ToolButton

private struct ToolButton: View {
    let icon:     String
    let label:    String
    var active:   Bool = false
    var disabled: Bool = false
    let size:     CGFloat
    let action:   () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: size * 0.38, weight: .semibold))
                .frame(width: size, height: size)
                .foregroundStyle(active ? Color.white : Color.white.opacity(disabled ? 0.3 : 0.85))
                .background(
                    active ? Color.blue.opacity(0.85) : Color.white.opacity(0.12),
                    in: RoundedRectangle(cornerRadius: size * 0.25)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: size * 0.25)
                        .strokeBorder(Color.white.opacity(0.18), lineWidth: 1)
                )
        }
        .disabled(disabled)
        .accessibilityLabel(label)
    }
}
