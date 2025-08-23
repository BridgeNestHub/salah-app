import React, { useState, useEffect } from 'react';
import { FaBookmark, FaTrash, FaEye } from 'react-icons/fa';

interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  timestamp: number;
}

interface BookmarkManagerProps {
  onNavigateToBookmark: (surahNumber: number, ayahNumber: number) => void;
}

const BookmarkManager = React.forwardRef<any, BookmarkManagerProps>(({ onNavigateToBookmark }, ref) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    const saved = localStorage.getItem('quran-bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    localStorage.setItem('quran-bookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  };

  const addBookmark = (surahNumber: number, ayahNumber: number, surahName: string, ayahText: string) => {
    const bookmark: Bookmark = {
      id: `${surahNumber}-${ayahNumber}-${Date.now()}`,
      surahNumber,
      ayahNumber,
      surahName,
      ayahText: ayahText.substring(0, 100) + '...',
      timestamp: Date.now()
    };

    const newBookmarks = [...bookmarks, bookmark];
    saveBookmarks(newBookmarks);
  };

  React.useImperativeHandle(ref, () => ({
    addBookmark
  }));

  const removeBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks(newBookmarks);
  };

  const handleNavigate = (surahNumber: number, ayahNumber: number) => {
    onNavigateToBookmark(surahNumber, ayahNumber);
    setIsOpen(false);
  };

  return (
    <div className="bookmark-manager">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-green-700 transition-colors z-50"
      >
        <FaBookmark />
        {bookmarks.length > 0 && (
          <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {bookmarks.length}
          </span>
        )}
      </button>

      {/* Bookmark Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-40 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Bookmarks</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-4">
            {bookmarks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FaBookmark className="mx-auto text-4xl mb-4 opacity-50" />
                <p>No bookmarks yet</p>
                <p className="text-sm">Click the bookmark icon on any ayah to save it</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-green-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-800">
                        {bookmark.surahName} {bookmark.surahNumber}:{bookmark.ayahNumber}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleNavigate(bookmark.surahNumber, bookmark.ayahNumber)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Go to ayah"
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          onClick={() => removeBookmark(bookmark.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Remove bookmark"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {new Date(bookmark.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {bookmark.ayahText}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});

export default BookmarkManager;