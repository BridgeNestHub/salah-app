# Mosque Locator Implementation Guide for iOS

## How Mosque Locator Works

### Core Functionality
1. **GPS Location** → **Google Places API** → **Nearby Search** → **Display Results** → **Navigation**
2. Uses Google Places API for real-time mosque data
3. Calculates distances and provides directions
4. Supports radius-based search with customizable range
5. Integrates with device maps for navigation

## Data Sources & APIs

### Google Places API Integration
```
Primary API: Google Places Nearby Search
Endpoint: https://maps.googleapis.com/maps/api/place/nearbysearch/json
Geocoding: https://maps.googleapis.com/maps/api/geocode/json
Directions: Google Maps URL scheme integration
```

### API Configuration
```swift
struct GooglePlacesConfig {
    static let apiKey = "YOUR_GOOGLE_PLACES_API_KEY"
    static let baseURL = "https://maps.googleapis.com/maps/api/place"
    static let geocodeURL = "https://maps.googleapis.com/maps/api/geocode"
}
```

### Backend API Endpoints
```
GET /api/maps/mosques/nearby?lat={lat}&lng={lng}&radius={radius}
GET /api/maps/geocode?lat={lat}&lng={lng}
GET /api/maps/places/details?place_id={place_id}
```

## Data Models

### Mosque Structure
```swift
struct Mosque: Codable, Identifiable {
    let id: String // place_id from Google
    let name: String
    let address: String
    let coordinate: CLLocationCoordinate2D
    let distance: Double? // in miles
    let rating: Double?
    let userRatingsTotal: Int?
    let priceLevel: Int?
    let placeId: String
    let phoneNumber: String?
    let website: String?
    let openingHours: OpeningHours?
    let photos: [PlacePhoto]?
    
    // Custom properties
    var isOpen: Bool? {
        return openingHours?.openNow
    }
    
    var formattedDistance: String {
        guard let distance = distance else { return "Unknown" }
        return String(format: "%.1f miles", distance)
    }
}

struct OpeningHours: Codable {
    let openNow: Bool?
    let weekdayText: [String]?
}

struct PlacePhoto: Codable {
    let photoReference: String
    let height: Int
    let width: Int
}

struct SearchRadius {
    let meters: Int
    let displayName: String
    
    static let options = [
        SearchRadius(meters: 1609, displayName: "1 mile"),
        SearchRadius(meters: 3219, displayName: "2 miles"),
        SearchRadius(meters: 8047, displayName: "5 miles"),
        SearchRadius(meters: 16093, displayName: "10 miles"),
        SearchRadius(meters: 32187, displayName: "20 miles"),
        SearchRadius(meters: 80467, displayName: "50 miles")
    ]
}
```

## iOS Implementation

### Required Frameworks
```swift
import MapKit
import CoreLocation
import SwiftUI
```

### Location Manager
```swift
class MosqueLocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    
    @Published var userLocation: CLLocationCoordinate2D?
    @Published var locationName: String = ""
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        requestLocationPermission()
    }
    
    func requestLocationPermission() {
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
        reverseGeocode(location: location)
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        authorizationStatus = status
        if status == .authorizedWhenInUse || status == .authorizedAlways {
            startLocationUpdates()
        }
    }
    
    private func reverseGeocode(location: CLLocation) {
        let geocoder = CLGeocoder()
        geocoder.reverseGeocodeLocation(location) { [weak self] placemarks, error in
            guard let placemark = placemarks?.first, error == nil else { return }
            
            let components = [
                placemark.locality,
                placemark.administrativeArea,
                placemark.country
            ].compactMap { $0 }
            
            DispatchQueue.main.async {
                self?.locationName = components.joined(separator: ", ")
            }
        }
    }
}
```

### Mosque API Service
```swift
class MosqueAPIService: ObservableObject {
    @Published var mosques: [Mosque] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let session = URLSession.shared
    
    func searchNearbyMosques(
        latitude: Double,
        longitude: Double,
        radius: Int = 8047
    ) async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }
        
        do {
            let mosques = try await fetchNearbyMosques(
                latitude: latitude,
                longitude: longitude,
                radius: radius
            )
            
            await MainActor.run {
                self.mosques = mosques
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    private func fetchNearbyMosques(
        latitude: Double,
        longitude: Double,
        radius: Int
    ) async throws -> [Mosque] {
        let baseURL = "YOUR_API_BASE_URL"
        let urlString = "\(baseURL)/api/maps/mosques/nearby?lat=\(latitude)&lng=\(longitude)&radius=\(radius)"
        
        guard let url = URL(string: urlString) else {
            throw MosqueAPIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw MosqueAPIError.networkError
        }
        
        let apiResponse = try JSONDecoder().decode(GooglePlacesResponse.self, from: data)
        
        guard apiResponse.status == "OK" else {
            throw MosqueAPIError.apiError(apiResponse.status)
        }
        
        return apiResponse.results.map { place in
            Mosque(
                id: place.placeId,
                name: place.name,
                address: place.vicinity ?? place.formattedAddress ?? "Address not available",
                coordinate: CLLocationCoordinate2D(
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng
                ),
                distance: calculateDistance(
                    from: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
                    to: CLLocationCoordinate2D(
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng
                    )
                ),
                rating: place.rating,
                userRatingsTotal: place.userRatingsTotal,
                priceLevel: place.priceLevel,
                placeId: place.placeId,
                phoneNumber: place.formattedPhoneNumber,
                website: place.website,
                openingHours: place.openingHours,
                photos: place.photos
            )
        }.sorted { ($0.distance ?? 0) < ($1.distance ?? 0) }
    }
    
    private func calculateDistance(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) -> Double {
        let fromLocation = CLLocation(latitude: from.latitude, longitude: from.longitude)
        let toLocation = CLLocation(latitude: to.latitude, longitude: to.longitude)
        let distanceInMeters = fromLocation.distance(from: toLocation)
        return distanceInMeters * 0.000621371 // Convert to miles
    }
}

enum MosqueAPIError: LocalizedError {
    case invalidURL
    case networkError
    case apiError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError:
            return "Network error occurred"
        case .apiError(let status):
            return "API error: \(status)"
        }
    }
}
```

### Google Places Response Models
```swift
struct GooglePlacesResponse: Codable {
    let results: [GooglePlace]
    let status: String
}

struct GooglePlace: Codable {
    let placeId: String
    let name: String
    let vicinity: String?
    let formattedAddress: String?
    let geometry: PlaceGeometry
    let rating: Double?
    let userRatingsTotal: Int?
    let priceLevel: Int?
    let formattedPhoneNumber: String?
    let website: String?
    let openingHours: OpeningHours?
    let photos: [PlacePhoto]?
    
    enum CodingKeys: String, CodingKey {
        case placeId = "place_id"
        case name, vicinity, geometry, rating, photos
        case formattedAddress = "formatted_address"
        case userRatingsTotal = "user_ratings_total"
        case priceLevel = "price_level"
        case formattedPhoneNumber = "formatted_phone_number"
        case website
        case openingHours = "opening_hours"
    }
}

struct PlaceGeometry: Codable {
    let location: PlaceLocation
}

struct PlaceLocation: Codable {
    let lat: Double
    let lng: Double
}
```

## SwiftUI Views

### Main Mosque Locator View
```swift
struct MosqueLocatorView: View {
    @StateObject private var locationManager = MosqueLocationManager()
    @StateObject private var apiService = MosqueAPIService()
    @State private var selectedRadius = SearchRadius.options[2] // 5 miles default
    @State private var showingMapView = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header with location info
                LocationHeaderView(
                    locationName: locationManager.locationName,
                    selectedRadius: $selectedRadius,
                    onRadiusChange: { radius in
                        searchMosques(radius: radius.meters)
                    },
                    onRefresh: {
                        refreshLocation()
                    }
                )
                
                // Content
                if apiService.isLoading {
                    LoadingView()
                } else if let error = apiService.errorMessage {
                    ErrorView(message: error) {
                        refreshLocation()
                    }
                } else {
                    MosqueListView(mosques: apiService.mosques)
                }
            }
            .navigationTitle("🕌 Nearby Mosques")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Map") {
                        showingMapView = true
                    }
                }
            }
            .sheet(isPresented: $showingMapView) {
                MosqueMapView(
                    mosques: apiService.mosques,
                    userLocation: locationManager.userLocation
                )
            }
        }
        .onAppear {
            setupLocationAndSearch()
        }
        .onChange(of: locationManager.userLocation) { location in
            if let location = location {
                searchMosques(
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius: selectedRadius.meters
                )
            }
        }
    }
    
    private func setupLocationAndSearch() {
        locationManager.startLocationUpdates()
    }
    
    private func refreshLocation() {
        locationManager.startLocationUpdates()
    }
    
    private func searchMosques(radius: Int) {
        guard let location = locationManager.userLocation else { return }
        searchMosques(latitude: location.latitude, longitude: location.longitude, radius: radius)
    }
    
    private func searchMosques(latitude: Double, longitude: Double, radius: Int) {
        Task {
            await apiService.searchNearbyMosques(
                latitude: latitude,
                longitude: longitude,
                radius: radius
            )
        }
    }
}
```

### Mosque List View
```swift
struct MosqueListView: View {
    let mosques: [Mosque]
    
    var body: some View {
        List(mosques) { mosque in
            MosqueRowView(mosque: mosque)
                .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
        }
        .listStyle(PlainListStyle())
        .overlay {
            if mosques.isEmpty {
                EmptyStateView()
            }
        }
    }
}

struct MosqueRowView: View {
    let mosque: Mosque
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Mosque name and rating
            HStack {
                Text(mosque.name)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                if let rating = mosque.rating {
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                            .font(.caption)
                        Text(String(format: "%.1f", rating))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // Address
            Text(mosque.address)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)
            
            // Distance and status
            HStack {
                if let distance = mosque.distance {
                    Label(mosque.formattedDistance, systemImage: "location")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
                
                Spacer()
                
                if let isOpen = mosque.isOpen {
                    Text(isOpen ? "Open" : "Closed")
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(isOpen ? Color.green.opacity(0.2) : Color.red.opacity(0.2))
                        .foregroundColor(isOpen ? .green : .red)
                        .cornerRadius(4)
                }
            }
            
            // Action buttons
            HStack(spacing: 12) {
                Button("Directions") {
                    openDirections(to: mosque)
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                
                if mosque.phoneNumber != nil {
                    Button("Call") {
                        callMosque(mosque)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }
                
                Spacer()
            }
        }
        .padding(.vertical, 4)
    }
    
    private func openDirections(to mosque: Mosque) {
        let coordinate = mosque.coordinate
        let placemark = MKPlacemark(coordinate: coordinate)
        let mapItem = MKMapItem(placemark: placemark)
        mapItem.name = mosque.name
        mapItem.openInMaps(launchOptions: [
            MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeDriving
        ])
    }
    
    private func callMosque(_ mosque: Mosque) {
        guard let phoneNumber = mosque.phoneNumber,
              let url = URL(string: "tel:\(phoneNumber)") else { return }
        UIApplication.shared.open(url)
    }
}
```

### Map View
```swift
struct MosqueMapView: View {
    let mosques: [Mosque]
    let userLocation: CLLocationCoordinate2D?
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Map(coordinateRegion: .constant(mapRegion), annotationItems: mosques) { mosque in
                MapAnnotation(coordinate: mosque.coordinate) {
                    MosqueMapPin(mosque: mosque)
                }
            }
            .navigationTitle("Mosque Map")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private var mapRegion: MKCoordinateRegion {
        guard let userLocation = userLocation else {
            return MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
                span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
            )
        }
        
        return MKCoordinateRegion(
            center: userLocation,
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )
    }
}

struct MosqueMapPin: View {
    let mosque: Mosque
    
    var body: some View {
        VStack {
            Image(systemName: "building.2.fill")
                .foregroundColor(.green)
                .font(.title2)
                .padding(8)
                .background(Color.white)
                .clipShape(Circle())
                .shadow(radius: 4)
            
            Text(mosque.name)
                .font(.caption)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.white.opacity(0.9))
                .cornerRadius(8)
        }
    }
}
```

## Local Storage & Caching

### UserDefaults for Preferences
```swift
extension UserDefaults {
    private enum Keys {
        static let searchRadius = "mosque_search_radius"
        static let lastLocation = "mosque_last_location"
        static let favoritesMosques = "favorite_mosques"
    }
    
    var mosqueSearchRadius: Int {
        get { integer(forKey: Keys.searchRadius) == 0 ? 8047 : integer(forKey: Keys.searchRadius) }
        set { set(newValue, forKey: Keys.searchRadius) }
    }
    
    var lastMosqueLocation: CLLocationCoordinate2D? {
        get {
            let lat = double(forKey: Keys.lastLocation + "_lat")
            let lng = double(forKey: Keys.lastLocation + "_lng")
            return lat != 0 && lng != 0 ? CLLocationCoordinate2D(latitude: lat, longitude: lng) : nil
        }
        set {
            if let coordinate = newValue {
                set(coordinate.latitude, forKey: Keys.lastLocation + "_lat")
                set(coordinate.longitude, forKey: Keys.lastLocation + "_lng")
            }
        }
    }
}
```

## Error Handling & Edge Cases

### Common Issues
1. **Location permission denied**: Show manual location entry
2. **No internet connection**: Show cached results
3. **API quota exceeded**: Show fallback message
4. **No mosques found**: Suggest increasing radius

### Fallback Implementation
```swift
struct LocationPermissionView: View {
    let onManualLocation: (CLLocationCoordinate2D) -> Void
    
    @State private var latitude: String = ""
    @State private var longitude: String = ""
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "location.slash")
                .font(.system(size: 60))
                .foregroundColor(.red)
            
            Text("Location Access Required")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Please enable location access in Settings or enter your coordinates manually.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
            
            VStack(spacing: 12) {
                TextField("Latitude", text: $latitude)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.decimalPad)
                
                TextField("Longitude", text: $longitude)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.decimalPad)
                
                Button("Search Mosques") {
                    if let lat = Double(latitude), let lng = Double(longitude) {
                        onManualLocation(CLLocationCoordinate2D(latitude: lat, longitude: lng))
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(latitude.isEmpty || longitude.isEmpty)
            }
            
            Button("Open Settings") {
                if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(settingsUrl)
                }
            }
            .buttonStyle(.bordered)
        }
        .padding()
    }
}
```

## Testing Requirements

### Unit Tests
- [ ] Distance calculation accuracy
- [ ] API response parsing
- [ ] Location coordinate validation
- [ ] Search radius conversion

### Integration Tests
- [ ] Google Places API integration
- [ ] Location permission handling
- [ ] Map integration
- [ ] Navigation to external apps

### UI Tests
- [ ] Mosque list display
- [ ] Search radius selection
- [ ] Directions functionality
- [ ] Map view interaction

This implementation guide provides everything needed to build a comprehensive mosque locator for iOS that integrates with Google Places API and provides real-time mosque data with navigation capabilities.