class AthanNotificationService {
  private audio: HTMLAudioElement | null = null;
  private notificationPermission: NotificationPermission = 'default';
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private audioInitialized = false;
  private isPlaying = false;
  private userInteracted = false;
  private wakeLock: any = null;

  constructor() {
    this.initializeAudio();
    this.requestNotificationPermission();
    this.setupPageInteractionListeners();
    this.setupUserInteractionDetection();
  }

  private initializeAudio() {
    this.audio = new Audio('/athan.mp3');
    this.audio.preload = 'auto';
    this.audio.volume = 0.8;
    this.audio.crossOrigin = 'anonymous';
    
    // Mobile Safari specific settings
    this.audio.setAttribute('playsinline', 'true');
    this.audio.setAttribute('webkit-playsinline', 'true');
    
    this.audio.onerror = () => {
      console.warn('Athan audio file not found. Please add athan.mp3 to /public/ folder.');
    };

    this.audio.oncanplaythrough = () => {
      this.audioInitialized = true;
    };

    this.audio.onplay = () => {
      this.isPlaying = true;
      this.requestWakeLock();
    };

    this.audio.onended = () => {
      this.isPlaying = false;
      this.releaseWakeLock();
    };

    this.audio.onpause = () => {
      this.isPlaying = false;
      this.releaseWakeLock();
    };
  }

  private setupUserInteractionDetection() {
    const events = ['click', 'touchstart', 'keydown'];
    const handleInteraction = () => {
      if (!this.userInteracted) {
        this.userInteracted = true;
        this.initializeAudioContext();
        events.forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });
  }

  private async initializeAudioContext() {
    if (this.audio && this.userInteracted) {
      try {
        // Create and resume audio context for mobile browsers
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioContext = new AudioContext();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
        }
        
        // Preload audio on user interaction
        this.audio.load();
        await this.audio.play();
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audioInitialized = true;
      } catch (error) {
        console.log('Audio context initialization failed:', error);
      }
    }
  }

  private async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
      }
    } catch (error) {
      console.log('Wake lock failed:', error);
    }
  }

  private releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  private async requestNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  public async scheduleAthanNotifications(prayerTimes: any) {
    this.clearScheduledNotifications();

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();

    prayers.forEach(prayer => {
      const prayerTime = prayerTimes[prayer];
      if (!prayerTime) return;

      const [hours, minutes] = prayerTime.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      // If prayer time has passed today, schedule for tomorrow
      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      const timeUntilPrayer = prayerDate.getTime() - now.getTime();
      
      if (timeUntilPrayer > 0) {
        const timeoutId = setTimeout(() => {
          this.playAthanNotification(prayer);
        }, timeUntilPrayer);

        this.scheduledNotifications.set(prayer, timeoutId);
      }
    });
  }

  private async playAthanNotification(prayerName: string) {
    // Multiple fallback strategies for audio playback
    let audioPlayed = false;
    
    if (this.audio && (this.audioInitialized || this.userInteracted)) {
      try {
        // Ensure audio is loaded
        if (this.audio.readyState < 2) {
          await new Promise((resolve) => {
            this.audio!.addEventListener('canplaythrough', resolve, { once: true });
            this.audio!.load();
          });
        }
        
        this.audio.currentTime = 0;
        await this.audio.play();
        audioPlayed = true;
        console.log('Athan sound played for', prayerName);
      } catch (error) {
        console.log('Primary audio play failed:', error);
        
        // Fallback: Create new audio element
        try {
          const fallbackAudio = new Audio('/athan.mp3');
          fallbackAudio.volume = this.audio.volume;
          await fallbackAudio.play();
          audioPlayed = true;
          console.log('Fallback audio played for', prayerName);
        } catch (fallbackError) {
          console.log('Fallback audio also failed:', fallbackError);
        }
      }
    }

    // Show browser notification (works even when audio fails)
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(`${prayerName} Prayer Time`, {
        body: `It's time for ${prayerName} prayer`,
        icon: '/favicon.ico',
        tag: `athan-${prayerName}`,
        requireInteraction: true,
        silent: audioPlayed // Don't play notification sound if athan played
      });
      
      // Auto-close notification after 30 seconds
      setTimeout(() => notification.close(), 30000);
    }

    // Show in-app notification with audio status
    this.showInAppNotification(prayerName, audioPlayed);
    
    // Vibrate on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  }

  private showInAppNotification(prayerName: string, audioPlayed: boolean = false) {
    const notification = document.createElement('div');
    notification.className = 'athan-notification';
    notification.innerHTML = `
      <div class="athan-notification-content">
        <h3>🕌 ${prayerName} Prayer Time</h3>
        <p>It's time for ${prayerName} prayer</p>
        ${!audioPlayed ? '<p class="audio-note">🔇 Audio unavailable - please enable sound</p>' : ''}
        <div class="notification-actions">
          <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
          ${!audioPlayed ? '<button onclick="window.athanService?.testAthansound()">Test Audio</button>' : ''}
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Make service available globally for button click
    (window as any).athanService = this;
    
    // Auto-remove after 60 seconds (longer for audio issues)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 60000);
  }

  public clearScheduledNotifications() {
    this.scheduledNotifications.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  public setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  private setupPageInteractionListeners() {
    // Stop Athan on any click (but not during test)
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.test-button') && !target.closest('.athan-notification')) {
        this.stopAudio();
      }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isPlaying) {
        // Page became visible while athan is playing - keep playing
        console.log('Page visible, athan continues');
      }
    });

    // Handle page focus
    window.addEventListener('focus', () => {
      if (this.isPlaying) {
        console.log('Page focused, athan continues');
      }
    });
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.releaseWakeLock();
    });
  }

  private stopAudio() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      this.releaseWakeLock();
      console.log('Athan stopped due to user interaction');
    }
  }

  public async testAthansound() {
    this.userInteracted = true;
    
    if (this.audio) {
      try {
        await this.initializeAudioContext();
        this.audio.currentTime = 0;
        await this.audio.play();
        this.audioInitialized = true;
        console.log('Test sound played successfully');
        alert('✅ Athan sound test successful! Notifications will work.');
      } catch (error) {
        console.error('Failed to play Athan sound:', error);
        
        // Try creating a new audio element
        try {
          const testAudio = new Audio('/athan.mp3');
          testAudio.volume = this.audio.volume;
          await testAudio.play();
          this.audioInitialized = true;
          alert('✅ Athan sound test successful! Notifications will work.');
        } catch (fallbackError) {
          alert('❌ Audio blocked by browser. Please:\n1. Enable sound in browser settings\n2. Make sure device is not on silent mode\n3. Try refreshing the page');
        }
      }
    }
  }
}

export const athanService = new AthanNotificationService();