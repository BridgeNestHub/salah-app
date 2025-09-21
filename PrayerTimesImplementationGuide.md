# Prayer Times Implementation Guide for iOS

## How Prayer Times Work

### Data Flow
1. **Location Detection** → **API Call** → **Display Times** → **Schedule Notifications**
2. Uses Aladhan API for accurate Islamic prayer calculations
3. Supports both GPS coordinates and city-based lookup
4. Includes Athan (prayer call) audio notifications

## Backend API Implementation

### Endpoints Used
```
GET /api/prayer/times?latitude={lat}&longitude={lng}&method={method}
GET /api/prayer/times/city?city={city}&country={country}&method={method}
GET /api/prayer/hijri-date?date={dd-mm-yyyy}
```

### API Response Structure
```json
{
  "data": {
    "timings": {
      "Fajr": "05:30",
      "Sunrise": "07:15", 
      "Dhuhr": "12:45",
      "Asr": "16:20",
      "Maghrib": "19:30",
      "Isha": "21:00"
    },
    "date": {
      "hijri": {
        "day": "15",
        "month": { "en": "Ramadan" },
        "year": "1445"
      },
      "gregorian": {
        "weekday": { "en": "Friday" },
        "day": "15",
        "month": { "en": "March" },
        "year": "2024"
      }
    }
  }
}
```

### Calculation Method
- **Method 2**: Islamic Society of North America (ISNA)
- **Fallback**: Muslim World League (MWL)
- **External API**: Aladhan API (`https://api.aladhan.com/v1`)

## Frontend Display Implementation

### Core Features
1. **Location Input**: Manual city entry + GPS location
2. **Prayer Times Grid**: 6 prayers (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)
3. **Iqama Times**: Calculated with fixed offsets
4. **Date Display**: Both Hijri and Gregorian calendars
5. **Audio Notifications**: Athan sound at prayer times

### Iqama Time Offsets (in minutes)
```typescript
const iqamaOffsets = {
  Fajr: 16,
  Dhuhr: 21, 
  Asr: 18,
  Maghrib: 9,
  Isha: 15
};
```

### Time Format Conversion
- **Input**: 24-hour format (e.g., "17:30")
- **Display**: 12-hour format (e.g., "5:30 PM")
- **Calculation**: Add offset minutes for Iqama times

## iOS Implementation Requirements

### 1. Location Services
```swift
import CoreLocation

class LocationManager: NSObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    
    func requestLocationPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func getCurrentLocation() -> CLLocationCoordinate2D? {
        return locationManager.location?.coordinate
    }
}
```

### 2. API Service
```swift
class PrayerTimesAPI {
    private let baseURL = "https://your-api.com/api"
    
    func getPrayerTimes(lat: Double, lng: Double) async throws -> PrayerTimesResponse {
        let url = "\(baseURL)/prayer/times?latitude=\(lat)&longitude=\(lng)&method=2"
        // Implement API call
    }
    
    func getPrayerTimesByCity(_ city: String) async throws -> PrayerTimesResponse {
        let url = "\(baseURL)/prayer/times/city?city=\(city)&method=2"
        // Implement API call
    }
}
```

### 3. Data Models
```swift
struct PrayerTimesResponse: Codable {
    let data: PrayerData
}

struct PrayerData: Codable {
    let timings: PrayerTimings
    let date: DateInfo
}

struct PrayerTimings: Codable {
    let Fajr: String
    let Sunrise: String
    let Dhuhr: String
    let Asr: String
    let Maghrib: String
    let Isha: String
}

struct DateInfo: Codable {
    let hijri: HijriDate
    let gregorian: GregorianDate
}
```

### 4. Core Data Storage
```swift
// PrayerTime+CoreDataClass.swift
@objc(PrayerTime)
public class PrayerTime: NSManagedObject {
    @NSManaged public var date: Date
    @NSManaged public var fajr: String
    @NSManaged public var sunrise: String
    @NSManaged public var dhuhr: String
    @NSManaged public var asr: String
    @NSManaged public var maghrib: String
    @NSManaged public var isha: String
    @NSManaged public var location: String
}
```

### 5. SwiftUI View Structure
```swift
struct PrayerTimesView: View {
    @StateObject private var viewModel = PrayerTimesViewModel()
    
    var body: some View {
        VStack {
            LocationInputView()
            DateDisplayView()
            PrayerTimesGridView()
            AudioControlsView()
        }
        .onAppear {
            viewModel.loadPrayerTimes()
        }
    }
}

struct PrayerTimeCard: View {
    let prayer: Prayer
    
    var body: some View {
        VStack {
            Text(prayer.name)
            Text(prayer.athanTime)
            if let iqamaTime = prayer.iqamaTime {
                Text("Iqama: \(iqamaTime)")
            }
        }
    }
}
```

## Audio Notification System

### Requirements
1. **Audio File**: Include `athan.mp3` in app bundle
2. **Background Audio**: Configure for background playback
3. **Local Notifications**: Schedule for each prayer time
4. **User Permissions**: Request notification permissions

### Implementation
```swift
import AVFoundation
import UserNotifications

class AthanService: ObservableObject {
    private var audioPlayer: AVAudioPlayer?
    
    func setupAudio() {
        guard let url = Bundle.main.url(forResource: "athan", withExtension: "mp3") else { return }
        audioPlayer = try? AVAudioPlayer(contentsOf: url)
        audioPlayer?.prepareToPlay()
    }
    
    func scheduleNotifications(for prayerTimes: PrayerTimings) {
        let prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
        
        for prayer in prayers {
            guard let timeString = getTimeForPrayer(prayer, from: prayerTimes) else { continue }
            
            let content = UNMutableNotificationContent()
            content.title = "\(prayer) Prayer Time"
            content.body = "It's time for \(prayer) prayer"
            content.sound = UNNotificationSound(named: UNNotificationSoundName("athan.mp3"))
            
            // Schedule notification
            let trigger = createTrigger(for: timeString)
            let request = UNNotificationRequest(identifier: prayer, content: content, trigger: trigger)
            
            UNUserNotificationCenter.current().add(request)
        }
    }
}
```

## Local Storage & Caching

### UserDefaults Keys
```swift
struct StorageKeys {
    static let lastLocation = "lastLocation"
    static let lastCoordinates = "lastCoordinates"
    static let audioEnabled = "audioEnabled"
    static let calculationMethod = "calculationMethod"
    static let notificationsEnabled = "notificationsEnabled"
}
```

### Offline Support
1. **Cache prayer times** for current and next day
2. **Store last known location** for quick loading
3. **Fallback to cached data** when network unavailable
4. **Background refresh** to update daily

## UI Components Needed

### 1. Location Input
- Text field for manual city entry
- GPS location button
- Location permission handling
- Autocomplete suggestions (optional)

### 2. Prayer Times Grid
- 6 prayer cards (including Sunrise)
- Athan time display
- Iqama time display (except Sunrise)
- 12-hour time format
- Current prayer highlighting

### 3. Date Display
- Hijri date (Arabic calendar)
- Gregorian date (Western calendar)
- Day of week display

### 4. Audio Controls
- Enable/disable notifications toggle
- Volume control slider
- Test audio button
- Audio status indicator

### 5. Settings Panel
- Calculation method selection
- Iqama time offset adjustments
- Notification preferences
- Location preferences

## Error Handling

### Common Issues
1. **Location denied**: Fallback to manual city entry
2. **Network failure**: Use cached prayer times
3. **Invalid location**: Show error message
4. **Audio permission denied**: Show visual notifications only
5. **API rate limiting**: Implement retry logic

### User Feedback
- Loading states during API calls
- Error messages for failed requests
- Success indicators for location updates
- Audio status notifications

## Testing Checklist

### Functionality Tests
- [ ] GPS location detection works
- [ ] Manual city entry works
- [ ] Prayer times display correctly
- [ ] Iqama times calculate properly
- [ ] Audio notifications play
- [ ] Background notifications work
- [ ] Offline mode functions
- [ ] Time format conversion accurate

### Edge Cases
- [ ] Location permission denied
- [ ] Network connectivity issues
- [ ] Invalid city names
- [ ] Audio permission denied
- [ ] App backgrounded during prayer time
- [ ] Time zone changes
- [ ] Date rollover at midnight

This implementation guide provides everything needed to build the Prayer Times feature for iOS, matching the web application's functionality while leveraging native iOS capabilities.