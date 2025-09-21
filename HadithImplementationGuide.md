# Hadith Reader Implementation Guide for iOS

## How Hadith Reader Works

### Core Functionality
1. **Collection Selection** → **Search/Browse** → **Display Hadith** → **Audio/Bookmarks**
2. Uses multiple API sources with fallback strategy
3. Supports search across collections with keyword matching
4. Includes Arabic text, English translation, narrator, and authenticity grade
5. Features bookmarking, audio playback, and sharing capabilities

## Data Sources & APIs

### Primary APIs (with Fallback Strategy)
```
1. HadithAPI.com (Primary - requires API key)
   - Endpoint: https://hadithapi.com/api/hadiths/
   - API Key: Required from https://hadithapi.com/profile
   
2. Sunnah.com API (Secondary - requires API key)
   - Endpoint: https://api.sunnah.com/v1/
   - API Key: Required from https://sunnah.com/developers
   
3. Alternative Free APIs (Fallback)
   - Endpoint: https://api.hadith.gading.dev/
   - No API key required
   
4. Local Database (Ultimate Fallback)
   - Embedded hadith collection for offline use
```

### Backend API Endpoints
```
GET /api/hadith/collections - Get all collections
GET /api/hadith/search?q={query}&collection={collection} - Search hadiths
GET /api/hadith/random?collection={collection} - Get random hadith
GET /api/hadith/{id} - Get specific hadith
```

## Data Models

### Hadith Structure
```swift
struct Hadith: Codable, Identifiable {
    let id: String
    let collection: String // "Sahih Bukhari", "Sahih Muslim", etc.
    let book: String // "Book of Faith", "Book of Prayer", etc.
    let chapter: String
    let hadithNumber: String
    let arabicText: String
    let translation: String
    let narrator: String
    let grade: String // "Sahih", "Hasan", "Da'if"
    let reference: String // "Bukhari 1:1"
    
    // Computed properties
    var isAuthentic: Bool {
        return grade.lowercased().contains("sahih") || grade.lowercased().contains("hasan")
    }
    
    var formattedReference: String {
        return "\(collection) \(hadithNumber)"
    }
}

struct HadithCollection: Codable, Identifiable {
    let id: String // "bukhari", "muslim", etc.
    let name: String // "Sahih Bukhari"
    let arabicName: String // "صحيح البخاري"
    let description: String
    let totalHadiths: Int
    let compiler: String // "Imam Bukhari"
}

struct HadithBook: Codable, Identifiable {
    let id: String
    let name: String
    let arabicName: String
    let collectionId: String
    let totalHadiths: Int
    let chapters: [HadithChapter]?
}

struct HadithChapter: Codable, Identifiable {
    let id: String
    let name: String
    let arabicName: String
    let bookId: String
    let hadithCount: Int
}
```

### Search & Filter Models
```swift
struct HadithSearchQuery {
    let query: String
    let collection: String?
    let book: String?
    let narrator: String?
    let grade: HadithGrade?
    let limit: Int
}

enum HadithGrade: String, CaseIterable {
    case sahih = "Sahih"
    case hasan = "Hasan"
    case daif = "Da'if"
    case all = "All"
    
    var displayName: String {
        switch self {
        case .sahih: return "Authentic (Sahih)"
        case .hasan: return "Good (Hasan)"
        case .daif: return "Weak (Da'if)"
        case .all: return "All Grades"
        }
    }
}
```

## iOS Implementation

### Required Frameworks
```swift
import SwiftUI
import AVFoundation // For audio playback
import CoreData // For bookmarks and offline storage
```

### Hadith API Service
```swift
class HadithAPIService: ObservableObject {
    @Published var collections: [HadithCollection] = []
    @Published var currentHadith: Hadith?
    @Published var searchResults: [Hadith] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let session = URLSession.shared
    private let apiKey = "YOUR_HADITH_API_KEY"
    
    // Collection mapping for different APIs
    private let collectionMapping: [String: String] = [
        "bukhari": "sahih-bukhari",
        "muslim": "sahih-muslim",
        "tirmidhi": "al-tirmidhi",
        "abudawud": "abu-dawood",
        "ibnmajah": "ibn-e-majah",
        "nasai": "sunan-nasai"
    ]
    
    func loadCollections() async {
        await MainActor.run { isLoading = true }
        
        do {
            let collections = try await fetchCollections()
            await MainActor.run {
                self.collections = collections
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    func searchHadiths(query: String, collection: String? = nil) async {
        await MainActor.run { isLoading = true }
        
        do {
            let results = try await performSearch(query: query, collection: collection)
            await MainActor.run {
                self.searchResults = results
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    func getRandomHadith(from collection: String? = nil) async {
        await MainActor.run { isLoading = true }
        
        do {
            let hadith = try await fetchRandomHadith(collection: collection)
            await MainActor.run {
                self.currentHadith = hadith
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = error.localizedDescription
                self.isLoading = false
            }
        }
    }
    
    private func fetchCollections() async throws -> [HadithCollection] {
        // Try multiple APIs with fallback
        let collections = [
            HadithCollection(
                id: "bukhari",
                name: "Sahih Bukhari",
                arabicName: "صحيح البخاري",
                description: "The most authentic collection of Hadith",
                totalHadiths: 7563,
                compiler: "Imam Bukhari"
            ),
            HadithCollection(
                id: "muslim",
                name: "Sahih Muslim",
                arabicName: "صحيح مسلم",
                description: "The second most authentic collection",
                totalHadiths: 7190,
                compiler: "Imam Muslim"
            ),
            HadithCollection(
                id: "tirmidhi",
                name: "Jami at-Tirmidhi",
                arabicName: "جامع الترمذي",
                description: "Collection with detailed commentary",
                totalHadiths: 3956,
                compiler: "Imam Tirmidhi"
            ),
            HadithCollection(
                id: "abudawud",
                name: "Sunan Abu Dawud",
                arabicName: "سنن أبي داود",
                description: "Focus on legal matters",
                totalHadiths: 5274,
                compiler: "Imam Abu Dawud"
            )
        ]
        
        return collections
    }
    
    private func performSearch(query: String, collection: String?) async throws -> [Hadith] {
        let baseURL = "YOUR_API_BASE_URL"
        var urlComponents = URLComponents(string: "\(baseURL)/api/hadith/search")!
        
        urlComponents.queryItems = [
            URLQueryItem(name: "q", value: query),
            URLQueryItem(name: "limit", value: "20")
        ]
        
        if let collection = collection {
            urlComponents.queryItems?.append(URLQueryItem(name: "collection", value: collection))
        }
        
        guard let url = urlComponents.url else {
            throw HadithAPIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw HadithAPIError.networkError
        }
        
        let apiResponse = try JSONDecoder().decode(HadithSearchResponse.self, from: data)
        return apiResponse.data
    }
    
    private func fetchRandomHadith(collection: String?) async throws -> Hadith {
        let baseURL = "YOUR_API_BASE_URL"
        var urlComponents = URLComponents(string: "\(baseURL)/api/hadith/random")!
        
        if let collection = collection {
            urlComponents.queryItems = [URLQueryItem(name: "collection", value: collection)]
        }
        
        guard let url = urlComponents.url else {
            throw HadithAPIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw HadithAPIError.networkError
        }
        
        let apiResponse = try JSONDecoder().decode(HadithResponse.self, from: data)
        return apiResponse.data
    }
}

enum HadithAPIError: LocalizedError {
    case invalidURL
    case networkError
    case apiError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError:
            return "Network error occurred"
        case .apiError(let message):
            return "API error: \(message)"
        }
    }
}
```

### SwiftUI Views

### Main Hadith Reader View
```swift
struct HadithReaderView: View {
    @StateObject private var apiService = HadithAPIService()
    @StateObject private var bookmarkManager = HadithBookmarkManager()
    @StateObject private var audioManager = HadithAudioManager()
    
    @State private var selectedCollection: HadithCollection?
    @State private var showSearch = false
    @State private var showSettings = false
    @State private var fontSize: Double = 18
    @State private var showArabic = true
    @State private var showTranslation = true
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Collection Selector
                CollectionSelectorView(
                    collections: apiService.collections,
                    selectedCollection: $selectedCollection
                )
                
                // Main Content
                if apiService.isLoading {
                    LoadingView()
                } else if let hadith = apiService.currentHadith {
                    HadithDisplayView(
                        hadith: hadith,
                        fontSize: fontSize,
                        showArabic: showArabic,
                        showTranslation: showTranslation,
                        isBookmarked: bookmarkManager.isBookmarked(hadith.id),
                        onBookmark: { bookmarkManager.toggleBookmark(hadith) },
                        onShare: { shareHadith(hadith) },
                        onPlayAudio: { audioManager.playHadith(hadith) }
                    )
                } else {
                    EmptyStateView {
                        Task {
                            await apiService.getRandomHadith()
                        }
                    }
                }
                
                // Controls
                HadithControlsView(
                    onPrevious: { /* Load previous hadith */ },
                    onNext: { /* Load next hadith */ },
                    onRandom: {
                        Task {
                            await apiService.getRandomHadith(from: selectedCollection?.id)
                        }
                    },
                    onSearch: { showSearch = true }
                )
            }
            .navigationTitle("📖 Hadith Reader")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Settings") {
                        showSettings = true
                    }
                }
            }
            .sheet(isPresented: $showSearch) {
                HadithSearchView(apiService: apiService)
            }
            .sheet(isPresented: $showSettings) {
                HadithSettingsView(
                    fontSize: $fontSize,
                    showArabic: $showArabic,
                    showTranslation: $showTranslation
                )
            }
        }
        .task {
            await apiService.loadCollections()
            await apiService.getRandomHadith()
        }
    }
    
    private func shareHadith(_ hadith: Hadith) {
        let shareText = """
        \(hadith.translation)
        
        — \(hadith.narrator)
        \(hadith.reference) (\(hadith.grade))
        """
        
        let activityVC = UIActivityViewController(
            activityItems: [shareText],
            applicationActivities: nil
        )
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(activityVC, animated: true)
        }
    }
}
```

### Hadith Display View
```swift
struct HadithDisplayView: View {
    let hadith: Hadith
    let fontSize: Double
    let showArabic: Bool
    let showTranslation: Bool
    let isBookmarked: Bool
    let onBookmark: () -> Void
    let onShare: () -> Void
    let onPlayAudio: () -> Void
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                HadithHeaderView(hadith: hadith)
                
                // Arabic Text
                if showArabic {
                    VStack(alignment: .trailing, spacing: 8) {
                        Text(hadith.arabicText)
                            .font(.custom("Arabic", size: fontSize + 4))
                            .lineSpacing(8)
                            .multilineTextAlignment(.trailing)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(12)
                    }
                }
                
                // Translation
                if showTranslation {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(hadith.translation)
                            .font(.system(size: fontSize))
                            .lineSpacing(4)
                            .padding()
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(12)
                    }
                }
                
                // Hadith Details
                HadithDetailsView(hadith: hadith)
                
                // Action Buttons
                HStack(spacing: 16) {
                    Button(action: onBookmark) {
                        Label(
                            isBookmarked ? "Bookmarked" : "Bookmark",
                            systemImage: isBookmarked ? "bookmark.fill" : "bookmark"
                        )
                    }
                    .buttonStyle(.bordered)
                    
                    Button(action: onPlayAudio) {
                        Label("Listen", systemImage: "play.circle")
                    }
                    .buttonStyle(.bordered)
                    
                    Button(action: onShare) {
                        Label("Share", systemImage: "square.and.arrow.up")
                    }
                    .buttonStyle(.bordered)
                    
                    Spacer()
                }
                .padding(.top)
            }
            .padding()
        }
    }
}

struct HadithHeaderView: View {
    let hadith: Hadith
    
    var body: some View {
        VStack(spacing: 8) {
            Text(hadith.collection)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text(hadith.book)
                .font(.headline)
                .foregroundColor(.secondary)
            
            if !hadith.chapter.isEmpty {
                Text(hadith.chapter)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            HStack {
                Text("Hadith \(hadith.hadithNumber)")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(8)
                
                Text(hadith.grade)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(hadith.isAuthentic ? Color.green.opacity(0.2) : Color.orange.opacity(0.2))
                    .foregroundColor(hadith.isAuthentic ? .green : .orange)
                    .cornerRadius(8)
            }
        }
        .multilineTextAlignment(.center)
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
}

struct HadithDetailsView: View {
    let hadith: Hadith
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            DetailRow(title: "Narrator", value: hadith.narrator)
            DetailRow(title: "Grade", value: hadith.grade)
            DetailRow(title: "Reference", value: hadith.reference)
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
}

struct DetailRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.subheadline)
                .foregroundColor(.primary)
        }
    }
}
```

### Search View
```swift
struct HadithSearchView: View {
    @ObservedObject var apiService: HadithAPIService
    @Environment(\.dismiss) private var dismiss
    
    @State private var searchText = ""
    @State private var selectedCollection: String?
    @State private var searchSuggestions = [
        "prayer", "charity", "kindness", "patience", "forgiveness",
        "parents", "knowledge", "faith", "worship", "brotherhood"
    ]
    
    var body: some View {
        NavigationView {
            VStack {
                // Search Bar
                HStack {
                    TextField("Search hadiths...", text: $searchText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .onSubmit {
                            performSearch()
                        }
                    
                    Button("Search") {
                        performSearch()
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(searchText.isEmpty)
                }
                .padding()
                
                // Search Suggestions
                if searchText.isEmpty {
                    SearchSuggestionsView(
                        suggestions: searchSuggestions,
                        onSuggestionTap: { suggestion in
                            searchText = suggestion
                            performSearch()
                        }
                    )
                }
                
                // Search Results
                if apiService.isLoading {
                    ProgressView("Searching...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if !apiService.searchResults.isEmpty {
                    List(apiService.searchResults) { hadith in
                        HadithSearchResultRow(hadith: hadith) {
                            apiService.currentHadith = hadith
                            dismiss()
                        }
                    }
                } else if !searchText.isEmpty {
                    ContentUnavailableView(
                        "No Results",
                        systemImage: "magnifyingglass",
                        description: Text("Try different keywords like 'prayer', 'charity', or 'kindness'")
                    )
                }
                
                Spacer()
            }
            .navigationTitle("Search Hadiths")
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
    
    private func performSearch() {
        guard !searchText.isEmpty else { return }
        
        Task {
            await apiService.searchHadiths(
                query: searchText,
                collection: selectedCollection
            )
        }
    }
}

struct HadithSearchResultRow: View {
    let hadith: Hadith
    let onTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(hadith.collection)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.blue)
                
                Spacer()
                
                Text(hadith.reference)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(hadith.translation)
                .font(.subheadline)
                .lineLimit(3)
                .multilineTextAlignment(.leading)
            
            Text("— \(hadith.narrator)")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .onTapGesture {
            onTap()
        }
    }
}
```

### Audio Manager
```swift
class HadithAudioManager: ObservableObject {
    @Published var isPlaying = false
    @Published var currentHadith: Hadith?
    
    private var audioPlayer: AVAudioPlayer?
    private let synthesizer = AVSpeechSynthesizer()
    
    func playHadith(_ hadith: Hadith) {
        currentHadith = hadith
        
        // Use Text-to-Speech for hadith translation
        let utterance = AVSpeechUtterance(string: hadith.translation)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.5
        utterance.pitchMultiplier = 1.0
        utterance.volume = 1.0
        
        synthesizer.speak(utterance)
        isPlaying = true
        
        // Monitor speech completion
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            if !self.synthesizer.isSpeaking {
                self.isPlaying = false
            }
        }
    }
    
    func stopAudio() {
        synthesizer.stopSpeaking(at: .immediate)
        audioPlayer?.stop()
        isPlaying = false
    }
}
```

### Bookmark Manager
```swift
class HadithBookmarkManager: ObservableObject {
    @Published var bookmarks: [Hadith] = []
    
    private let userDefaults = UserDefaults.standard
    private let bookmarksKey = "hadith_bookmarks"
    
    init() {
        loadBookmarks()
    }
    
    func toggleBookmark(_ hadith: Hadith) {
        if isBookmarked(hadith.id) {
            removeBookmark(hadith.id)
        } else {
            addBookmark(hadith)
        }
    }
    
    func isBookmarked(_ hadithId: String) -> Bool {
        return bookmarks.contains { $0.id == hadithId }
    }
    
    private func addBookmark(_ hadith: Hadith) {
        bookmarks.append(hadith)
        saveBookmarks()
    }
    
    private func removeBookmark(_ hadithId: String) {
        bookmarks.removeAll { $0.id == hadithId }
        saveBookmarks()
    }
    
    private func saveBookmarks() {
        if let data = try? JSONEncoder().encode(bookmarks) {
            userDefaults.set(data, forKey: bookmarksKey)
        }
    }
    
    private func loadBookmarks() {
        if let data = userDefaults.data(forKey: bookmarksKey),
           let savedBookmarks = try? JSONDecoder().decode([Hadith].self, from: data) {
            bookmarks = savedBookmarks
        }
    }
}
```

## Local Storage & Offline Support

### Core Data Model
```swift
// HadithEntity+CoreDataClass.swift
@objc(HadithEntity)
public class HadithEntity: NSManagedObject {
    @NSManaged public var id: String
    @NSManaged public var collection: String
    @NSManaged public var arabicText: String
    @NSManaged public var translation: String
    @NSManaged public var narrator: String
    @NSManaged public var grade: String
    @NSManaged public var reference: String
    @NSManaged public var isBookmarked: Bool
    @NSManaged public var dateAdded: Date
}
```

### Search Functionality
```swift
extension HadithAPIService {
    func searchOfflineHadiths(query: String) -> [Hadith] {
        // Implement local search in cached hadiths
        let keywords = query.lowercased().components(separatedBy: .whitespaces)
        
        return offlineHadiths.filter { hadith in
            let searchText = "\(hadith.translation) \(hadith.narrator) \(hadith.collection)".lowercased()
            return keywords.allSatisfy { keyword in
                searchText.contains(keyword)
            }
        }
    }
}
```

## Testing Requirements

### Unit Tests
- [ ] API service methods
- [ ] Search functionality
- [ ] Bookmark management
- [ ] Audio playback
- [ ] Data model validation

### Integration Tests
- [ ] API fallback strategy
- [ ] Offline mode functionality
- [ ] Search across collections
- [ ] Audio synthesis

### UI Tests
- [ ] Collection selection
- [ ] Hadith display
- [ ] Search interface
- [ ] Bookmark functionality
- [ ] Settings persistence

This implementation guide provides everything needed to build a comprehensive Hadith reader for iOS that matches the web application's functionality while providing native iOS features like Text-to-Speech, bookmarking, and offline support.