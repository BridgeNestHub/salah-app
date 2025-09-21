# Qibla Compass Implementation Guide for iOS

## How Qibla Compass Works

### Core Functionality
1. **GPS Location** → **Qibla Calculation** → **Device Orientation** → **Visual Compass**
2. Uses spherical trigonometry to calculate bearing to Kaaba
3. Combines GPS coordinates with device compass/gyroscope
4. Displays visual compass with Kaaba direction indicator

## Mathematical Foundation

### Kaaba Coordinates (Precise)
```swift
let KAABA_LATITUDE = 21.4224779
let KAABA_LONGITUDE = 39.8251832
```

### Qibla Calculation Formula
```swift
func calculateQiblaDirection(from userLocation: CLLocationCoordinate2D) -> Double {
    let lat1 = userLocation.latitude.toRadians()
    let lng1 = userLocation.longitude.toRadians()
    let lat2 = KAABA_LATITUDE.toRadians()
    let lng2 = KAABA_LONGITUDE.toRadians()
    
    let dLng = lng2 - lng1
    
    // Spherical trigonometry calculation
    let y = sin(dLng) * cos(lat2)
    let x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLng)
    
    let bearing = atan2(y, x).toDegrees()
    return (bearing + 360).truncatingRemainder(dividingBy: 360) // Normalize to 0-360
}

func calculateDistanceToKaaba(from userLocation: CLLocationCoordinate2D) -> Double {
    let R = 3959.0 // Earth's radius in miles
    let lat1 = userLocation.latitude.toRadians()
    let lng1 = userLocation.longitude.toRadians()
    let lat2 = KAABA_LATITUDE.toRadians()
    let lng2 = KAABA_LONGITUDE.toRadians()
    
    let dLat = lat2 - lat1
    let dLng = lng2 - lng1
    
    let a = sin(dLat/2) * sin(dLat/2) + cos(lat1) * cos(lat2) * sin(dLng/2) * sin(dLng/2)
    let c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c // Distance in miles
}
```

## iOS Implementation

### Required Frameworks
```swift
import CoreLocation
import CoreMotion
import SwiftUI
```

### Location Manager Setup
```swift
class QiblaLocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    
    @Published var userLocation: CLLocationCoordinate2D?
    @Published var qiblaDirection: Double = 0
    @Published var distanceToKaaba: Double = 0
    @Published var locationAccuracy: Double = 0
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startLocationUpdates() {
        guard authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways else {
            return
        }
        locationManager.startUpdatingLocation()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        userLocation = location.coordinate
        locationAccuracy = location.horizontalAccuracy
        qiblaDirection = calculateQiblaDirection(from: location.coordinate)
        distanceToKaaba = calculateDistanceToKaaba(from: location.coordinate)
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        authorizationStatus = status
        if status == .authorizedWhenInUse || status == .authorizedAlways {
            startLocationUpdates()
        }
    }
}
```

### Motion Manager for Compass
```swift
class QiblaMotionManager: ObservableObject {
    private let motionManager = CMMotionManager()
    private let locationManager = CMLocationManager()
    
    @Published var deviceHeading: Double = 0
    @Published var isCompassCalibrated: Bool = false
    @Published var compassAccuracy: CMCalibratedMagneticFieldAccuracy = .uncalibrated
    
    private var headingHistory: [Double] = []
    
    func startCompassUpdates() {
        // Check if device motion is available
        guard motionManager.isDeviceMotionAvailable else {
            print("Device motion not available")
            return
        }
        
        // Start device motion updates for compass
        motionManager.deviceMotionUpdateInterval = 0.1
        motionManager.startDeviceMotionUpdates(using: .xMagneticNorthZVertical, to: .main) { [weak self] motion, error in
            guard let motion = motion, error == nil else { return }
            
            let heading = motion.attitude.yaw * 180 / .pi
            let normalizedHeading = (heading + 360).truncatingRemainder(dividingBy: 360)
            
            self?.updateDeviceHeading(normalizedHeading)
        }
        
        // Also use Core Location for magnetic heading (more accurate)
        if CLLocationManager.headingAvailable() {
            locationManager.startUpdatingHeading()
        }
    }
    
    private func updateDeviceHeading(_ newHeading: Double) {
        // Smooth heading using moving average
        headingHistory.append(newHeading)
        if headingHistory.count > 5 {
            headingHistory.removeFirst()
        }
        
        // Calculate circular average for compass headings
        let avgHeading = calculateCircularAverage(headingHistory)
        
        DispatchQueue.main.async {
            self.deviceHeading = avgHeading
            self.isCompassCalibrated = self.headingHistory.count >= 3
        }
    }
    
    private func calculateCircularAverage(_ headings: [Double]) -> Double {
        let radians = headings.map { $0.toRadians() }
        let sumSin = radians.reduce(0) { $0 + sin($1) }
        let sumCos = radians.reduce(0) { $0 + cos($1) }
        
        let avgRadians = atan2(sumSin / Double(headings.count), sumCos / Double(headings.count))
        return (avgRadians.toDegrees() + 360).truncatingRemainder(dividingBy: 360)
    }
}

extension QiblaMotionManager: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        guard newHeading.headingAccuracy >= 0 else { return }
        
        compassAccuracy = newHeading.magneticHeading >= 0 ? .high : .low
        updateDeviceHeading(newHeading.magneticHeading)
    }
}
```

### SwiftUI Compass View
```swift
struct QiblaCompassView: View {
    @StateObject private var locationManager = QiblaLocationManager()
    @StateObject private var motionManager = QiblaMotionManager()
    
    @State private var isLoading = true
    @State private var showPermissionAlert = false
    
    var qiblaRotation: Double {
        return locationManager.qiblaDirection - motionManager.deviceHeading
    }
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.black.opacity(0.8), Color.blue.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            if isLoading {
                LoadingView()
            } else {
                VStack(spacing: 30) {
                    // Status indicator
                    StatusView(
                        isCompassCalibrated: motionManager.isCompassCalibrated,
                        locationAccuracy: locationManager.locationAccuracy
                    )
                    
                    // Main compass
                    CompassView(qiblaRotation: qiblaRotation)
                        .frame(width: 300, height: 300)
                    
                    // Information cards
                    InfoCardsView(
                        qiblaDirection: locationManager.qiblaDirection,
                        distance: locationManager.distanceToKaaba,
                        userLocation: locationManager.userLocation
                    )
                    
                    // Instructions
                    InstructionsView(isCompassCalibrated: motionManager.isCompassCalibrated)
                }
                .padding()
            }
        }
        .onAppear {
            setupQiblaCompass()
        }
        .alert("Location Permission Required", isPresented: $showPermissionAlert) {
            Button("Settings") {
                openAppSettings()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("Please enable location access in Settings to use the Qibla compass.")
        }
    }
    
    private func setupQiblaCompass() {
        locationManager.startLocationUpdates()
        motionManager.startCompassUpdates()
        
        // Check location permission
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            if locationManager.authorizationStatus == .denied {
                showPermissionAlert = true
            }
            isLoading = false
        }
    }
}
```

### Compass Visual Components
```swift
struct CompassView: View {
    let qiblaRotation: Double
    
    var body: some View {
        ZStack {
            // Compass circle with gradient
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color.blue.opacity(0.1), Color.black.opacity(0.3)],
                        center: .center,
                        startRadius: 50,
                        endRadius: 150
                    )
                )
                .stroke(Color.yellow.opacity(0.6), lineWidth: 3)
            
            // Degree markings
            ForEach(0..<72) { index in
                let angle = Double(index) * 5
                let isMajor = angle.truncatingRemainder(dividingBy: 30) == 0
                let isCardinal = angle.truncatingRemainder(dividingBy: 90) == 0
                
                Rectangle()
                    .fill(isCardinal ? Color.yellow : Color.white.opacity(isMajor ? 0.8 : 0.6))
                    .frame(
                        width: isCardinal ? 4 : (isMajor ? 2 : 1),
                        height: isCardinal ? 30 : (isMajor ? 20 : 15)
                    )
                    .offset(y: -140)
                    .rotationEffect(.degrees(angle))
            }
            
            // Cardinal directions
            VStack {
                Text("N").font(.title).fontWeight(.bold).foregroundColor(.yellow)
                Spacer()
                Text("S").font(.title).fontWeight(.bold).foregroundColor(.yellow)
            }
            .frame(height: 260)
            
            HStack {
                Text("W").font(.title).fontWeight(.bold).foregroundColor(.yellow)
                Spacer()
                Text("E").font(.title).fontWeight(.bold).foregroundColor(.yellow)
            }
            .frame(width: 260)
            
            // Qibla needle
            QiblaNeedle()
                .rotationEffect(.degrees(qiblaRotation))
                .animation(.easeInOut(duration: 0.3), value: qiblaRotation)
            
            // Center point
            Circle()
                .fill(Color.yellow)
                .frame(width: 12, height: 12)
                .overlay(
                    Circle()
                        .stroke(Color.white, lineWidth: 2)
                )
        }
    }
}

struct QiblaNeedle: View {
    var body: some View {
        VStack(spacing: 0) {
            // Kaaba icon at tip
            Text("🕋")
                .font(.title)
                .shadow(color: .black, radius: 2)
            
            // Needle line
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [Color.yellow, Color.orange],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: 3, height: 120)
                .shadow(color: .yellow.opacity(0.8), radius: 4)
        }
        .offset(y: -60)
    }
}
```

### Information Display Components
```swift
struct InfoCardsView: View {
    let qiblaDirection: Double
    let distance: Double
    let userLocation: CLLocationCoordinate2D?
    
    var body: some View {
        VStack(spacing: 15) {
            InfoCard(
                icon: "🧭",
                title: "Qibla Direction",
                value: "\(Int(qiblaDirection))° \(getDirectionText(qiblaDirection))"
            )
            
            InfoCard(
                icon: "📏",
                title: "Distance to Kaaba",
                value: formatDistance(distance)
            )
            
            if let location = userLocation {
                InfoCard(
                    icon: "📍",
                    title: "Your Location",
                    value: "\(location.latitude.formatted(.number.precision(.fractionLength(4))))°, \(location.longitude.formatted(.number.precision(.fractionLength(4))))°"
                )
            }
        }
    }
    
    private func getDirectionText(_ bearing: Double) -> String {
        let directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                         "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        let index = Int((bearing + 11.25) / 22.5) % 16
        return directions[index]
    }
    
    private func formatDistance(_ distance: Double) -> String {
        if distance < 1000 {
            return "\(Int(distance)) miles"
        } else {
            return String(format: "%.1fK miles", distance / 1000)
        }
    }
}

struct InfoCard: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(icon)
                .font(.title2)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(value)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
            }
            
            Spacer()
        }
        .padding()
        .background(Color.black.opacity(0.3))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.yellow.opacity(0.3), lineWidth: 1)
        )
    }
}
```

### Utility Extensions
```swift
extension Double {
    func toRadians() -> Double {
        return self * .pi / 180
    }
    
    func toDegrees() -> Double {
        return self * 180 / .pi
    }
}

extension CLLocationCoordinate2D {
    var isValid: Bool {
        return CLLocationCoordinate2DIsValid(self)
    }
}
```

## Permission Handling

### Location Permission
```swift
func requestLocationPermission() {
    switch locationManager.authorizationStatus {
    case .notDetermined:
        locationManager.requestWhenInUseAuthorization()
    case .denied, .restricted:
        showPermissionAlert = true
    case .authorizedWhenInUse, .authorizedAlways:
        startLocationUpdates()
    @unknown default:
        break
    }
}

private func openAppSettings() {
    if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
        UIApplication.shared.open(settingsUrl)
    }
}
```

### Motion Permission (iOS 13+)
```swift
func requestMotionPermission() {
    if #available(iOS 13.0, *) {
        CMMotionActivityManager().queryActivityStarting(from: Date(), to: Date(), to: .main) { _, error in
            if error == nil {
                // Permission granted
                self.startCompassUpdates()
            } else {
                // Permission denied
                self.showMotionPermissionAlert = true
            }
        }
    } else {
        startCompassUpdates()
    }
}
```

## Error Handling & Fallbacks

### Common Issues
1. **Location denied**: Show manual coordinate entry
2. **Compass unavailable**: Use manual direction input
3. **Poor GPS accuracy**: Show accuracy warning
4. **Magnetic interference**: Display calibration instructions

### Fallback Implementation
```swift
struct ManualQiblaView: View {
    @State private var manualLatitude: String = ""
    @State private var manualLongitude: String = ""
    @State private var calculatedDirection: Double = 0
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Manual Qibla Calculator")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 15) {
                TextField("Latitude", text: $manualLatitude)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.decimalPad)
                
                TextField("Longitude", text: $manualLongitude)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.decimalPad)
                
                Button("Calculate Qibla") {
                    calculateManualQibla()
                }
                .buttonStyle(.borderedProminent)
            }
            
            if calculatedDirection > 0 {
                Text("Qibla Direction: \(Int(calculatedDirection))°")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.green)
            }
        }
        .padding()
    }
    
    private func calculateManualQibla() {
        guard let lat = Double(manualLatitude),
              let lng = Double(manualLongitude) else { return }
        
        let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lng)
        calculatedDirection = calculateQiblaDirection(from: coordinate)
    }
}
```

## Testing Requirements

### Unit Tests
- [ ] Qibla direction calculation accuracy
- [ ] Distance calculation accuracy
- [ ] Coordinate validation
- [ ] Circular averaging for compass smoothing

### Integration Tests
- [ ] Location permission handling
- [ ] Motion sensor integration
- [ ] Compass calibration detection
- [ ] Error state handling

### UI Tests
- [ ] Compass rotation animation
- [ ] Permission alert flows
- [ ] Manual mode fallback
- [ ] Information display accuracy

This implementation guide provides everything needed to build a precise Qibla compass for iOS that matches the web application's functionality while leveraging native iOS location and motion capabilities.