# Quran Reader Implementation Guide for iOS

## How Quran Reader Works

### Core Functionality
1. **Surah Selection** → **Ayah Display** → **Audio Playback** → **Navigation Controls**
2. Uses Al-Quran Cloud API for Arabic text and translations
3. Uses EveryAyah.com for high-quality audio recitations
4. Supports multiple reciters and playback modes

## Data Sources & APIs

### Quran Text API
```
Primary: https://api.alquran.cloud/v1/quran/quran-uthmani (Arabic text)
Translation: https://api.alquran.cloud/v1/surah/{surahNumber}/en.asad
```

### Audio Sources
```
Primary: https://www.everyayah.com/data/{reciterCode}/{surahAyah}.mp3
Fallback: https://server8.mp3quran.net/afs/{surah}.mp3
Bismillah: https://www.everyayah.com/data/{reciterCode}/001001.mp3
```

### Available Reciters
```typescript
const reciters = [
  { id: 1, name: 'Abdul Basit Abdul Samad', code: 'Abdul_Basit_Murattal_192kbps' },
  { id: 2, name: 'Mishary Rashid Alafasy', code: 'Alafasy_128kbps' },
  { id: 3, name: 'Saad Al Ghamdi', code: 'Ghamadi_40kbps' },
  { id: 4, name: 'Ahmed ibn Ali al-Ajamy', code: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net' },
  { id: 5, name: 'Hani ar-Rifai', code: 'Hani_Rifai_192kbps' }
];
```

## Data Models

### Surah Structure
```swift
struct Surah: Codable, Identifiable {
    let id = UUID()
    let number: Int
    let name: String // Arabic name
    let englishName: String
    let englishNameTranslation: String
    let numberOfAyahs: Int
    let revelationType: String // "Meccan" or "Medinan"
    let ayahs: [Ayah]
}

struct Ayah: Codable, Identifiable {
    let id = UUID()
    let number: Int // Global ayah number
    let text: String // Arabic text
    let numberInSurah: Int // Ayah number within surah
}

struct Translation: Codable {
    let text: String
    let language: String
}
```

### Audio Configuration
```swift
struct AudioConfiguration {
    let reciterId: Int
    let playbackSpeed: Float // 1.0, 1.5, 2.0
    let autoPlay: Bool
    let verseByVerse: Bool
    let volume: Float
}
```

## Display Modes

### 1. Continuous Mode (Default)
- Shows entire surah as flowing text
- Ayah numbers displayed as circular badges
- Click any ayah to play from that point
- Highlights currently playing ayah

### 2. Verse-by-Verse Mode
- Each ayah displayed separately
- Shows translation below each ayah (optional)
- Individual ayah cards with play buttons
- Better for study and memorization

## Audio System Implementation

### Audio File Naming Convention
```
Format: {surah}{ayah}.mp3
Example: 001001.mp3 (Surah 1, Ayah 1)
Padding: 3 digits for both surah and ayah numbers
```

### Audio Features
1. **Bismillah Handling**: Plays before surah (except Al-Fatiha and At-Tawbah)
2. **Auto-play**: Continues to next ayah automatically
3. **Preloading**: Loads next ayah while current is playing
4. **Fallback**: Multiple audio sources for reliability
5. **Speed Control**: 1x, 1.5x, 2x playback speeds
6. **Background Play**: Continues when app is backgrounded

### iOS Audio Implementation
```swift
import AVFoundation

class QuranAudioManager: ObservableObject {
    private var audioPlayer: AVAudioPlayer?
    private var audioSession: AVAudioSession
    
    @Published var isPlaying = false
    @Published var currentAyah = 1
    @Published var playbackSpeed: Float = 1.0
    
    init() {
        audioSession = AVAudioSession.sharedInstance()
        setupAudioSession()
    }
    
    private func setupAudioSession() {
        do {
            try audioSession.setCategory(.playback, mode: .default)
            try audioSession.setActive(true)
        } catch {
            print("Audio session setup failed: \(error)")
        }
    }
    
    func playAyah(surah: Int, ayah: Int, reciterId: Int) async {
        let audioURL = buildAudioURL(surah: surah, ayah: ayah, reciterId: reciterId)
        
        do {
            let data = try Data(contentsOf: audioURL)
            audioPlayer = try AVAudioPlayer(data: data)
            audioPlayer?.delegate = self
            audioPlayer?.rate = playbackSpeed
            audioPlayer?.play()
            isPlaying = true
        } catch {
            // Try fallback URL
            await playFallbackAudio(surah: surah, ayah: ayah)
        }
    }
    
    private func buildAudioURL(surah: Int, ayah: Int, reciterId: Int) -> URL {
        let reciterCode = getReciterCode(reciterId)
        let paddedSurah = String(format: "%03d", surah)
        let paddedAyah = String(format: "%03d", ayah)
        let urlString = "https://www.everyayah.com/data/\(reciterCode)/\(paddedSurah)\(paddedAyah).mp3"
        return URL(string: urlString)!
    }
}

extension QuranAudioManager: AVAudioPlayerDelegate {
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        if flag {
            // Auto-play next ayah if enabled
            playNextAyah()
        }
        isPlaying = false
    }
}
```

## UI Components

### 1. Surah Selector
```swift
struct SurahSelector: View {
    @Binding var selectedSurah: Surah?
    let surahs: [Surah]
    
    var body: some View {
        Picker("Select Surah", selection: $selectedSurah) {
            ForEach(surahs) { surah in
                Text("\(surah.number.toArabicNumerals()). \(surah.englishName)")
                    .tag(surah as Surah?)
            }
        }
        .pickerStyle(MenuPickerStyle())
    }
}
```

### 2. Ayah Display
```swift
struct AyahView: View {
    let ayah: Ayah
    let isCurrentlyPlaying: Bool
    let showTranslation: Bool
    let fontSize: CGFloat
    let onTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                // Ayah number badge
                Text(ayah.numberInSurah.toArabicNumerals())
                    .font(.caption)
                    .foregroundColor(.white)
                    .frame(width: 24, height: 24)
                    .background(Color.green)
                    .clipShape(Circle())
                
                // Arabic text
                Text(ayah.text)
                    .font(.custom("KFGQPC Uthmanic Script HAFS", size: fontSize))
                    .multilineTextAlignment(.trailing)
                    .background(isCurrentlyPlaying ? Color.green.opacity(0.2) : Color.clear)
                    .onTapGesture(perform: onTap)
            }
            
            if showTranslation {
                Text(translation?.text ?? "")
                    .font(.body)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
```

### 3. Audio Controls
```swift
struct AudioControls: View {
    @ObservedObject var audioManager: QuranAudioManager
    let currentSurah: Surah?
    
    var body: some View {
        HStack(spacing: 20) {
            // Previous Surah
            Button(action: previousSurah) {
                Image(systemName: "backward.end.fill")
            }
            .disabled(currentSurah?.number == 1)
            
            // Previous Ayah
            Button(action: previousAyah) {
                Image(systemName: "backward.fill")
            }
            .disabled(audioManager.currentAyah == 1)
            
            // Play/Stop
            Button(action: togglePlayback) {
                Image(systemName: audioManager.isPlaying ? "stop.fill" : "play.fill")
                    .font(.title2)
            }
            .frame(width: 50, height: 50)
            .background(Color.green)
            .foregroundColor(.white)
            .clipShape(Circle())
            
            // Playback Speed
            Button("\(audioManager.playbackSpeed, specifier: "%.1f")x") {
                cyclePlaybackSpeed()
            }
            
            // Next Ayah
            Button(action: nextAyah) {
                Image(systemName: "forward.fill")
            }
            
            // Next Surah
            Button(action: nextSurah) {
                Image(systemName: "forward.end.fill")
            }
            .disabled(currentSurah?.number == 114)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(25)
        .shadow(radius: 5)
    }
}
```

## Settings & Preferences

### User Preferences
```swift
struct QuranSettings {
    @AppStorage("selectedReciter") var selectedReciterId: Int = 1
    @AppStorage("autoPlay") var autoPlay: Bool = true
    @AppStorage("verseByVerse") var verseByVerse: Bool = false
    @AppStorage("showTranslation") var showTranslation: Bool = true
    @AppStorage("fontSize") var fontSize: Double = 18
    @AppStorage("playbackSpeed") var playbackSpeed: Double = 1.0
    @AppStorage("lastSurah") var lastSurah: Int = 1
    @AppStorage("lastAyah") var lastAyah: Int = 1
}
```

### Settings View
```swift
struct QuranSettingsView: View {
    @StateObject private var settings = QuranSettings()
    
    var body: some View {
        Form {
            Section("Reciter") {
                Picker("Select Reciter", selection: $settings.selectedReciterId) {
                    ForEach(reciters, id: \.id) { reciter in
                        Text(reciter.name).tag(reciter.id)
                    }
                }
            }
            
            Section("Playback") {
                Toggle("Auto Play Next Ayah", isOn: $settings.autoPlay)
                Toggle("Verse by Verse Mode", isOn: $settings.verseByVerse)
                Toggle("Show Translation", isOn: $settings.showTranslation)
                
                HStack {
                    Text("Playback Speed")
                    Spacer()
                    Picker("Speed", selection: $settings.playbackSpeed) {
                        Text("1.0x").tag(1.0)
                        Text("1.5x").tag(1.5)
                        Text("2.0x").tag(2.0)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
            }
            
            Section("Display") {
                HStack {
                    Text("Font Size")
                    Spacer()
                    Slider(value: $settings.fontSize, in: 14...24, step: 1)
                    Text("\(Int(settings.fontSize))px")
                }
            }
        }
    }
}
```

## Special Handling

### Bismillah Logic
```swift
func shouldPlayBismillah(surahNumber: Int, ayahNumber: Int) -> Bool {
    // Don't play Bismillah for:
    // - Al-Fatiha (already contains Bismillah as first ayah)
    // - At-Tawbah (doesn't start with Bismillah)
    // - When not starting from first ayah
    return ayahNumber == 1 && surahNumber != 1 && surahNumber != 9
}

func cleanAyahText(_ text: String, surahNumber: Int, ayahNumber: Int) -> String {
    // Remove Bismillah from first ayah of surahs (except Al-Fatiha and At-Tawbah)
    if ayahNumber == 1 && surahNumber != 1 && surahNumber != 9 {
        if text.hasPrefix("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ") {
            return String(text.dropFirst("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ".count)).trimmingCharacters(in: .whitespaces)
        }
    }
    return text
}
```

### Arabic Numerals
```swift
extension Int {
    func toArabicNumerals() -> String {
        let arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
        return String(self).compactMap { char in
            if let digit = Int(String(char)) {
                return arabicNumerals[digit]
            }
            return String(char)
        }.joined()
    }
}
```

## Core Data Storage

### Entities
```swift
// Bookmark entity
@objc(Bookmark)
public class Bookmark: NSManagedObject {
    @NSManaged public var surahNumber: Int32
    @NSManaged public var ayahNumber: Int32
    @NSManaged public var note: String?
    @NSManaged public var createdAt: Date
}

// Reading Progress entity
@objc(ReadingProgress)
public class ReadingProgress: NSManagedObject {
    @NSManaged public var surahNumber: Int32
    @NSManaged public var ayahNumber: Int32
    @NSManaged public var lastReadAt: Date
}
```

## Offline Support

### Caching Strategy
1. **Text Caching**: Store frequently accessed surahs locally
2. **Audio Caching**: Download and cache favorite reciters
3. **Translation Caching**: Store selected translations offline
4. **Progress Sync**: Sync reading progress when online

### Implementation
```swift
class QuranCacheManager {
    private let cacheDirectory: URL
    
    func cacheAudio(surah: Int, ayah: Int, reciterId: Int) async {
        let audioURL = buildAudioURL(surah: surah, ayah: ayah, reciterId: reciterId)
        let localURL = getCacheURL(surah: surah, ayah: ayah, reciterId: reciterId)
        
        do {
            let data = try Data(contentsOf: audioURL)
            try data.write(to: localURL)
        } catch {
            print("Failed to cache audio: \(error)")
        }
    }
    
    func getCachedAudio(surah: Int, ayah: Int, reciterId: Int) -> URL? {
        let localURL = getCacheURL(surah: surah, ayah: ayah, reciterId: reciterId)
        return FileManager.default.fileExists(atPath: localURL.path) ? localURL : nil
    }
}
```

## Testing Requirements

### Unit Tests
- [ ] Audio URL generation
- [ ] Bismillah logic
- [ ] Arabic numeral conversion
- [ ] Text cleaning functions
- [ ] Cache management

### Integration Tests
- [ ] API data fetching
- [ ] Audio playback
- [ ] Navigation between ayahs
- [ ] Settings persistence
- [ ] Offline mode functionality

### UI Tests
- [ ] Surah selection
- [ ] Ayah highlighting
- [ ] Audio controls
- [ ] Settings changes
- [ ] Bookmark creation

This implementation guide provides everything needed to build a comprehensive Quran reader for iOS that matches the web application's functionality while leveraging native iOS audio capabilities and user interface patterns.