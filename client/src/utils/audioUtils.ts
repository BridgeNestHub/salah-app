// Audio utility functions for Quran reader

export interface AudioSource {
  primary: string;
  fallback: string;
}

export const getReciterCode = (reciterId: number): string => {
  const reciterMap: { [key: number]: string } = {
    1: 'Abdul_Basit_Murattal_192kbps',
    2: 'Alafasy_128kbps', 
    3: 'Ghamadi_40kbps',
    4: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
    5: 'Hani_Rifai_192kbps'
  };
  return reciterMap[reciterId] || 'Alafasy_128kbps';
};

export const getAudioSources = (surahNumber: number, ayahNumber: number, reciterId: number): AudioSource => {
  const reciterCode = getReciterCode(reciterId);
  const paddedSurah = surahNumber.toString().padStart(3, '0');
  const paddedAyah = ayahNumber.toString().padStart(3, '0');
  
  return {
    primary: `https://www.everyayah.com/data/${reciterCode}/${paddedSurah}${paddedAyah}.mp3`,
    fallback: `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`
  };
};

export const getBismillahSources = (reciterId: number): AudioSource => {
  const reciterCode = getReciterCode(reciterId);
  
  return {
    primary: `https://www.everyayah.com/data/${reciterCode}/001001.mp3`,
    fallback: `https://server8.mp3quran.net/afs/001.mp3`
  };
};

export const validateAudioUrl = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is ok and content type is audio
    const contentType = response.headers.get('content-type');
    return response.ok && Boolean(contentType && (contentType.includes('audio') || contentType.includes('mpeg')));
  } catch (error) {
    console.warn('Audio validation failed for:', url);
    return false;
  }
};

export const preloadAudio = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onSuccess);
      audio.removeEventListener('error', onError);
    };
    
    const onSuccess = () => {
      cleanup();
      resolve(true);
    };
    
    const onError = () => {
      cleanup();
      resolve(false);
    };
    
    audio.addEventListener('canplaythrough', onSuccess);
    audio.addEventListener('error', onError);
    
    audio.src = url;
  });
};

export const getWorkingAudioUrl = async (sources: AudioSource, retries = 2): Promise<string | null> => {
  // Try primary source first
  for (let i = 0; i <= retries; i++) {
    if (await validateAudioUrl(sources.primary)) {
      return sources.primary;
    }
    if (i < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
    }
  }
  
  // Try fallback source
  for (let i = 0; i <= retries; i++) {
    if (await validateAudioUrl(sources.fallback)) {
      return sources.fallback;
    }
    if (i < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
    }
  }
  
  return null;
};

export const createAudioElement = (): HTMLAudioElement => {
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.crossOrigin = 'anonymous';
  return audio;
};