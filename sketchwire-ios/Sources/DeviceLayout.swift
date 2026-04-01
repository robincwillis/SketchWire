import UIKit

struct DeviceLayout {
    let screenSize: CGSize

    /// iPad or wide screen
    var isTablet: Bool { screenSize.width >= 768 }

    var isLandscape: Bool { screenSize.width > screenSize.height }

    /// Touch hit radius for point snapping (px). Larger on tablet.
    var touchRadius: CGFloat { isTablet ? 28 : 20 }

    /// Toolbar button side length (pt).
    var buttonSize: CGFloat { isTablet ? 56 : 48 }

    /// Toolbar floats on the left edge (tablet) or bottom center (phone).
    var toolbarOnLeft: Bool { isTablet }
}
