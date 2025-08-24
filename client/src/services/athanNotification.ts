class AthanNotificationService {
  private audio: HTMLAudioElement | null = null;
  private notificationPermission: NotificationPermission = 'default';
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private audioInitialized = false;
  private isPlaying = false;

  constructor() {
    this.initializeAudio();
    this.requestNotificationPermission();
    this.setupPageInteractionListeners();
  }

  private initializeAudio() {
    this.audio = new Audio('/athan.mp3');
    this.audio.preload = 'auto';
    this.audio.volume = 0.8;
    
    // Handle audio loading errors
    this.audio.onerror = () => {
      console.warn('Athan audio file not found. Please add athan.mp3 to /public/ folder.');
    };

    // Initialize audio context on first user interaction
    this.audio.oncanplaythrough = () => {
      this.audioInitialized = true;
    };

    this.audio.onplay = () => {
      this.isPlaying = true;
    };

    this.audio.onended = () => {
      this.isPlaying = false;
    };

    this.audio.onpause = () => {
      this.isPlaying = false;
    };
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
    // Play Athan sound
    if (this.audio && this.audioInitialized) {
      try {
        this.audio.currentTime = 0; // Reset to beginning
        await this.audio.play();
        console.log('Athan sound played for', prayerName);
      } catch (error) {
        console.log('Audio play failed:', error);
        // Fallback: show alert if audio fails
        alert(`🕌 ${prayerName} Prayer Time - Audio unavailable`);
      }
    } else {
      console.log('Audio not initialized, showing alert instead');
      alert(`🕌 ${prayerName} Prayer Time`);
    }

    // Show browser notification
    if (this.notificationPermission === 'granted') {
      new Notification(`${prayerName} Prayer Time`, {
        body: `It's time for ${prayerName} prayer`,
        icon: '/favicon.ico',
        tag: `athan-${prayerName}`,
        requireInteraction: true
      });
    }

    // Show in-app notification
    this.showInAppNotification(prayerName);
  }

  private showInAppNotification(prayerName: string) {
    const notification = document.createElement('div');
    notification.className = 'athan-notification';
    notification.innerHTML = `
      <div class="athan-notification-content">
        <h3>🕌 ${prayerName} Prayer Time</h3>
        <p>It's time for ${prayerName} prayer</p>
        <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 30000);
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
    // Stop Athan on any click
    document.addEventListener('click', () => {
      this.stopAudio();
    });

    // Stop Athan when page becomes visible (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.stopAudio();
      }
    });

    // Stop Athan on page focus
    window.addEventListener('focus', () => {
      this.stopAudio();
    });
  }

  private stopAudio() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      console.log('Athan stopped due to user interaction');
    }
  }

  public async testAthansound() {
    if (this.audio) {
      try {
        this.audio.currentTime = 0;
        await this.audio.play();
        this.audioInitialized = true;
        console.log('Test sound played successfully');
      } catch (error) {
        console.error('Failed to play Athan sound:', error);
        alert('Audio blocked by browser. Click this button again to enable sound.');
        
        // Try to load and play again
        this.audio.load();
      }
    }
  }
}

export const athanService = new AthanNotificationService();